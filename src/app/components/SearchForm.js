'use client';
import Image from 'next/image';
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) {
      setError('Please enter a Facebook video URL');
      return;
    }
    setLoading(true);
    setVideoInfo(null);
    setError('');

    try {
      const res = await fetch('/api/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (data.success) {
        setVideoInfo(data.data);
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Server error');
    }

    setLoading(false);
  };

  return (
    <main className="min-h-fit bg-gradient-to-b bg-transparent ">
      {/* Hero Section with Gradient Background */}
      <div className="bg-gradient-to-r  text-white py-2 px-4">
        <div className="max-w-4xl mx-auto text-center">

          {/* Download Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Enter Facebook video URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-grow px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-lg font-medium ${loading ? 'bg-blue-400' : 'bg-white text-blue-600 hover:bg-blue-50'} transition-colors`}
              >
                {loading ? 'Fetching...' : 'Download'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500  p-3 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {videoInfo && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <Image
                src={videoInfo.thumbnail}
                alt="thumbnail youtube video"
                width={500}
                height={300}
              />
            </div>
            <div className="p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {videoInfo.title}
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <a
                  href={videoInfo.sd}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  Download HD Quality
                </a>

              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}