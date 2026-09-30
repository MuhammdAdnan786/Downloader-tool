import { NextResponse } from "next/server";
import { parseJsonBody, publicMediaError } from "../../../lib/api";
import {
  detectPlatform,
  fetchMediaInfo,
  getBestAudio,
  getDirectDownloadUrl,
  normalizeUrl,
  safeFileName,
} from "../../../lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request) {
  try {
    const parsed = await parseJsonBody(request);
    if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const url = normalizeUrl(typeof parsed.body.url === "string" ? parsed.body.url : "");
    const formatId = typeof parsed.body.formatId === "string" ? parsed.body.formatId : "best";

    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }
    if (formatId.length > 80) {
      return NextResponse.json({ error: "Invalid format selection." }, { status: 400 });
    }

    const platform = detectPlatform(url);
    if (platform === "unknown") {
      return NextResponse.json(
        { error: "Unsupported platform. Please use a valid YouTube or Facebook URL." },
        { status: 400 }
      );
    }

    // Cache mein hota hai, isliye info route ke baad almost instant
    const mediaInfo = await fetchMediaInfo(url);

    let directUrl = "";
    let filename = "download.mp4";

    if (formatId === "audio") {
      const audio = await getBestAudio(url);
      directUrl = audio.url;
      filename = safeFileName(mediaInfo.title, audio.ext);
    } else {
      const formats = Array.isArray(mediaInfo.formats) ? mediaInfo.formats : [];
      const selected =
        formatId === "best"
          ? mediaInfo.bestFormat
          : formats.find((item) => item.format_id === formatId);

      if (!selected) {
        return NextResponse.json(
          { error: "No valid download format was found for this media." },
          { status: 404 }
        );
      }

      // URL info mein ho to wahi, warna (cobalt formats) yahan generate hoga
      directUrl = selected.url || (await getDirectDownloadUrl(url, selected.format_id));
      filename = safeFileName(mediaInfo.title, selected.ext || "mp4");
    }

    try {
      if (new URL(directUrl).protocol !== "https:") throw new Error("Invalid stream URL");
    } catch {
      return NextResponse.json(
        { error: "The platform returned an invalid video link." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      directUrl,
      filename,
      platform,
      message: "Download ready.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: publicMediaError(error, "Could not prepare this download. Please try again.") },
      { status: 502 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "Download endpoint is available." });
}