import { NextResponse } from "next/server";
import { parseJsonBody, publicMediaError } from "../../../lib/api";
import { detectPlatform, fetchMediaInfo, normalizeUrl } from "../../../lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request) {
  try {
    const parsed = await parseJsonBody(request);
    if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const url = normalizeUrl(typeof parsed.body.url === "string" ? parsed.body.url : "");

    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    if (detectPlatform(url) === "unknown") {
      return NextResponse.json(
        { error: "Unsupported URL. Please use a YouTube or Facebook link." },
        { status: 400 }
      );
    }

    const info = await fetchMediaInfo(url);
    if (!info.formats?.length) {
      return NextResponse.json(
        { error: "No downloadable formats were found for this video." },
        { status: 422 }
      );
    }
    return NextResponse.json(info);
  } catch (error) {
    return NextResponse.json(
      { error: publicMediaError(error, "Could not fetch this video. Please check the link and try again.") },
      { status: 502 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "Media info endpoint is available." });
}