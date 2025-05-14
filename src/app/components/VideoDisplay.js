'use client';
import Image from 'next/image';
import { useState } from 'react';

export default function VideoInfoFetcher() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState(null);

  const fetchVideoInfo = async () => {
    if (!url) {
      setError('Please enter a YouTube URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setVideoInfo(null);
    setSelectedFormat(null);
    setDownloadInfo(null);

    try {
      const response = await fetch('/api/video-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `Server responded with status: ${response.status}`
        }));
        throw new Error(errorData.error || 'Failed to fetch video info');
      }

      const data = await response.json();

      setVideoInfo({
        title: data.title,
        duration: data.duration,
        thumbnail: data.thumbnail,
        availableFormats: data.availableFormats,
        bestAudio: data.bestAudio
      });

      if (data.defaultFormat) {
        setSelectedFormat(data.defaultFormat.resolution);
      } else if (data.availableFormats && data.availableFormats.length > 0) {
        setSelectedFormat(data.availableFormats[0].resolution);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch video info');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoInfo || !selectedFormat) return;

    setIsDownloading(true);
    setError('');
    setDownloadInfo(null);

    try {
      console.log('Download request:', {
        url: url,
        formatId: selectedFormat.toString()
      });

      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          formatId: selectedFormat.toString()
        })
      });

      if (!response.ok) {
        let errorMessage = `Server responded with status: ${response.status}`;

        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (jsonError) {
          console.error('Error parsing error response:', jsonError);
        }

        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
        console.log('Download response data:', data);

        if (data.formatInfo) {
          setDownloadInfo(data.formatInfo);
        }
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        throw new Error('Invalid response from server');
      }

      if (!data || !data.directUrl) {
        throw new Error('Could not get direct download URL');
      }

      const safeFileName = videoInfo.title.replace(/[^\w\s]/gi, '_') + '.mp4';

      const a = document.createElement('a');
      a.href = data.directUrl;
      a.download = safeFileName;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      console.log('Initiating download with URL:', data.directUrl);
      a.click();

      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(`
        <a href=\"${data.directUrl}\" download=\"${safeFileName}\" id=\"download-link\">Download</a>
        <script>
          document.getElementById('download-link').click();
        </script>
      `);
      iframe.contentWindow.document.close();

      setTimeout(() => {
        document.body.removeChild(a);
        document.body.removeChild(iframe);

        setError(
          <div className="p-3 bg-blue-100 text-blue-800 rounded-lg">
            If download didn&apos;t start automatically, <a
              href={data.directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline"
              download={safeFileName}
            >
              click here
            </a> to download directly.
          </div>
        );

        setIsDownloading(false);
      }, 2000);
    } catch (err) {
      setError('Download failed: ' + (err.message || 'Unknown error'));
      console.error('Download error:', err);
      setIsDownloading(false);
    }
  };

  const getFormatLabel = (resolution) => {
    return `${resolution}p${resolution >= 720 ? ' HD' : ''}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto transition-all hover:shadow-xl hover-scale">
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">YouTube Video Downloader</h1>
        <p className="text-gray-600">Download videos in MP4 format with audio</p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube URL here"
          className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={fetchVideoInfo}
        disabled={isLoading}
        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors mb-4"
      >
        {isLoading ? 'Loading...' : 'Get Video Info'}
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {videoInfo && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-4">
            {videoInfo.thumbnail && (
              <Image
              className="w-24 h-16 object-cover rounded"
              src={ videoInfo.thumbnail }
              alt={videoInfo.title}
              width={500}
              height={300}
            />
            )}
            <div>
              <h3 className="font-medium text-gray-800 line-clamp-2">{videoInfo.title}</h3>
              {videoInfo.duration && (
                <p className="text-sm text-gray-500">
                  Duration: {Math.floor(videoInfo.duration / 60)}:{String(videoInfo.duration % 60).padStart(2, '0')}
                </p>
              )}
            </div>
          </div>

          {videoInfo.availableFormats && videoInfo.availableFormats.length > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <label className="text-sm text-gray-600">Quality:</label>
              <select
                value={selectedFormat || ''}
                onChange={(e) => setSelectedFormat(parseInt(e.target.value))}
                className="border text-gray-600 border-gray-300 rounded px-1 py-1 text-sm"
              >
                {videoInfo.availableFormats.map((format) => (
                  <option key={format.resolution} value={format.resolution}>
                    {getFormatLabel(format.resolution)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleDownload}
            disabled={isDownloading || !selectedFormat}
            className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center gap-2"
          >
            {isDownloading ? (
              'Downloading...'
            ) : (
              <>
                <span>Download</span>
                {selectedFormat && (
                  <span className="text-xs bg-white text-blue-600 px-2 py-1 rounded">
                    {selectedFormat}p
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}