import { NextResponse } from 'next/server';

// Test webhook endpoint to simulate n8n thumbnail generation webhook
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log('🖼️ Test thumbnail generation webhook received payload:', body);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a mock image URL based on the prompt
    const mockImageUrl = `https://picsum.photos/1920/1080?random=${Date.now()}`;
    
    // Return success response (simulating n8n webhook)
    return NextResponse.json(
      { 
        success: true, 
        message: 'Test thumbnail generation webhook processed successfully',
        receivedPayload: body,
        imageUrl: mockImageUrl,
        prompt: body.prompt || '',
        thumbnailUrl: body.thumbnailUrl || '',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Test thumbnail generation webhook error:', error);
    return NextResponse.json(
      { error: 'Test thumbnail generation webhook failed' },
      { status: 500 }
    );
  }
}
