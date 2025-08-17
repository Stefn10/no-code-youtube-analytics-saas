import { NextResponse } from 'next/server';

// Test webhook endpoint to simulate n8n image generation webhook
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log('🖼️ Test image generation webhook received payload:', body);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return success response (simulating n8n webhook)
    return NextResponse.json(
      { 
        success: true, 
        message: 'Test image generation webhook processed successfully',
        receivedPayload: body,
        generatedImages: body.videoData?.map((video: any, index: number) => ({
          videoId: video.id,
          originalTitle: video.fields?.Title || 'Unknown Title',
          thumbnailConcepts: [
            {
              concept: 'Bold Text Overlay',
              description: `Large bold text "${video.fields?.Title || 'TITLE'}" with bright background`,
              style: 'modern'
            },
            {
              concept: 'Split Screen Design',
              description: 'Before/after or comparison style thumbnail',
              style: 'comparison'
            },
            {
              concept: 'Face + Graphics',
              description: 'Creator face with relevant graphics and arrows',
              style: 'personal'
            }
          ],
          estimatedAssets: 3
        })),
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Test image generation webhook error:', error);
    return NextResponse.json(
      { error: 'Test image generation webhook failed' },
      { status: 500 }
    );
  }
}
