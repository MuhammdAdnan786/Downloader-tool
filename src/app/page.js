import "./globals.css";
import Link from "next/link";
import VideoDownloader from "./components/VideoDisplay";

export const metadata = {
  title: "YouTube Video Downloader - Save Public Videos as MP4",
  description: "Use the online YouTube video downloader to find available video qualities and open a direct stream in your browser. Only download content you have permission to use.",
  keywords: ["YouTube video downloader", "YouTube to MP4", "download YouTube video", "online video downloader"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "YouTube Video Downloader",
    description: "Find available qualities for a public YouTube video and open its direct stream in your browser.",
    url: "/",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Blue Gradient */}
      <section className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-16 px-4 ">
        <header className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-4 animate-fade-in">
            YouTube Video Downloader
          </h1>
          <p className="text-lg md:text-[1rem] mb-8 max-w-xl mx-auto animate-fade-in animation-delay-300">
            Paste a public YouTube link, check the available video qualities, and open the selected stream directly in your browser.
          </p>
        </header>
        <div id="downloader" className="animate-fade-in animation-delay-450 scroll-mt-20">
          <VideoDownloader />
        </div>
        <nav aria-label="Related tools" className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white">
          <Link href="/facebookdownloader" className="underline underline-offset-4">Facebook video downloader</Link>
          <Link href="/audio" className="underline underline-offset-4">Video to MP3 audio extractor</Link>
        </nav>
      </section>

      {/* Content Section */}
      <article className="max-w-4xl mx-auto px-4 mt-10 pb-12">
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              Why Use Our YouTube Video Downloader?
            </h2>
            <p className="ml-4">
              This <strong>online YouTube video downloader</strong> checks the formats available for a public link. Choose a listed quality to open its direct stream; MP4 and HD options appear when the source provides them. Availability and playback behavior depend on the video and your browser.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              How to Download YouTube Videos in 3 Easy Steps
            </h2>
            <div className="bg-blue-50 p-6 rounded-lg">
              <ol className="space-y-6">
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">1</span>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Copy the YouTube URL</h3>
                    <p>Find the video you want to download and copy its link from the address bar.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">2</span>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Paste the URL Above</h3>
                    <p>The YouTube to MP4 downloader checks which formats are available for the pasted link.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">3</span>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Choose Quality &amp; Download</h3>
                    <p>Select one of the qualities returned for that video. Available resolutions vary by source.</p>
                  </div>
                </li>
              </ol>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              Top Features of Our YouTube Downloader
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-lg mb-3 flex items-center">
                  <span className="text-blue-500 mr-2">✔</span> No Software Installation
                </h3>
                <p>Works directly in your browser with no downloads required.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-lg mb-3 flex items-center">
                  <span className="text-blue-500 mr-2">✔</span> Multiple Formats
                </h3>
                <p>Download as MP4, WebM, or 3GP formats.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-lg mb-3 flex items-center">
                  <span className="text-blue-500 mr-2">✔</span> All Devices Supported
                </h3>
                <p>Works on PC, Mac, Android, and iPhone.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-lg mb-3 flex items-center">
                  <span className="text-blue-500 mr-2">✔</span> High-Speed Downloads
                </h3>
                <p>The selected media stream opens directly from its source; speed depends on the source and your connection.</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <details className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors" open>
                <summary className="font-bold text-lg cursor-pointer">Is it legal to download YouTube videos?</summary>
                <p className="mt-2 text-gray-700">
                  Only download content when you have permission or the platform explicitly allows it. Respect YouTube&apos;s Terms of Service and copyright law.
                </p>
              </details>
              <details className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <summary className="font-bold text-lg cursor-pointer">What&apos;s the highest quality available?</summary>
                <p className="mt-2 text-gray-700">
                  Available formats depend on the original upload and the formats YouTube provides for it.
                </p>
              </details>
            </div>
          </section>

          <section className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Download YouTube Videos?</h2>
            <p className="text-lg mb-6">
              Try our free online YouTube downloader today - no registration required!
            </p>
            <a 
              href="#downloader" 
              className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors shadow-md hover:shadow-lg"
              aria-label="Start downloading YouTube videos now"
            >
              Start Downloading Now
            </a>
          </section>

          <section className="mb-12 border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Need MP3 audio from a video file?</h2>
            <p className="mb-4 text-gray-700">
              Use the browser-based video-to-MP3 extractor to convert a video file on your device. The file is processed locally in your browser.
            </p>
            <Link href="/audio" className="font-semibold text-blue-700 underline underline-offset-4">
              Open the audio extractor
            </Link>
          </section>
        </div>
      </article>

      <footer className="max-w-4xl mx-auto px-4 py-8 border-t text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Fast YouTube Downloader. For personal use only.</p>
      </footer>
    </main>
  );
}
