import { NextResponse } from "next/server";
import { parseJsonBody, publicMediaError } from "../../../lib/api";
import { detectPlatform, fetchMediaInfo, normalizeUrl } from "../../../lib/media";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request) {
  const startedAt = Date.now();
  let platform = "unknown";

  try {
    const parsed = await parseJsonBody(request);
    if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const url = normalizeUrl(typeof parsed.body.url === "string" ? parsed.body.url : "");

    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    platform = detectPlatform(url);
    if (platform === "unknown") {
      return NextResponse.json(
        { error: "Unsupported URL. Please use a YouTube or Facebook link." },
        { status: 400 }
      );
    }

    const info = await fetchMediaInfo(url);
    if (!info.formats?.length) {
      return NextResponse.json({ error: "No downloadable formats were found for this video." }, { status: 422 });
    }
    return NextResponse.json(info);
  } catch (error) {
    const message = String(error?.message || "");
    const reason = error?.code === 127 || error?.code === "ENOENT" || error?.code === "EACCES"
      ? "extractor-process-failed"
      : /timed out|timeout/i.test(message)
        ? "timeout"
        : /429|rate.?limit/i.test(message)
        ? "rate-limited"
        : /private|login required|unavailable/i.test(message)
          ? "restricted-or-unavailable"
          : /yt-dlp is not installed|not available on this server/i.test(message)
            ? "extractor-missing"
            : /network|socket|fetch failed|econn/i.test(message)
              ? "network-error"
              : "extractor-error";

    console.error("Media info upstream failure", {
      platform,
      reason,
      errorName: error?.name || "Error",
      errorCode: error?.code || null,
      durationMs: Date.now() - startedAt,
    });

    return NextResponse.json(
      { error: publicMediaError(error, "Could not fetch this video. Please check the link and try again.") },
      { status: 502 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "Media info endpoint is available." });
}