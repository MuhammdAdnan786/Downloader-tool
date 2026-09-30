import Facebook from "../components/SearchForm";
import Link from "next/link";

export const metadata = {
  title: "Facebook Video Downloader for Public Videos",
  description: "Open available SD or HD streams from public Facebook video links. Video quality and availability depend on the original post.",
  keywords: ["Facebook video downloader", "download public Facebook video", "Facebook video HD downloader"],
  alternates: { canonical: "/facebookdownloader" },
  openGraph: {
    title: "Facebook Video Downloader",
    description: "Find available SD or HD streams for a public Facebook video link.",
    url: "/facebookdownloader",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <main className="min-h-fit bg-gradient-to-b ">
       <section className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl md:text-5xl font-bold mb-4 animate-fade-in">
          Facebook Video Downloader
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto animate-fade-in animation-delay-300">
            Paste a public Facebook video link to check whether an SD or HD stream is available.
          </p>
          {/* Downloader Component */}
          <div className="animate-fade-in animation-delay-450">
            <Facebook />
          </div>
          <nav aria-label="Related tools" className="mt-6 flex justify-center gap-6 text-sm">
            <Link href="/" className="underline underline-offset-4">YouTube video downloader</Link>
            <Link href="/audio" className="underline underline-offset-4">Video to MP3 audio extractor</Link>
          </nav>
        </div>
      </section>

      {/* Blog Post Section */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Main Content */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-12 animate-fade-in animation-delay-300">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              Why Download Facebook Videos?
            </h2>
            <p className="ml-2">
              Facebook hosts millions of entertaining, educational, and inspiring videos every day. 
              With our Facebook video downloader, you can:
            </p>
            <ul className="space-y-2 my-4">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                Save videos for offline viewing when you don&apos;t have internet
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                Archive important memories and special moments
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                Share videos with friends who aren&apos;t on Facebook
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                Use videos for educational or creative projects (with proper attribution)
              </li>
            </ul>
          </section>

          <section className="mb-12 animate-fade-in animation-delay-450">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              How to Download Facebook Videos in 3 Easy Steps
            </h2>
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <ol className="space-y-6">
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">1</span>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Find the Video</h3>
                    <p>Go to Facebook and find the video you want to download. Copy the video URL from the address bar.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">2</span>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Paste the URL</h3>
                    <p>Paste the Facebook video URL into the search box above on our downloader tool.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">3</span>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Download &amp; Enjoy</h3>
                    <p>Click the download button and choose your preferred video quality. The video will save to your device!</p>
                  </div>
                </li>
              </ol>
            </div>
          </section>

          <section className="mb-12 animate-fade-in animation-delay-600">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <details className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors" open>
                <summary className="font-bold text-lg cursor-pointer">Is it legal to download Facebook videos?</summary>
                <p className="mt-2 text-gray-700">
                  Only download videos you own or have permission to use, and follow Facebook&apos;s terms and applicable copyright law.
                </p>
              </details>
              <details className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <summary className="font-bold text-lg cursor-pointer">What video qualities are available?</summary>
                <p className="mt-2 text-gray-700">
                  Our downloader supports all available qualities from SD to HD (up to 1080p), depending on what the original uploader made available.
                </p>
              </details>
              <details className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <summary className="font-bold text-lg cursor-pointer">Can I download private Facebook videos?</summary>
                <p className="mt-2 text-gray-700">
                  No, our tool only works with public videos. Private videos require login credentials which we don&apos;t support for security reasons.
                </p>
              </details>
            </div>
          </section>

          <section className="animate-fade-in animation-delay-750">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              Why Choose Our Facebook Video Downloader?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-lg mb-3 flex items-center">
                  <span className="text-blue-500 mr-2">⚡</span> Fast Downloads
                </h3>
                <p>Available streams open directly from their source; speed depends on the source and your connection.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-lg mb-3 flex items-center">
                  <span className="text-blue-500 mr-2">🔒</span> No Registration
                </h3>
                <p>Use our service without signing up or providing any personal information.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-lg mb-3 flex items-center">
                  <span className="text-blue-500 mr-2">💯</span> Free Forever
                </h3>
                <p>We offer our basic downloading services completely free with no hidden charges.</p>
              </div>
            </div>
          </section>
        </div>
      </article>
    </main>
  );
}