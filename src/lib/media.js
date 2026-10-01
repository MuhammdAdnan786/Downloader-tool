import ytdl from "@distube/ytdl-core";
import { execFile } from "child_process";
import { createRequire } from "module";
import { mkdtemp, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
const requireFromProject = createRequire(path.join(process.cwd(), "package.json"));

const INFO_TTL = 5 * 60 * 1000; // stream URLs kaafi der valid rehte hain
const YTDL_TIMEOUT = 20000;
const YTDL_COOLDOWN = 10000;

/* ---------------- helpers ---------------- */

export function detectPlatform(url = "") {
  let hostname;
  try {
    const parsed = new URL(String(url).trim());
    if (parsed.protocol !== "https:") return "unknown";
    hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "unknown";
  }

  if (
    hostname === "youtu.be" ||
    hostname === "youtube.com" ||
    hostname.endsWith(".youtube.com") ||
    hostname === "youtube-nocookie.com" ||
    hostname.endsWith(".youtube-nocookie.com")
  ) return "youtube";
  if (
    hostname === "fb.watch" ||
    hostname.endsWith(".fb.watch") ||
    hostname === "facebook.com" ||
    hostname.endsWith(".facebook.com") ||
    hostname === "fb.com" ||
    hostname.endsWith(".fb.com")
  ) return "facebook";
  return "unknown";
}

export function normalizeUrl(url = "") {
  return String(url).trim();
}

export function safeFileName(title, extension = "mp4") {
  const cleanTitle = String(title || "download")
    .replace(/[<>:"/\\|?*]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const ext = String(extension || "mp4").replace(/^\./, "");
  const name = (cleanTitle || "download").slice(0, 110);

  return `${name}.${ext}`;
}

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/* ---------------- in-memory cache + in-flight dedupe ---------------- */

const cache = new Map();
const inflight = new Map();

async function cached(key, ttl, loader) {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;
  if (inflight.has(key)) return inflight.get(key);

  const promise = (async () => {
    try {
      const value = await loader();
      if (cache.size >= 100) {
        const now = Date.now();
        for (const [k, v] of cache) if (v.expires <= now) cache.delete(k);
        if (cache.size >= 100) cache.delete(cache.keys().next().value);
      }
      cache.set(key, { value, expires: Date.now() + ttl });
      return value;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
}

/* ---------------- yt-dlp ---------------- */

let binaryPromise = null;
let cookieArgsPromise = null;

function getYtDlpCookieArgs() {
  const encodedCookies = process.env.YOUTUBE_COOKIES_BASE64?.replace(/\s/g, "");
  if (!encodedCookies) return Promise.resolve([]);
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(encodedCookies)) {
    return Promise.reject(new Error("YOUTUBE_COOKIES_BASE64 must be base64-encoded."));
  }

  if (!cookieArgsPromise) {
    cookieArgsPromise = (async () => {
      const cookieText = Buffer.from(encodedCookies, "base64").toString("utf8");
      const hasNetscapeHeader = /^#(?: Netscape)? HTTP Cookie File/m.test(cookieText);
      const hasCookieEntries = cookieText.split(/\r?\n/).some((line) => line && !line.startsWith("#"));
      if (!hasNetscapeHeader || !hasCookieEntries) {
        throw new Error("YOUTUBE_COOKIES_BASE64 must decode to a Netscape-format YouTube cookies file.");
      }

      const directory = await mkdtemp(path.join(tmpdir(), "yt-dlp-cookies-"));
      const cookiePath = path.join(directory, "cookies.txt");
      await writeFile(cookiePath, cookieText, { encoding: "utf8", mode: 0o600, flag: "wx" });
      return ["--cookies", cookiePath];
    })().catch((error) => {
      cookieArgsPromise = null;
      throw error;
    });
  }

  return cookieArgsPromise;
}

async function findYtDlpBinary() {
  let packageBinary = null;
  try {
    const packageEntry = requireFromProject.resolve("youtube-dl-exec");
    packageBinary = path.resolve(
      path.dirname(packageEntry),
      "..",
      "bin",
      process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp"
    );
  } catch {
    // Fall through to known project and PATH locations.
  }

  const candidates = [
    ...(packageBinary ? [packageBinary] : []),
    path.join(
      process.cwd(),
      "node_modules",
      "youtube-dl-exec",
      "bin",
      process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp"
    ),
    ...(process.platform === "win32"
      ? [
          path.join(process.cwd(), "public", "bin", "yt-dlp.exe"),
          path.join(process.cwd(), "bin", "yt-dlp.exe"),
        ]
      : [
          path.join(process.cwd(), "public", "bin", "yt-dlp"),
          path.join(process.cwd(), "bin", "yt-dlp"),
        ]),
    "yt-dlp",
  ];

  for (const candidate of candidates) {
    try {
      await execFileAsync(candidate, ["--version"], { timeout: 5000 });
      return candidate;
    } catch {
      // next candidate
    }
  }
  return null;
}

// Binary path ek baar dhoondh kar cache hota hai (har request pe process spawn nahi hota)
export async function resolveYtDlpBinary() {
  if (!binaryPromise) {
    binaryPromise = findYtDlpBinary().then((binary) => {
      if (!binary) binaryPromise = null; // na mile to agli baar dobara try
      return binary;
    });
  }
  return binaryPromise;
}

const RETRYABLE =
  /The page needs to be reloaded|rate limit|429|temporary failure|Unable to extract|extraction|network|timed out/i;

async function runYtDlp(attempts) {
  const binary = await resolveYtDlpBinary();
  if (!binary) {
    throw new Error("yt-dlp is not installed or not available on this server.");
  }

  let lastError = null;
  for (const args of attempts) {
    try {
      return await execFileAsync(binary, args, {
        maxBuffer: 25 * 1024 * 1024,
        timeout: 12000,
      });
    } catch (error) {
      lastError = error;
      const message = `${error?.stderr || ""} ${error?.message || ""}`;
      const safeDetails = message
        .replace(/https?:\/\/[^\s"'<>]+/gi, "[media-url]")
        .slice(-800);
      console.error("yt-dlp attempt failed", {
        code: error?.code || null,
        errno: error?.errno || null,
        signal: error?.signal || null,
        killed: Boolean(error?.killed),
        details: safeDetails,
      });
      if (!error?.killed && !RETRYABLE.test(message)) throw error;
    }
  }
  throw lastError || new Error("yt-dlp failed after retry attempts.");
}

const BASE_FLAGS = [
  "--no-warnings",
  "--no-check-certificates",
  "--no-playlist",
  "--socket-timeout", "10",
  "--extractor-retries", "1",
];

async function jsonAttempts(url, platform) {
  const cookieArgs = platform === "youtube" ? await getYtDlpCookieArgs() : [];
  const flags = [...BASE_FLAGS, ...cookieArgs];
  const plain = [...flags, "--dump-json", url];
  if (platform !== "youtube") return [plain]; // Facebook pe YouTube clients ka koi faida nahi

  const withClient = (client) => [
    ...flags,
    "--extractor-args", `youtube:player_client=${client}`,
    "--dump-json",
    url,
  ];
  return [withClient("android,web,default"), withClient("tv_embedded"), plain];
}

// yt-dlp ka JSON ek baar nikalo, phir info / download / audio sab isi se
function getYtDlpData(url) {
  return cached(`ytdlp:${url}`, INFO_TTL, async () => {
    const { stdout } = await runYtDlp(await jsonAttempts(url, detectPlatform(url)));
    return JSON.parse(stdout);
  });
}

/* ---------------- ytdl-core ---------------- */

let ytdlSkipUntil = 0;

function getYtdlInfo(url) {
  return cached(`ytdl:${url}`, INFO_TTL, () =>
    withTimeout(ytdl.getInfo(url), YTDL_TIMEOUT, "ytdl")
  );
}

// ytdl toot jaye to 60 sec tak skip karo taake har request 8 sec na latke
async function tryYtdlInfo(url) {
  if (
    process.env.NETLIFY === "true" ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT
  ) {
    return null;
  }
  if (Date.now() < ytdlSkipUntil) return null;
  try {
    return await getYtdlInfo(url);
  } catch (error) {
    console.warn("YouTube primary extractor failed", {
      code: error?.code || null,
      timedOut: /timed out/i.test(error?.message || ""),
    });
    ytdlSkipUntil = Date.now() + YTDL_COOLDOWN;
    return null;
  }
}

/* ---------------- format mapping ---------------- */

function compareFormats(a, b) {
  if (a.resolution === "audio" && b.resolution !== "audio") return 1;
  if (b.resolution === "audio" && a.resolution !== "audio") return -1;
  if (a.resolution !== "audio" && b.resolution !== "audio") {
    const aValue = Number.parseInt(a.resolution, 10) || 0;
    const bValue = Number.parseInt(b.resolution, 10) || 0;
    if (aValue !== bValue) return bValue - aValue;
  }
  if (a.progressive !== b.progressive) return a.progressive ? -1 : 1;
  return Number(b.tbr || 0) - Number(a.tbr || 0);
}

function buildResult(platform, url, meta, formats) {
  const sorted = formats.sort(compareFormats);
  return {
    platform,
    ...meta,
    formats: sorted.slice(0, 40),
    bestFormat: sorted.find((item) => item.progressive) || sorted[0] || null,
    sourceUrl: url,
  };
}

function fromYtdl(platform, url, info) {
  const formats = info.formats
    .filter((format) => format.url && !format.isLive && format.hasVideo !== false)
    .map((format) => ({
      format_id: String(format.itag),
      url: format.url,
      ext: format.container || format.mimeType?.split(";")[0]?.split("/")[1] || "mp4",
      resolution: format.height ? `${format.height}p` : "audio",
      fps: format.fps || null,
      filesize: format.contentLength || null,
      vcodec: format.hasVideo ? format.codecs?.[0] || "default" : "none",
      acodec: format.hasAudio ? format.audioCodec || "default" : "none",
      progressive: Boolean(format.hasVideo && format.hasAudio),
      quality: format.qualityLabel || format.audioQuality || null,
      tbr: format.averageBitrate || null,
    }));

  const thumbs = info.videoDetails.thumbnails;
  return buildResult(
    platform,
    url,
    {
      title: info.videoDetails.title,
      thumbnail: thumbs?.[thumbs.length - 1]?.url || "",
      duration: Number(info.videoDetails.lengthSeconds || 0),
      uploader: info.videoDetails.ownerChannelName || "",
    },
    formats
  );
}

function fromYtDlp(platform, url, data) {
  const formats = (data.formats || [])
    .filter((format) => {
      if (!format || format.is_live) return false;
      if (format.protocol && !/https?/i.test(format.protocol)) return false;
      return Boolean(format.vcodec || format.acodec || format.height || format.abr);
    })
    .map((format) => ({
      format_id: String(format.format_id),
      url: format.url,
      ext: format.ext || "mp4",
      resolution: format.height ? `${format.height}p` : "audio",
      fps: format.fps || null,
      filesize: format.filesize || format.filesize_approx || null,
      vcodec: format.vcodec || "none",
      acodec: format.acodec || "none",
      progressive: Boolean(
        format.vcodec && format.acodec && format.vcodec !== "none" && format.acodec !== "none"
      ),
      quality: format.format_note || null,
      tbr: format.tbr || null,
    }));

  return buildResult(
    platform,
    url,
    {
      title: data.title || "Untitled media",
      thumbnail: data.thumbnail || "",
      duration: data.duration || 0,
      uploader: data.uploader || "",
    },
    formats
  );
}

/* ---------------- public API ---------------- */

export async function fetchMediaInfo(url) {
  return cached(`info:${url}`, INFO_TTL, async () => {
    const platform = detectPlatform(url);

    if (platform === "youtube") {
      const info = await tryYtdlInfo(url);
      if (info) return fromYtdl(platform, url, info);
    }

    return fromYtDlp(platform, url, await getYtDlpData(url));
  });
}

export async function getDirectDownloadUrl(url, formatId) {
  if (detectPlatform(url) === "youtube") {
    const info = await tryYtdlInfo(url);
    if (info) {
      let format = info.formats.find((f) => String(f.itag) === String(formatId));
      if (!format) {
        try {
          format = ytdl.chooseFormat(info.formats, {
            quality: "highest",
            filter: formatId === "audio" ? "audioonly" : "audioandvideo",
          });
        } catch {
          format = null;
        }
      }
      if (format?.url) return format.url;
    }
  }

  const data = await getYtDlpData(url);
  const list = (data.formats || []).filter((f) => f?.url);
  const selected =
    list.find((f) => String(f.format_id) === String(formatId)) ||
    list
      .filter((f) => f.vcodec && f.vcodec !== "none" && f.acodec && f.acodec !== "none")
      .sort((a, b) => (b.height || 0) - (a.height || 0))[0] ||
    list[list.length - 1];

  if (!selected?.url) {
    throw new Error("No direct download URL was generated for the selected format.");
  }
  return selected.url;
}

export async function getBestAudio(url) {
  if (detectPlatform(url) === "youtube") {
    const info = await tryYtdlInfo(url);
    if (info) {
      try {
        const format = ytdl.chooseFormat(info.formats, {
          quality: "highestaudio",
          filter: "audioonly",
        });
        if (format?.url) {
          const container = format.container || "m4a";
          return { url: format.url, ext: container === "mp4" ? "m4a" : container };
        }
      } catch {
        // yt-dlp fallback neeche
      }
    }
  }

  const data = await getYtDlpData(url);
  const audio = (data.formats || [])
    .filter((f) => f?.url && f.vcodec === "none" && f.acodec && f.acodec !== "none")
    .sort((a, b) => {
      const aM4a = a.ext === "m4a" ? 1 : 0;
      const bM4a = b.ext === "m4a" ? 1 : 0;
      if (aM4a !== bM4a) return bM4a - aM4a;
      return (b.abr || b.tbr || 0) - (a.abr || a.tbr || 0);
    })[0];

  if (!audio) throw new Error("No audio stream was found for this URL.");
  return { url: audio.url, ext: audio.ext || "m4a" };
}

export async function getBestAudioUrl(url) {
  return (await getBestAudio(url)).url;
}