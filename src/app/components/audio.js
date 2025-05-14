'use client';

import { useEffect, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export default function AudioExtractor() {
  const [videoFile, setVideoFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [ffmpeg, setFfmpeg] = useState(null);

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        setError('');
        const ffmpegInstance = new FFmpeg();
        
        ffmpegInstance.on('progress', ({ progress: ratio }) => {
          setProgress(Math.round(ratio * 100));
        });

        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        await ffmpegInstance.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        setFfmpeg(ffmpegInstance);
      } catch (err) {
        setError('Failed to load FFmpeg. Please try again.');
        console.error('FFmpeg loading error:', err);
      }
    };

    loadFFmpeg();

    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const extractAudio = async () => {
    if (!videoFile || !ffmpeg) return;

    try {
      setLoading(true);
      setError('');
      setProgress(0);
      
      // Write the file to FFmpeg's virtual file system
      const data = await readFileAsArrayBuffer(videoFile);
      await ffmpeg.writeFile('input.mp4', new Uint8Array(data));
      
      // Run the FFmpeg command to extract audio
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-q:a', '0',
        '-map', 'a',
        'output.mp3'
      ]);
      
      // Read the result
      const outputData = await ffmpeg.readFile('output.mp3');
      
      // Create a URL for the output file
      const blob = new Blob([outputData], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      
      setAudioUrl(url);
    } catch (err) {
      setError('Failed to extract audio. The video might not contain an audio track or is corrupted.');
      console.error('Audio extraction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Audio Extractor from Video
      </h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Video File
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => {
              setVideoFile(e.target.files?.[0] || null);
              setAudioUrl('');
            }}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <p className="mt-1 text-xs text-gray-500">
            Supported formats: MP4, MOV, AVI, etc.
          </p>
        </div>

        <button
          onClick={extractAudio}
          disabled={!videoFile || !ffmpeg || loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? `Processing... ${progress}%` : 'Extract Audio'}
        </button>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {loading && progress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {audioUrl && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-medium text-gray-800 mb-3">
              Your Extracted Audio
            </h2>
            <audio
              controls
              src={audioUrl}
              className="w-full mb-4"
            />
            <a
              href={audioUrl}
              download={`${videoFile.name.replace(/\.[^/.]+$/, '')}.mp3`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Download MP3
            </a>
          </div>
        )}
      </div>
    </div>
  );
}