"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { parseApiResponse } from "../../lib/api";

export default function VideoDownloader() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoInfo, setVideoInfo] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState("");
  const downloadRequestInProgress = useRef(false);

  const formatOptions = useMemo(() => videoInfo?.formats || [], [videoInfo]);
  const fetchButtonText = isLoading ? "Fetching..." : videoInfo ? "Fetch again" : "Fetch";

  const fetchVideoInfo = async () => {
    if (!url.trim()) {
      setError("Please enter a valid URL.");
      return;
    }

    setIsLoading(true);
    setError("");
    setVideoInfo(null);

    try {
      const response = await fetch("/api/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await parseApiResponse(response, "Failed to fetch media info.");
      if (!Array.isArray(data.formats) || data.formats.length === 0) {
        throw new Error("No downloadable formats were found for this video.");
      }

      setVideoInfo(data);
      const preferred = data.formats?.find((format) => format.progressive) || data.formats?.[0];
      setSelectedFormat(preferred?.format_id || "");
    } catch (err) {
      setError(err?.message || "Could not fetch this video. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedFormat || !videoInfo || downloadRequestInProgress.current) return;

    const selected = formatOptions.find((format) => format.format_id === selectedFormat);
    if (!selected) return;

    const downloadTab = window.open("about:blank", "_blank");
    if (!downloadTab) {
      setError("Allow pop-ups for this site to open the video in a new tab.");
      return;
    }
    downloadTab.opener = null;
    downloadRequestInProgress.current = true;
    setError("");

    try {
      let directUrl = selected.url;

      if (!directUrl) {
        const response = await fetch("/api/download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, formatId: selectedFormat }),
        });

        const data = await parseApiResponse(response, "Download generation failed.");
        directUrl = data.directUrl;
      }

      if (!directUrl) throw new Error("No video stream URL was returned.");
      downloadTab.location.replace(directUrl);
    } catch (err) {
      downloadTab.close();
      setError(err?.message || "Could not prepare this download. Please try again.");
    } finally {
      downloadRequestInProgress.current = false;
    }
  };

  const formatFileSize = (bytes) => {
    const byteCount = Number(bytes);
    if (!Number.isFinite(byteCount) || byteCount <= 0) return "Unknown size";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const index = Math.min(Math.floor(Math.log(byteCount) / Math.log(1024)), sizes.length - 1);
    const value = byteCount / Math.pow(1024, index);
    return `${value.toFixed(2)} ${sizes[index]}`;
  };

  const getFormatLabel = (format) => {
    if (!format) return "Unknown format";
    const extLabel = format.ext ? format.ext.toUpperCase() : "FILE";
    if (format.resolution === "audio") return `Audio (${extLabel})`;

    const fpsText = format.fps ? ` ${format.fps}fps` : "";
    const sizeText = format.filesize ? ` • ${formatFileSize(format.filesize)}` : "";
    return `${format.resolution}${fpsText} (${extLabel})${format.progressive ? " • Combined" : " • Video only"}${sizeText}`;
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <h1 className="text-2xl font-bold text-center mb-6 text-slate-800">YouTube Video Downloader</h1>

      <div className="flex mb-4">
        <input
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setVideoInfo(null);
            setSelectedFormat("");
            setError("");
          }}
          placeholder="Paste YouTube or Facebook URL"
          className="flex-grow px-4 py-3 text-slate-800 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={fetchVideoInfo}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-3 rounded-r-lg hover:bg-blue-700 disabled:bg-blue-400"
        >
          {fetchButtonText}
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      {videoInfo && (
        <div className="mb-4 bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-4 mb-4">
            {videoInfo.thumbnail ? (
              <Image
                src={videoInfo.thumbnail}
                alt={videoInfo.title || "Video thumbnail"}
                width={96}
                height={68}
                className="w-24 h-auto rounded"
              />
            ) : null}
            <div>
              <h3 className="font-medium text-gray-800 line-clamp-2">{videoInfo.title}</h3>
              {videoInfo.uploader && <p className="text-sm text-gray-600">By: {videoInfo.uploader}</p>}
              {videoInfo.duration > 0 && (
                <p className="text-sm text-gray-600">
                  Duration: {Math.floor(videoInfo.duration / 60)}:{(videoInfo.duration % 60).toString().padStart(2, "0")}
                </p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Format:</label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {formatOptions.map((format) => (
                <option key={format.format_id} value={format.format_id}>
                  {getFormatLabel(format)}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleDownload}
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-green-400"
          >
            Download
          </button>
        </div>
      )}
    </div>
  );
}
