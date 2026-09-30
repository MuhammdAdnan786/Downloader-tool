import { getFbVideoInfo } from "fb-downloader-scrapper";
import { parseJsonBody } from "../../../lib/api";
import { detectPlatform, normalizeUrl } from "../../../lib/media";

export const runtime = "nodejs";
export const maxDuration = 30;

const CACHE_TTL = 5 * 60 * 1000; // 5 minute
const FETCH_TIMEOUT = 15000; // 15 sec se zyada na latke

const cache = new Map();
const inflight = new Map();

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("TIMEOUT")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Same URL dobara aaye to cache se, aur agar abhi fetch ho raha ho to wahi promise share hota hai
async function getCachedInfo(url) {
  const hit = cache.get(url);
  if (hit && hit.expires > Date.now()) return hit.value;

  if (inflight.has(url)) return inflight.get(url);

  const promise = (async () => {
    try {
      const value = await withTimeout(getFbVideoInfo(url), FETCH_TIMEOUT);

      // sirf kaamyab result cache karo
      if (value && (value.sd || value.hd)) {
        if (cache.size >= 100) {
          cache.delete(cache.keys().next().value); // sabse purani entry hata do
        }
        cache.set(url, { value, expires: Date.now() + CACHE_TTL });
      }
      return value;
    } finally {
      inflight.delete(url);
    }
  })();

  inflight.set(url, promise);
  return promise;
}

export async function POST(request) {
  try {
    const parsed = await parseJsonBody(request);
    if (parsed.error) {
      return Response.json({ success: false, message: parsed.error }, { status: 400 });
    }

    const url = normalizeUrl(typeof parsed.body.url === "string" ? parsed.body.url : "");

    if (!url || detectPlatform(url) !== "facebook") {
      return Response.json(
        { success: false, message: "Invalid Facebook URL" },
        { status: 400 }
      );
    }

    const result = await getCachedInfo(url);

    // Pehle && tha, is wajah se sirf SD ya sirf HD wali video 404 ho jati thi
    if (!result || (!result.sd && !result.hd)) {
      return Response.json(
        { success: false, message: "Video not found or private" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: {
        title: result.title || "Facebook Video",
        thumbnail: result.thumbnail || "",
        sd: result.sd || null,
        hd: result.hd || null,
      },
    });
  } catch (error) {
    console.error("Facebook Download Error:", error);

    if (error?.message === "TIMEOUT" || /timed out/i.test(error?.message || "")) {
      return Response.json(
        { success: false, message: "Facebook took too long to respond. Please try again." },
        { status: 504 }
      );
    }

    return Response.json(
      { success: false, message: "Could not fetch this Facebook video. Check that it is public and try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({ ok: true, message: "Facebook endpoint is available." });
}