// import { NextResponse } from 'next/server';
// import path from 'path';
// import fs from 'fs/promises';
// import { execFile } from 'child_process';
// import { promisify } from 'util';

// const execFilePromise = promisify(execFile);

// export async function POST(request) {
//   const body = await request.json();
//   const { url } = body;

//   if (!url || typeof url !== 'string') {
//     return NextResponse.json({ error: 'Invalid URL provided.' });
//   }

//   try {
//     // Get absolute path to yt-dlp.exe
//     const execPath = path.join(process.cwd(), 'public', 'bin', 'yt-dlp.exe');
    
//     // Verify the file exists before trying to use it
//     try {
//       await fs.access(execPath);
//       console.log(`yt-dlp executable found at: ${execPath}`);
//     } catch (error) {
//       console.error(`yt-dlp executable not found at: ${execPath}`);
//       return NextResponse.json({ 
//         error: 'yt-dlp executable not found. Please ensure it is installed in the correct location.' 
//       });
//     }

//     // Run yt-dlp directly using child_process
//     const { stdout } = await execFilePromise(execPath, [
//       '--dump-json',
//       '--no-check-certificates',
//       '--no-warnings',
//       '--prefer-free-formats',
//       url
//     ]);

//     const metadata = JSON.parse(stdout);

//     if (!metadata || !metadata.formats) {
//       return NextResponse.json({ error: 'No formats found for the provided URL.' });
//     }

//     const uniqueFormats = [];
//     const resolutions = new Set();

//     metadata.formats.forEach((format) => {
//       if (format.height && !resolutions.has(format.height)) {
//         resolutions.add(format.height);
//         uniqueFormats.push({
//           format_id: format.format_id,
//           ext: format.ext,
//           quality: `${format.height}p`,
//           filesize: format.filesize || 'Unknown',
//           vcodec: format.vcodec,
//           acodec: format.acodec !== 'none' ? format.acodec : 'Requires separate audio',
//           url: format.url,
//         });
//       }
//     });

//     return NextResponse.json({
//       title: metadata.title,
//       thumbnail: metadata.thumbnail,
//       formats: uniqueFormats,
//     });
//   } catch (error) {
//     console.error('Error fetching formats:', error);
//     return NextResponse.json({ 
//       error: 'An error occurred while fetching formats.',
//       details: error.message || String(error),
//       code: error.code
//     });
//   }
// }




// app/api/video-info/route.js
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { execFile } from 'child_process';
import { promisify } from 'util';
const execFilePromise = promisify(execFile);

export async function POST(request) {
  const body = await request.json();
  const { url } = body;

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'Invalid URL provided.' });
  }

  try {
    // Get absolute path to yt-dlp.exe
    const execPath = path.join(process.cwd(), 'public', 'bin', 'yt-dlp.exe');
    
    // Verify the file exists before trying to use it
    try {
      await fs.access(execPath);
      console.log(`yt-dlp executable found at: ${execPath}`);
    } catch (error) {
      console.error(`yt-dlp executable not found at: ${execPath}`);
      return NextResponse.json({ 
        error: 'yt-dlp executable not found. Please ensure it is installed in the correct location.' 
      });
    }

    // Run yt-dlp directly using child_process
    const { stdout } = await execFilePromise(execPath, [
      '--dump-json',
      '--no-check-certificates',
      '--no-warnings',
      '--prefer-free-formats',
      url
    ]);

    const metadata = JSON.parse(stdout);

    if (!metadata || !metadata.formats) {
      return NextResponse.json({ error: 'No formats found for the provided URL.' });
    }

    // Process formats
    const availableResolutions = new Set();
    const formatsByResolution = {};
    
    metadata.formats.forEach((format) => {
      if (format.height && (format.vcodec !== 'none')) {
        const resolution = format.height;
        
        // Add to available resolutions
        availableResolutions.add(resolution);
        
        // Initialize if not exists
        if (!formatsByResolution[resolution]) {
          formatsByResolution[resolution] = {
            resolution: resolution,
            combined: null,
            videoOnly: null
          };
        }
        
        // Check if this is a combined format (has both video and audio)
        if (format.acodec !== 'none') {
          if (!formatsByResolution[resolution].combined || 
              (format.tbr > formatsByResolution[resolution].combined.tbr)) {
            formatsByResolution[resolution].combined = {
              format_id: format.format_id,
              ext: format.ext,
              quality: `${resolution}p`,
              filesize: format.filesize || 'Unknown',
              vcodec: format.vcodec,
              acodec: format.acodec,
              url: format.url,
              type: 'combined',
              tbr: format.tbr || 0
            };
          }
        } else {
          if (!formatsByResolution[resolution].videoOnly || 
              (format.tbr > formatsByResolution[resolution].videoOnly.tbr)) {
            formatsByResolution[resolution].videoOnly = {
              format_id: format.format_id,
              ext: format.ext,
              quality: `${resolution}p`,
              filesize: format.filesize || 'Unknown',
              vcodec: format.vcodec,
              acodec: 'none',
              url: format.url,
              type: 'video-only',
              tbr: format.tbr || 0
            };
          }
        }
      }
    });

    // Find best audio format
    const audioFormats = metadata.formats.filter(format => 
      format.acodec !== 'none' && format.vcodec === 'none'
    );
    
    audioFormats.sort((a, b) => (b.abr || 0) - (a.abr || 0));
    
    const bestAudio = audioFormats.length > 0 ? {
      format_id: audioFormats[0].format_id,
      ext: audioFormats[0].ext,
      quality: `${audioFormats[0].abr || 0}k`,
      filesize: audioFormats[0].filesize || 'Unknown',
      vcodec: 'none',
      acodec: audioFormats[0].acodec,
      url: audioFormats[0].url,
      type: 'audio',
      abr: audioFormats[0].abr || 0
    } : null;

    // Convert to array, remove 144p and 240p, and sort by resolution
    const sortedResolutions = Array.from(availableResolutions)
  .map(r => Number(r)) // Ensure numeric comparison
  .filter(res => res !== 144 && res !== 240)
  .sort((a, b) => a - b);

    // Create array of available formats for the frontend
    const availableFormats = sortedResolutions.map(resolution => {
      const formatInfo = formatsByResolution[resolution];
      return {
        resolution: resolution,
        label: `${resolution}p${resolution >= 720 ? ' HD' : ''}`,
        format: formatInfo.combined || formatInfo.videoOnly,
        hasCombined: !!formatInfo.combined
      };
    });

    return NextResponse.json({
      title: metadata.title,
      thumbnail: metadata.thumbnail,
      duration: metadata.duration,
      availableFormats,
      bestAudio,
      defaultFormat: availableFormats.find(f => f.resolution === 360) || availableFormats[0]
    });
  } catch (error) {
    console.error('Error fetching video info:', error);
    return NextResponse.json({ 
      error: 'An error occurred while fetching video info.',
      details: error.message || String(error),
      code: error.code
    });
  }
}



// import { NextResponse } from 'next/server';
// import path from 'path';
// import fs from 'fs/promises';
// import { execFile } from 'child_process';
// import { promisify } from 'util';

// const execFilePromise = promisify(execFile);

// export async function POST(request) {
//   const body = await request.json();
//   const { url } = body;

//   if (!url || typeof url !== 'string') {
//     return NextResponse.json({ error: 'Invalid URL provided.' });
//   }

//   try {
//     // Get absolute path to yt-dlp.exe
//     const execPath = path.join(process.cwd(), 'public', 'bin', 'yt-dlp.exe');
    
//     // Verify the file exists before trying to use it
//     try {
//       await fs.access(execPath);
//       console.log(`yt-dlp executable found at: ${execPath}`);
//     } catch (error) {
//       console.error(`yt-dlp executable not found at: ${execPath}`);
//       return NextResponse.json({ 
//         error: 'yt-dlp executable not found. Please ensure it is installed in the correct location.' 
//       });
//     }

//     // Run yt-dlp directly using child_process with format selection for combined formats
//     // -f 'bestvideo+bestaudio/best' tells yt-dlp to:
//     // 1. Try to get the best video and best audio and merge them
//     // 2. If merging isn't possible, get the best combined format
//     const { stdout } = await execFilePromise(execPath, [
//       '--dump-json',
//       '--no-check-certificates',
//       '--no-warnings',
//       url
//     ]);

//     const metadata = JSON.parse(stdout);

//     if (!metadata || !metadata.formats) {
//       return NextResponse.json({ error: 'No formats found for the provided URL.' });
//     }

//     // Filter for formats that have both audio and video
//     const combinedFormats = metadata.formats.filter(format => 
//       format.vcodec !== 'none' && format.acodec !== 'none'
//     );

//     // Group formats by resolution
//     const formatsByResolution = {};
    
//     combinedFormats.forEach(format => {
//       if (!format.height) return;
      
//       const resolution = `${format.height}p`;
//       if (!formatsByResolution[resolution]) {
//         formatsByResolution[resolution] = [];
//       }
      
//       formatsByResolution[resolution].push({
//         format_id: format.format_id,
//         ext: format.ext,
//         quality: resolution,
//         filesize: format.filesize ? (format.filesize / (1024 * 1024)).toFixed(2) + ' MB' : 'Unknown',
//         vcodec: format.vcodec,
//         acodec: format.acodec,
//         url: format.url,
//         fps: format.fps || 0,
//         tbr: format.tbr ? format.tbr.toFixed(2) + ' kbps' : 'Unknown',
//         width: format.width,
//         height: format.height,
//         format_note: format.format_note || '',
//       });
//     });

//     // Sort formats within each resolution group by quality (bitrate)
//     Object.keys(formatsByResolution).forEach(resolution => {
//       formatsByResolution[resolution].sort((a, b) => {
//         // Extract numeric values from tbr strings for comparison
//         const getTbr = (item) => parseFloat(item.tbr) || 0;
//         return getTbr(b) - getTbr(a);
//       });
//     });

//     // Create a cleanly sorted array of all available resolutions
//     const availableResolutions = Object.keys(formatsByResolution)
//       .map(res => parseInt(res.replace('p', '')))
//       .sort((a, b) => b - a)
//       .map(res => `${res}p`);

//     // For each resolution, get the highest quality format
//     const bestFormatsByResolution = {};
//     availableResolutions.forEach(resolution => {
//       if (formatsByResolution[resolution] && formatsByResolution[resolution].length > 0) {
//         bestFormatsByResolution[resolution] = formatsByResolution[resolution][0];
//       }
//     });

//     // If no combined formats are found, try to download and merge best video and audio
//     let mergeRecommendation = null;
//     if (Object.keys(formatsByResolution).length === 0) {
//       // Find best video-only and best audio-only formats
//       const videoFormats = metadata.formats.filter(f => f.vcodec !== 'none' && f.acodec === 'none');
//       const audioFormats = metadata.formats.filter(f => f.vcodec === 'none' && f.acodec !== 'none');
      
//       if (videoFormats.length > 0 && audioFormats.length > 0) {
//         // Sort by quality
//         videoFormats.sort((a, b) => (b.height || 0) - (a.height || 0));
//         audioFormats.sort((a, b) => (b.abr || 0) - (a.abr || 0));
        
//         mergeRecommendation = {
//           video: videoFormats[0].format_id,
//           audio: audioFormats[0].format_id,
//           command: `yt-dlp -f ${videoFormats[0].format_id}+${audioFormats[0].format_id} "${url}"`
//         };
//       }
//     }
//     // Get download command for best overall format
//     const bestResolution = availableResolutions[0];
//     const downloadCommand = bestResolution && bestFormatsByResolution[bestResolution] 
//       ? `yt-dlp -f ${bestFormatsByResolution[bestResolution].format_id} "${url}"` 
//       : (mergeRecommendation ? mergeRecommendation.command : `yt-dlp "${url}"`);

//     return NextResponse.json({
//       title: metadata.title,
//       thumbnail: metadata.thumbnail,
//       duration: metadata.duration,
//       uploader: metadata.uploader,
//       upload_date: metadata.upload_date,
//       availableResolutions,
//       formatsByResolution,
//       bestFormats: bestFormatsByResolution,
//       downloadCommand,
//       mergeRecommendation
//     });
//   } catch (error) {
//     console.error('Error fetching formats:', error);
//     return NextResponse.json({ 
//       error: 'An error occurred while fetching formats.',
//       details: error.message || String(error),
//       code: error.code,
//       path: error.path
//     });
//   }
// }