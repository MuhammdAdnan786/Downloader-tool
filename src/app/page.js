import "./globals.css";
import VideoInfoFetcher from "./components/VideoDisplay";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Blue Gradient */}
      <section className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-16 px-4 ">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl md:text-5xl font-bold mb-4 animate-fade-in">
            🚀 Fastest YouTube Video Downloader
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto animate-fade-in animation-delay-300">
            Get your favorite videos in HD, 4K, or any quality without any software installation
          </p>
        </div>
        <div className="animate-fade-in animation-delay-450">
        <VideoInfoFetcher />
        </div>
      </section>

      {/* Content Section */}
      <article className="max-w-4xl mx-auto px-4 mt-10 pb-12">
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              Why Use Our YouTube Video Downloader?
            </h2>
            <p className="ml-4">
              Our <strong>free online YouTube downloader</strong> is the fastest way to save videos from YouTube 
              to your device. Whether you need to <strong>download YouTube videos as MP4</strong>, save them 
              in <strong>HD quality</strong>, or get <strong>4K YouTube videos</strong> for offline viewing, 
              our tool provides the simplest solution with no registration required.
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
                    <p>Our YouTube to MP4 converter will analyze the video instantly.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">3</span>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Choose Quality &amp; Download</h3>
                    <p>Select from available formats (360p, 480p, 720p HD, 1080p Full HD, 4K).</p>
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
                <p>Save videos in seconds with our optimized servers.</p>
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
                  Downloading videos for personal use is generally acceptable under YouTube&apos;s Terms of Service. 
                  However, distributing copyrighted content or using downloaded videos commercially may violate copyright laws.
                </p>
              </details>
              <details className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <summary className="font-bold text-lg cursor-pointer">What&apos;s the highest quality available?</summary>
                <p className="mt-2 text-gray-700">
                  Our downloader supports up to 8K resolution when available. Video quality depends on the original 
                  upload quality on YouTube.
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
              href="#top" 
              className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors shadow-md hover:shadow-lg"
              aria-label="Start downloading YouTube videos now"
            >
              Start Downloading Now
            </a>
          </section>

          {/* SEO Keywords Section (hidden but readable by search engines) */}
          <div className="hidden">
            <p>
              YouTube video downloader, download YouTube videos, YouTube to MP4, free YouTube downloader, 
              save YouTube videos, online video downloader, HD YouTube download, 4K video download, 
              YouTube MP3 converter, save videos from YouTube, YouTube downloader online, best YouTube downloader, 
              fast YouTube downloader, YouTube video saver, download YouTube shorts, YouTube music downloader, 
              YouTube 1080p download, YouTube 4K download, YouTube video converter, YouTube offline viewer, 
              no ads YouTube downloader, YouTube download without watermark, YouTube high quality download, 
              mobile YouTube downloader, YouTube playlist downloader, bulk YouTube downloader
            </p>
          </div>
        </div>
      </article>

      <footer className="max-w-4xl mx-auto px-4 py-8 border-t text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Fast YouTube Downloader. For personal use only.</p>
      </footer>
    </main>
  );
}
