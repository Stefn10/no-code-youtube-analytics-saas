import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { videoData } = body;

    if (!videoData || !Array.isArray(videoData)) {
      return NextResponse.json(
        { error: 'Video data array is required' },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.GENERATE_IMAGES_WEBHOOK;
    
    if (!webhookUrl || webhookUrl === 'your_n8n_webhook_url_here') {
      return NextResponse.json(
        { 
          error: 'Generate images webhook not configured', 
          details: 'Please set GENERATE_IMAGES_WEBHOOK in your .env.local file' 
        },
        { status: 500 }
      );
    }

    // Prepare the payload for the n8n webhook
    const payload = {
      videoData,
      timestamp: new Date().toISOString(),
      requestId: `images_${Date.now()}`
    };

    console.log('🖼️ Sending image generation request to webhook:', {
      url: webhookUrl,
      videoCount: videoData.length,
      requestId: payload.requestId
    });

    // Call the n8n webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('Image generation webhook failed:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        error: errorText
      });
      
      return NextResponse.json(
        { 
          error: 'Image generation webhook failed', 
          details: `Status: ${webhookResponse.status} - ${errorText}` 
        },
        { status: webhookResponse.status }
      );
    }

    const webhookResult = await webhookResponse.json();
    console.log('✅ Image generation webhook succeeded:', webhookResult);

    return NextResponse.json({
      success: true,
      message: 'Image generation request sent successfully',
      requestId: payload.requestId,
      videoCount: videoData.length,
      webhookResponse: webhookResult
    });

  } catch (error) {
    console.error('Image generation API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
