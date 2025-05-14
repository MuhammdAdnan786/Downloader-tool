import ExtractAudioPage from '../components/audio.js';

export default function Home() {
  return (
    <main className="min- h-screen bg-gradient-to-b from-gray-50 to-white"> 
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 animate-fade-in">
            🚀 Fastest Audio Extractor
          </h1>

          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto animate-fade-in animation-delay-300">
            Get your favorite audio without any software installation
          </p>
        </div>
        <div className="animate-fade-in animation-delay-450">
          <ExtractAudioPage />
        </div>
      </section>
      <article className="max-w-4xl mx-auto px-4 pb-12 mt-10">
        <div className="prose prose-lg max-w-none">
          <section className="mb-12 animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              Why Extract Audio from Videos?
            </h2>
            <p className='ml-4'>
              There are millions of videos with valuable audio content - music, podcasts, interviews, and more.
              With our audio extractor, you can:
            </p>
            <ul className="space-y-2 my-4 ml-2">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                Save audio from music videos to create personal playlists
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                Extract interviews or lectures for offline listening
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                Create audio samples for creative projects (with proper attribution)
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                Preserve audio from memorable moments and events
              </li>
            </ul>
          </section>

          <section className="mb-12 animate-fade-in animation-delay-150">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              How to Extract Audio in 2 Simple Steps
            </h2>
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <ol className="space-y-6">
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">1</span>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Upload Video File</h3>
                    <p>Click &quot;Select Video File&quot; above and choose your downloaded video.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">2</span>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Extract &amp; Download Audio</h3>
                    <p>Click &quot;Extract Audio&quot; and download your MP3 file when ready.</p>
                  </div>
                </li>
              </ol>
            </div>
          </section>

          <section className="mb-12 animate-fade-in animation-delay-300">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <details className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors" open>
                <summary className="font-bold text-lg cursor-pointer">Is audio extraction legal?</summary>
                <p className="mt-2 text-gray-700">
                  Audio extraction for personal use is generally acceptable. However, redistributing copyrighted content without permission is illegal. Always respect copyright laws.
                </p>
              </details>
              <details className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <summary className="font-bold text-lg cursor-pointer">What audio quality can I expect?</summary>
                <p className="mt-2 text-gray-700">
                  Our extractor preserves the original audio quality from the video, typically up to 320kbps for MP3 format.
                </p>
              </details>
              <details className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <summary className="font-bold text-lg cursor-pointer">Are there any file size limits?</summary>
                <p className="mt-2 text-gray-700">
                  We support videos up to 500MB. For larger files, consider trimming the video before extraction.
                </p>
              </details>
            </div>
          </section>

          <section className="animate-fade-in animation-delay-450">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              Why Choose Our Audio Extractor?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-lg mb-3 flex items-center">
                  <span className="text-blue-500 mr-2">⚡</span> Browser-Based
                </h3>
                <p>No software to install - works directly in your web browser with full privacy.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-lg mb-3 flex items-center">
                  <span className="text-blue-500 mr-2">🔒</span> Secure Processing
                </h3>
                <p>Files are processed locally in your browser - we never upload your videos to our servers.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-lg mb-3 flex items-center">
                  <span className="text-blue-500 mr-2">💯</span> Free Forever
                </h3>
                <p>We offer this service completely free with no hidden charges or watermarks.</p>
              </div>
            </div>
          </section>
        </div>
      </article>
    </main>
  );
}