import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, thumbnailUrl, steps, width, height, denoising_strength } = body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Thumbnail prompt is required' },
        { status: 400 }
      );
    }

    if (!thumbnailUrl || typeof thumbnailUrl !== 'string' || !thumbnailUrl.startsWith('http')) {
      return NextResponse.json(
        { error: 'Valid thumbnail URL is required' },
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
      prompt: prompt.trim(),
      thumbnailUrl: thumbnailUrl,
      steps: steps || 18,
      width: width || 768,
      height: height || 768,
      denoising_strength: denoising_strength || 0.6
    };

    console.log('🖼️ Sending thumbnail generation request to webhook:', {
      url: webhookUrl,
      prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
      thumbnailUrl: thumbnailUrl,
      steps: payload.steps,
      width: payload.width,
      height: payload.height,
      denoising_strength: payload.denoising_strength
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
      console.error('Thumbnail generation webhook failed:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        error: errorText
      });
      
      return NextResponse.json(
        { 
          error: 'Thumbnail generation webhook failed', 
          details: `Status: ${webhookResponse.status} - ${errorText}` 
        },
        { status: webhookResponse.status }
      );
    }

    const webhookResult = await webhookResponse.json();
    console.log('✅ Thumbnail generation webhook succeeded:', webhookResult);
    
    // Handle the webhook response format: single URL string or object with imageUrl
    let imageUrl = null;
    if (typeof webhookResult === 'string' && webhookResult.startsWith('http')) {
      imageUrl = webhookResult;
    } else if (webhookResult.imageUrl) {
      imageUrl = webhookResult.imageUrl;
    } else if (webhookResult.url) {
      imageUrl = webhookResult.url;
    }
    
    console.log('🔍 Extracted image URL:', imageUrl);

    const responseData = {
      success: true,
      message: 'Thumbnail generation request sent successfully',
      requestId: payload.requestId,
      imageUrl: imageUrl,
      webhookResponse: webhookResult
    };

    console.log('🔍 Final API response:', responseData);
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Thumbnail generation API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
