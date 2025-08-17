import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { titles, specialInstructions, description } = body;

    if (!titles || !Array.isArray(titles) || titles.length === 0) {
      return NextResponse.json(
        { error: 'Reference titles array is required' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      return NextResponse.json(
        { error: 'Video description/transcript is required' },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.GENERATE_TITLES_WEBHOOK;
    
    if (!webhookUrl || webhookUrl === 'your_n8n_webhook_url_here') {
      return NextResponse.json(
        { 
          error: 'Generate titles webhook not configured', 
          details: 'Please set GENERATE_TITLES_WEBHOOK in your .env.local file' 
        },
        { status: 500 }
      );
    }

    // Prepare the payload for the n8n webhook
    const payload = {
      titles: titles,
      specialInstructions: specialInstructions || '',
      description: description.trim(),
      timestamp: new Date().toISOString(),
      requestId: `titles_${Date.now()}`
    };

    console.log('🎬 Sending title generation request to webhook:', {
      url: webhookUrl,
      titlesCount: titles.length,
      hasInstructions: !!specialInstructions,
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
      console.error('Title generation webhook failed:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        error: errorText
      });
      
      return NextResponse.json(
        { 
          error: 'Title generation webhook failed', 
          details: `Status: ${webhookResponse.status} - ${errorText}` 
        },
        { status: webhookResponse.status }
      );
    }

    const webhookResult = await webhookResponse.json();
    console.log('✅ Title generation webhook succeeded:', webhookResult);
    console.log('🔍 Webhook result type:', typeof webhookResult);
    console.log('🔍 Webhook result is array:', Array.isArray(webhookResult));
    console.log('🔍 Webhook result length:', webhookResult?.length);
    console.log('🔍 Webhook result keys:', Object.keys(webhookResult));
    
    // Handle the webhook response format: array of strings directly
    let generatedTitles = [];
    if (Array.isArray(webhookResult) && webhookResult.length > 0) {
      // n8n is sending array of strings directly
      generatedTitles = webhookResult;
      console.log('🔍 Extracted from array of strings:', generatedTitles);
    } else if (webhookResult.generatedTitles) {
      generatedTitles = webhookResult.generatedTitles;
      console.log('🔍 Extracted from generatedTitles:', generatedTitles);
    } else if (webhookResult.titles) {
      generatedTitles = webhookResult.titles;
      console.log('🔍 Extracted from titles:', generatedTitles);
    }
    
    console.log('🔍 Final extracted titles:', generatedTitles);
    console.log('🔍 Titles length:', generatedTitles.length);

    const responseData = {
      success: true,
      message: 'Title generation request sent successfully',
      requestId: payload.requestId,
      titlesCount: titles.length,
      generatedTitles: generatedTitles,
      webhookResponse: webhookResult
    };

    console.log('🔍 Final API response:', responseData);
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Title generation API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
