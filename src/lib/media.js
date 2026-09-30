import ytdl from "@distube/ytdl-core";
import { execFile } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

/* ---------------- config ---------------- */

const IS_SERVERLESS = Boolean(
  process.env.NETLIFY ||
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT
);

const INFO_TTL = 5 * 60 * 1000;
const YTDL_TIMEOUT = IS_SERVERLESS ? 5500 : 12000; // Netlify 10 sec se kam
const YTDL_COOLDOWN = 30 * 1000;
const COBALT_TIMEOUT = IS_SERVERLESS ? 3500 : 10000;
const YTDLP_TIMEOUT = 15000;

const PROXY_URL = process.env.YT_PROXY_URL; // http://user:pass@host:port
const COOKIES = process.env.YT_COOKIES; // JSON array (ytdl cookies)
const COBALT_API_URL = process.env.COBALT_API_URL; // apna cobalt instance
const COBALT_API_KEY = process.env.COBALT_API_KEY; // optional
const COBALT_ENABLED = Boolean(COBALT_API_URL);
const CAN_USE_YTDLP = !IS_SERVERLESS; // Netlify/Vercel par yt-dlp nahi hota

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

/* ---------------- yt-dlp (sirf VPS/Docker/local par) ---------------- */

let binaryPromise = null;

async function findYtDlpBinary() {
  const isWin = process.platform === "win32";
  const candidates = [
    "yt-dlp",
    path.join(process.cwd(), "node_modules", "youtube-dl-exec", "bin", isWin ? "yt-dlp.exe" : "yt-dlp"),
    path.join(process.cwd(), "public", "bin", isWin ? "yt-dlp.exe" : "yt-dlp"),
    path.join(process.cwd(), "bin", isWin ? "yt-dlp.exe" : "yt-dlp"),
  ];

  for (const candidate of candidates) {
    try {
      if (candidate === "yt-dlp") {
        await execFileAsync(candidate, ["--version"]);
        return candidate;
      }
      await fs.access(candidate);
      return candidate;
    } catch {
      // next candidate
    }
  }
  return null;
}

export async function resolveYtDlpBinary() {
  if (!binaryPromise) {
    binaryPromise = findYtDlpBinary().then((binary) => {
      if (!binary) binaryPromise = null;
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
        timeout: YTDLP_TIMEOUT,
      });
    } catch (error) {
      lastError = error;
      const message = `${error?.stderr || ""} ${error?.message || ""}`;
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
  ...(PROXY_URL ? ["--proxy", PROXY_URL] : []),
];

function jsonAttempts(url, platform) {
  const plain = [...BASE_FLAGS, "--dump-json", url];
  if (platform !== "youtube") return [plain];

  const withClient = (client) => [
    ...BASE_FLAGS,
    "--extractor-args", `youtube:player_client=${client}`,
    "--dump-json",
    url,
  ];
  return [withClient("android,web,default"), withClient("tv_embedded"), plain];
}

function getYtDlpData(url) {
  return cached(`ytdlp:${url}`, INFO_TTL, async () => {
    const { stdout } = await runYtDlp(jsonAttempts(url, detectPlatform(url)));
    return JSON.parse(stdout);
  });
}

/* ---------------- ytdl-core ---------------- */

let ytdlSkipUntil = 0;
let ytAgent;

function getAgent() {
  if (ytAgent !== undefined) return ytAgent;
  try {
    const cookies = COOKIES ? JSON.parse(COOKIES) : undefined;
    if (PROXY_URL) ytAgent = ytdl.createProxyAgent({ uri: PROXY_URL }, cookies);
    else if (cookies) ytAgent = ytdl.createAgent(cookies);
    else ytAgent = null;
  } catch {
    ytAgent = null;
  }
  return ytAgent;
}

function getYtdlInfo(url) {
  return cached(`ytdl:${url}`, INFO_TTL, () =>
    withTimeout(
      ytdl.getInfo(url, {
        agent: getAgent() || undefined,
        playerClients: ["ANDROID", "IOS"],
      }),
      YTDL_TIMEOUT,
      "ytdl"
    )
  );
}

// ytdl fail ho to kuch der skip karo taake har request na latke
async function tryYtdlInfo(url) {
  if (Date.now() < ytdlSkipUntil) return null;
  try {
    return await getYtdlInfo(url);
  } catch {
    ytdlSkipUntil = Date.now() + YTDL_COOLDOWN;
    return null;
  }
}

/* ---------------- cobalt fallback + oEmbed ---------------- */

async function fetchOEmbed(url) {
  const res = await fetch(
    `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`,
    { signal: AbortSignal.timeout(4000) }
  );
  if (!res.ok) throw new Error("oembed failed");
  return res.json(); // { title, author_name, thumbnail_url }
}

function cobaltRequest(url, mode) {
  return cached(`cobalt:${mode}:${url}`, 2 * 60 * 1000, async () => {
    if (!COBALT_ENABLED) throw new Error("No fallback downloader is configured.");

    const headers = { Accept: "application/json", "Content-Type": "application/json" };
    if (COBALT_API_KEY) headers.Authorization = `Api-Key ${COBALT_API_KEY}`;

    const res = await withTimeout(
      fetch(COBALT_API_URL, {
        method: "POST",
        headers,
        signal: AbortSignal.timeout(COBALT_TIMEOUT),
        body: JSON.stringify({
          url,
          downloadMode: mode, // "auto" (video) ya "audio"
          videoQuality: "720",
          audioFormat: "mp3",
          filenameStyle: "basic",
        }),
      }),
      COBALT_TIMEOUT,
      "cobalt"
    );

    const data = await res.json().catch(() => null);
    if (!data) throw new Error("Fallback downloader returned an invalid response.");

    if ((data.status === "tunnel" || data.status === "redirect") && data.url) {
      return { url: data.url, filename: data.filename || "" };
    }
    if (data.status === "picker" && Array.isArray(data.picker)) {
      const item = data.picker.find((p) => p.type === "video") || data.picker[0];
      if (item?.url) return { url: item.url, filename: "" };
    }
    throw new Error(data?.error?.code || "Fallback downloader could not process this link.");
  });
}

function buildFallbackInfo(platform, url, meta) {
  const formats = [
    {
      format_id: "cobalt_video",
      url: null,
      ext: "mp4",
      resolution: "720p",
      fps: null,
      filesize: null,
      vcodec: "h264",
      acodec: "aac",
      progressive: true,
      quality: "720p",
      tbr: null,
    },
    {
      format_id: "cobalt_audio",
      url: null,
      ext: "mp3",
      resolution: "audio",
      fps: null,
      filesize: null,
      vcodec: "none",
      acodec: "mp3",
      progressive: false,
      quality: "audio",
      tbr: null,
    },
  ];

  return {
    platform,
    title: meta?.title || (platform === "youtube" ? "YouTube video" : "Video"),
    thumbnail: meta?.thumbnail_url || "",
    duration: 0,
    uploader: meta?.author_name || "",
    formats,
    bestFormat: formats[0],
    sourceUrl: url,
  };
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

    // oEmbed ytdl ke saath parallel chalta hai, taake waqt zaya na ho
    const oembedPromise =
      COBALT_ENABLED && platform === "youtube"
        ? fetchOEmbed(url).catch(() => null)
        : Promise.resolve(null);

    if (platform === "youtube") {
      const info = await tryYtdlInfo(url);
      if (info) return fromYtdl(platform, url, info);
    }

    let lastError = null;
    if (CAN_USE_YTDLP) {
      try {
        return fromYtDlp(platform, url, await getYtDlpData(url));
      } catch (error) {
        lastError = error;
      }
    }

    if (COBALT_ENABLED) {
      return buildFallbackInfo(platform, url, await oembedPromise);
    }

    throw (
      lastError ||
      new Error(
        "The video platform blocked or timed out on this server. Set YT_PROXY_URL or COBALT_API_URL."
      )
    );
  });
}

export async function getDirectDownloadUrl(url, formatId) {
  // fallback formats seedha cobalt se
  if (formatId === "cobalt_video") return (await cobaltRequest(url, "auto")).url;
  if (formatId === "cobalt_audio") return (await cobaltRequest(url, "audio")).url;

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

  let lastError = null;
  if (CAN_USE_YTDLP) {
    try {
      const data = await getYtDlpData(url);
      const list = (data.formats || []).filter((f) => f?.url);
      const selected =
        list.find((f) => String(f.format_id) === String(formatId)) ||
        list
          .filter((f) => f.vcodec && f.vcodec !== "none" && f.acodec && f.acodec !== "none")
          .sort((a, b) => (b.height || 0) - (a.height || 0))[0] ||
        list[list.length - 1];
      if (selected?.url) return selected.url;
    } catch (error) {
      lastError = error;
    }
  }

  if (COBALT_ENABLED) return (await cobaltRequest(url, "auto")).url;

  throw lastError || new Error("No direct download URL was generated for the selected format.");
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
        // aage fallback
      }
    }
  }

  let lastError = null;
  if (CAN_USE_YTDLP) {
    try {
      const data = await getYtDlpData(url);
      const audio = (data.formats || [])
        .filter((f) => f?.url && f.vcodec === "none" && f.acodec && f.acodec !== "none")
        .sort((a, b) => {
          const aM4a = a.ext === "m4a" ? 1 : 0;
          const bM4a = b.ext === "m4a" ? 1 : 0;
          if (aM4a !== bM4a) return bM4a - aM4a;
          return (b.abr || b.tbr || 0) - (a.abr || a.tbr || 0);
        })[0];
      if (audio) return { url: audio.url, ext: audio.ext || "m4a" };
    } catch (error) {
      lastError = error;
    }
  }

  if (COBALT_ENABLED) {
    const result = await cobaltRequest(url, "audio");
    return { url: result.url, ext: "mp3" };
  }

  throw lastError || new Error("No audio stream was found for this URL.");
}

export async function getBestAudioUrl(url) {
  return (await getBestAudio(url)).url;
}