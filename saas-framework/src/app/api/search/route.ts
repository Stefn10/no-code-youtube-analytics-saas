import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      q, 
      regionCode, 
      relevanceLanguage, 
      videoDuration, 
      publishedAfter, 
      publishedBefore, 
      order, 
      maxResults 
    } = body;

    if (!q || typeof q !== 'string') {
      return NextResponse.json(
        { error: 'Search query (q) is required' },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.SEARCH_WEBHOOK;
    
    if (!webhookUrl || webhookUrl === 'your_n8n_webhook_url_here') {
      return NextResponse.json(
        { 
          error: 'Search webhook not configured', 
          details: 'Please set SEARCH_WEBHOOK in your .env.local file' 
        },
        { status: 500 }
      );
    }

    // Prepare the complete search payload for n8n webhook
    const searchPayload: Record<string, unknown> = { q };
    
    // Add YouTube API parameters if provided
    if (regionCode && regionCode !== 'any') searchPayload.regionCode = regionCode;
    if (relevanceLanguage && relevanceLanguage !== 'any') searchPayload.relevanceLanguage = relevanceLanguage;
    if (videoDuration && videoDuration !== 'any') searchPayload.videoDuration = videoDuration;
    if (publishedAfter) {
      // Convert date to RFC 3339 format
      searchPayload.publishedAfter = new Date(publishedAfter).toISOString();
    }
    if (publishedBefore) {
      // Convert date to RFC 3339 format  
      searchPayload.publishedBefore = new Date(publishedBefore).toISOString();
    }
    if (order && order !== 'relevance') searchPayload.order = order;
    if (maxResults && maxResults !== 5) searchPayload.maxResults = maxResults;

    // Call the n8n webhook with the complete search payload
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchPayload),
    });

    if (!webhookResponse.ok) {
      return NextResponse.json(
        { 
          error: 'Webhook call failed', 
          status: webhookResponse.status,
          details: await webhookResponse.text()
        },
        { status: webhookResponse.status }
      );
    }

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Search webhook called successfully',
        query: q,
        parameters: searchPayload
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
