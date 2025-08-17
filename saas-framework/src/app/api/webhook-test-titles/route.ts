import { NextResponse } from 'next/server';

// Test webhook endpoint to simulate n8n title generation webhook
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log('🎬 Test title generation webhook received payload:', body);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock titles based on the description
    const mockTitles = [
      `🔥 ${body.description?.split(' ').slice(0, 4).join(' ') || 'Amazing Content'} - You Won't Believe What Happens!`,
      `The Ultimate Guide to ${body.description?.split(' ').slice(0, 3).join(' ') || 'This Topic'} (2024)`,
      `Why Everyone is Talking About ${body.description?.split(' ').slice(0, 4).join(' ') || 'This'}`,
      `SHOCKING: ${body.description?.split(' ').slice(0, 5).join(' ') || 'What You Need to Know'}!`,
      `${body.description?.split(' ').slice(0, 3).join(' ') || 'Secret Method'} That Changed Everything`
    ];

    // Return success response (simulating n8n webhook)
    return NextResponse.json(
      { 
        success: true, 
        message: 'Test title generation webhook processed successfully',
        receivedPayload: body,
        generatedTitles: mockTitles,
        referenceTitles: body.titles || [],
        instructions: body.specialInstructions || '',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Test title generation webhook error:', error);
    return NextResponse.json(
      { error: 'Test title generation webhook failed' },
      { status: 500 }
    );
  }
}
