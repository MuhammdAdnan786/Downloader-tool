import { getFbVideoInfo } from 'fb-downloader-scrapper';

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url || !url.includes('facebook.com')) {
      return Response.json({ success: false, message: 'Invalid Facebook URL' }, { status: 400 });
    }

    const result = await getFbVideoInfo(url);

    if (!result || !result.sd || !result.hd) {
      return Response.json({ success: false, message: 'Video not found or private' }, { status: 404 });
    }

    return Response.json({
      success: true,
      data: {
        title: result.title || 'Facebook Video',
        thumbnail: result.thumbnail,
        sd: result.sd,
        hd: result.hd,
      },
    });
  } catch (error) {
    console.error('Download Error:', error);
    return Response.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
