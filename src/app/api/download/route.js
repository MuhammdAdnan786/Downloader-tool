// // app/api/download/route.js
// import { NextResponse } from 'next/server';
// import path from 'path';
// import fs from 'fs/promises';
// import { execFile } from 'child_process';
// import { promisify } from 'util';
// import https from 'https';
// import http from 'http';

// const execFilePromise = promisify(execFile);

// export async function POST(request) {
//   const body = await request.json();
//   const { url, formatId } = body;

//   if (!url || typeof url !== 'string') {
//     return NextResponse.json({ error: 'Invalid URL provided.' });
//   }

//   if (!formatId) {
//     return NextResponse.json({ error: 'No format ID specified.' });
//   }

//   try {
//     // Get absolute path to yt-dlp.exe
//     const execPath = path.join(process.cwd(), 'public', 'bin', 'yt-dlp.exe');
    
//     // Verify the file exists before trying to use it
//     try {
//       await fs.access(execPath);
//     } catch (error) {
//       return NextResponse.json({ 
//         error: 'yt-dlp executable not found. Please ensure it is installed in the correct location.' 
//       });
//     }

//     // Get the video format information first
//     const { stdout } = await execFilePromise(execPath, [
//       '--dump-json',
//       '--no-check-certificates',
//       '--no-warnings',
//       url
//     ]);

//     const metadata = JSON.parse(stdout);
    
//     // Find the requested format
//     let selectedFormat = null;
    
//     if (formatId === '360' || formatId === '480' || formatId === '720' || formatId === '1080') {
//       // Find by resolution
//       const resolution = parseInt(formatId);
      
//       // First try to find a combined format with the requested resolution
//       selectedFormat = metadata.formats.find(format => 
//         format.height === resolution && 
//         format.vcodec !== 'none' && 
//         format.acodec !== 'none'
//       );
      
//       // If not found, find the closest video-only format
//       if (!selectedFormat) {
//         // Get all video formats
//         const videoFormats = metadata.formats.filter(format => 
//           format.vcodec !== 'none' && 
//           format.height && 
//           format.height <= resolution
//         );
        
//         if (videoFormats.length > 0) {
//           // Sort by resolution (descending)
//           videoFormats.sort((a, b) => b.height - a.height);
//           selectedFormat = videoFormats[0];
//         }
//       }
//     } else {
//       // Direct format ID selection
//       selectedFormat = metadata.formats.find(format => format.format_id === formatId);
//     }

//     if (!selectedFormat) {
//       return NextResponse.json({ error: 'Selected format not found.' });
//     }

//     // Get direct video URL
//     const videoUrl = selectedFormat.url;
    
//     // Instead of downloading to server, we'll proxy the stream to the client
//     const protocol = videoUrl.startsWith('https') ? https : http;
    
//     // Create a proxy request to fetch the video data
//     return new Promise((resolve, reject) => {
//       const options = new URL(videoUrl);
      
//       // Setup request options with any required headers
//       const requestOptions = {
//         method: 'GET',
//         headers: {
//           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
//         }
//       };
      
//       // Make request to the video URL
//       const req = protocol.request(options, (response) => {
//         // If we get a redirect, we need to follow it
//         if (response.statusCode === 301 || response.statusCode === 302) {
//           const redirectUrl = response.headers.location;
//           console.log(`Following redirect to: ${redirectUrl}`);
          
//           // Recreate request with new URL
//           const redirectProtocol = redirectUrl.startsWith('https') ? https : http;
//           const redirectReq = redirectProtocol.get(redirectUrl, (redirectResponse) => {
//             // Get filename from metadata
//             const filename = `${metadata.title.replace(/[^\w\s]/gi, '')}.mp4`;
            
//             // Return the response with appropriate headers
//             resolve(new NextResponse(redirectResponse, {
//               status: 200,
//               headers: {
//                 'Content-Type': 'video/mp4',
//                 'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
//               }
//             }));
//           });
          
//           redirectReq.on('error', (error) => {
//             console.error('Error in redirect request:', error);
//             reject(NextResponse.json({ error: 'Failed to download video' }, { status: 500 }));
//           });
//         } else {
//           // Get filename from metadata
//           const filename = `${metadata.title.replace(/[^\w\s]/gi, '')}.mp4`;
          
//           // Return the direct response with appropriate headers
//           resolve(new NextResponse(response, {
//             status: 200,
//             headers: {
//               'Content-Type': 'video/mp4',
//               'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
//             }
//           }));
//         }
//       });
      
//       req.on('error', (error) => {
//         console.error('Error requesting video:', error);
//         reject(NextResponse.json({ error: 'Failed to download video' }, { status: 500 }));
//       });
      
//       req.end();
//     });
    
//   } catch (error) {
//     console.error('Error downloading video:', error);
//     return NextResponse.json({ 
//       error: 'An error occurred while downloading the video.',
//       details: error.message || String(error),
//       code: error.code
//     });
//   }
// }


// app/api/download/route.js
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFilePromise = promisify(execFile);

export async function POST(request) {
  try {
    // Parse the request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }
    
    const { url, formatId } = body;

    // Validate inputs
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL provided.' }, { status: 400 });
    }

    if (!formatId) {
      return NextResponse.json({ error: 'No format ID specified.' }, { status: 400 });
    }

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
      }, { status: 500 });
    }

    // Get the video format information
    let stdout;
    try {
      const result = await execFilePromise(execPath, [
        '--dump-json',
        '--no-check-certificates',
        '--no-warnings',
        url
      ]);
      stdout = result.stdout;
    } catch (execError) {
      console.error('Error executing yt-dlp:', execError);
      return NextResponse.json({ 
        error: 'Failed to get video information', 
        details: execError.message 
      }, { status: 500 });
    }

    // Parse the JSON output from yt-dlp
    let metadata;
    try {
      metadata = JSON.parse(stdout);
    } catch (jsonError) {
      console.error('Error parsing yt-dlp output:', jsonError);
      return NextResponse.json({ 
        error: 'Failed to parse video information', 
        details: jsonError.message 
      }, { status: 500 });
    }

    // Find the requested format first for reference
    let requestedFormat = null;
    
    if (['360', '480', '720', '1080'].includes(formatId.toString())) {
      // Find by resolution
      const resolution = parseInt(formatId);
      
      // First try to find a format with the requested resolution
      requestedFormat = metadata.formats.find(format => 
        format.height === resolution && 
        format.vcodec !== 'none'
      );
      
      // If not found, find the closest video format
      if (!requestedFormat) {
        // Get all video formats
        const videoFormats = metadata.formats.filter(format => 
          format.vcodec !== 'none' && 
          format.height && 
          format.height <= resolution
        );
        
        if (videoFormats.length > 0) {
          // Sort by resolution (descending)
          videoFormats.sort((a, b) => b.height - a.height);
          requestedFormat = videoFormats[0];
        }
      }
    } else {
      // Direct format ID selection
      requestedFormat = metadata.formats.find(format => format.format_id === formatId);
    }
    
    // If we couldn't find the requested format, return an error
    if (!requestedFormat) {
      return NextResponse.json({ error: 'Selected format not found.' }, { status: 404 });
    }
    
    // Get the target resolution from the requested format
    const targetResolution = requestedFormat.height || 360; // Default to 360p if height is not available
    
    // ALWAYS FIND A COMBINED FORMAT (video+audio) closest to the requested resolution
    // This is the key change to ensure users always get a combined format
    let selectedFormat = null;
    
    // Get all combined formats (with both video and audio)
    const combinedFormats = metadata.formats.filter(format => 
      format.vcodec !== 'none' && 
      format.acodec !== 'none' &&
      format.height // Must have a height (video)
    );
    
    if (combinedFormats.length > 0) {
      // Sort combined formats by how close they are to the target resolution
      combinedFormats.sort((a, b) => {
        const aDiff = Math.abs(a.height - targetResolution);
        const bDiff = Math.abs(b.height - targetResolution);
        return aDiff - bDiff; // Sort by closest resolution
      });
      
      // Select the closest combined format
      selectedFormat = combinedFormats[0];
      
      console.log(`User requested ${targetResolution}p, providing combined format with ${selectedFormat.height}p`);
    } else {
      // Fall back to best format with audio if no combined formats available
      console.log('No combined formats found, falling back to best format with audio');
      
      // Try to find a format with audio
      const audioFormats = metadata.formats.filter(format => format.acodec !== 'none');
      
      if (audioFormats.length > 0) {
        // Sort by quality (if video available) or bitrate
        audioFormats.sort((a, b) => {
          if (a.vcodec !== 'none' && b.vcodec !== 'none') {
            return (b.height || 0) - (a.height || 0); // Prefer higher resolution
          }
          return (b.tbr || 0) - (a.tbr || 0); // Or higher bitrate
        });
        
        selectedFormat = audioFormats[0];
      } else {
        // Last resort - use the originally selected format
        selectedFormat = requestedFormat;
      }
    }

    if (!selectedFormat) {
      return NextResponse.json({ error: 'No suitable format found.' }, { status: 404 });
    }

    // Validate that the URL exists and is properly formatted
    if (!selectedFormat.url || typeof selectedFormat.url !== 'string') {
      console.error('Invalid URL format in selected format:', selectedFormat);
      return NextResponse.json({ 
        error: 'Video URL not available in selected format' 
      }, { status: 500 });
    }
    
    // Ensure the URL is properly encoded
    let directUrl = selectedFormat.url;
    
    // Log the URL for debugging (but mask sensitive parts for security)
    const maskedUrl = directUrl.replace(/(\?|&)([^=]+)=([^&]+)/g, '$1$2=[MASKED]');
    console.log('Returning direct URL (masked):', maskedUrl);
    
    // Return the direct URL to the client
    return NextResponse.json({
      directUrl: directUrl,
      formatInfo: {
        resolution: selectedFormat.height,
        ext: selectedFormat.ext,
        formatId: selectedFormat.format_id,
        hasAudio: selectedFormat.acodec !== 'none',
        hasVideo: selectedFormat.vcodec !== 'none',
        requestedResolution: targetResolution,
        actualResolution: selectedFormat.height
      }
    });
  } catch (error) {
    console.error('Error getting download info:', error);
    return NextResponse.json({
      error: 'An error occurred while getting download information.',
      details: error.message || String(error)
    }, { status: 500 });
  }
}