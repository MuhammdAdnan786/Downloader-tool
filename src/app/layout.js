import "./globals.css";

export const metadata = {
  title: "Online Video Downloader - YouTube, Facebook & Audio Extractor",
  description: "Download YouTube videos, Facebook videos, and extract audio from videos online for free. Fast, secure, and works on all devices.",
  keywords: [
    "YouTube video downloader",
    "download YouTube videos",
    "Facebook video downloader",
    "download Facebook videos",
    "online video downloader",
    "YouTube to MP4",
    "YouTube to MP3",
    "video to audio converter",
    "extract audio from video",
    "free online downloader",
    "4K video download",
    "HD video download",
    "audio extractor online",
    "Facebook MP4 downloader",
    "online audio extractor",
    "How to download YouTube videos",
    "How to download Facebook videos",
    "Ho to extract audio from video",
  ],
  metadataBase: new URL("https://yourdomain.com"),
  openGraph: {
    title: "Free YouTube & Facebook Video Downloader + Audio Extractor",
    description: "Fast and free tool to download videos or extract audio from YouTube and Facebook. No signup required.",
    url: "https://yourdomain.com",
    siteName: "Online Video Downloader",
    images: [
      {
        url: "https://yourdomain.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Online Video Downloader",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Video Downloader and Audio Extractor",
    description: "Download YouTube, Facebook videos, or extract audio online. 100% free and fast.",
    images: ["https://yourdomain.com/og-image.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
