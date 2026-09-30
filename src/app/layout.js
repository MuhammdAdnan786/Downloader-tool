import "./globals.css";
import Navbar from "./components/Navbar";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || "https://example.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "YouTube Video Downloader & MP4 Converter | MultiDownloader",
    template: "%s | MultiDownloader",
  },
  description: "Download public YouTube and Facebook videos in available quality, or convert a video file to MP3 with our browser-based audio extractor.",
  keywords: [
    "YouTube video downloader",
    "YouTube to MP4",
    "video downloader online",
    "Facebook video downloader",
    "video to MP3 converter",
    "extract audio from video",
    "download mp4",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "YouTube Video Downloader & MP4 Converter",
    description: "Download public videos in available quality and extract MP3 audio from video files in your browser.",
    url: siteUrl,
    siteName: "MultiDownloader",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Video Downloader & MP4 Converter",
    description: "Download public videos or extract MP3 audio from a video file in your browser.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
