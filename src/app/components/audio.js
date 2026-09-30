'use client';

import { useEffect, useRef, useState } from 'react';

export default function AudioExtractor() {
  const [videoFile, setVideoFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [ffmpeg, setFfmpeg] = useState(null);
  const [loadingTools, setLoadingTools] = useState(false);
  const ffmpegRef = useRef(null);
  const ffmpegLoadRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (ffmpegRef.current?.loaded) ffmpegRef.current.terminate();
    };
  }, []);

  useEffect(() => () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  const loadFFmpeg = async () => {
    if (ffmpegRef.current) return ffmpegRef.current;
    if (!ffmpegLoadRef.current) {
      setLoadingTools(true);
      setError('');
      ffmpegLoadRef.current = (async () => {
        const [{ FFmpeg }, { toBlobURL }] = await Promise.all([
          import('@ffmpeg/ffmpeg'),
          import('@ffmpeg/util'),
        ]);
        const instance = new FFmpeg();
        instance.on('progress', ({ progress: ratio }) => {
          if (mountedRef.current) setProgress(Math.max(0, Math.min(100, Math.round(ratio * 100))));
        });

        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd';
        await instance.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        if (!mountedRef.current) {
          instance.terminate();
          throw new Error('Audio tools were closed while loading.');
        }

        ffmpegRef.current = instance;
        setFfmpeg(instance);
        return instance;
      })().catch((err) => {
        ffmpegLoadRef.current = null;
        throw err;
      }).finally(() => {
        if (mountedRef.current) setLoadingTools(false);
      });
    }

    return ffmpegLoadRef.current;
  };

  const extractAudio = async () => {
    if (!videoFile || loading || loadingTools) return;
    if (videoFile.size === 0 || videoFile.size > 500 * 1024 * 1024) {
      setError('Choose a non-empty video file smaller than 500 MB.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setProgress(0);
      const ffmpegInstance = ffmpeg || await loadFFmpeg();
      
      // Write the file to FFmpeg's virtual file system
      const data = await readFileAsArrayBuffer(videoFile);
      await ffmpegInstance.deleteFile('input.mp4').catch(() => {});
      await ffmpegInstance.deleteFile('output.mp3').catch(() => {});
      await ffmpegInstance.writeFile('input.mp4', new Uint8Array(data));
      
      // Run the FFmpeg command to extract audio
      const exitCode = await ffmpegInstance.exec([
        '-i', 'input.mp4',
        '-q:a', '0',
        '-map', 'a',
        'output.mp3'
      ]);
      if (exitCode !== 0) throw new Error('FFmpeg could not extract an audio track.');
      
      // Read the result
      const outputData = await ffmpegInstance.readFile('output.mp3');
      
      // Create a URL for the output file
      const blob = new Blob([outputData], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      
      setAudioUrl(url);
    } catch (err) {
      setError(err?.message || 'Failed to extract audio. The video may be corrupted or have no audio.');
      console.error('Audio extraction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) resolve(reader.result);
        else reject(new Error('Could not read the selected video file.'));
      };
      reader.onerror = () => reject(new Error('Could not read the selected video file.'));
      reader.onabort = () => reject(new Error('Reading the video file was cancelled.'));
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Audio Extractor from Video
      </h1> */}
      {/* hello world */}
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
              setError('');
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
          disabled={!videoFile || loading || loadingTools}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingTools ? 'Loading audio tools...' : loading ? `Processing... ${progress}%` : 'Extract Audio'}
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