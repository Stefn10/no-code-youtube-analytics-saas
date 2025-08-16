import { NextResponse } from 'next/server';

// Temporary test webhook endpoint to simulate n8n webhook
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log('🔍 Test webhook received search payload:', body);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return success response (simulating n8n webhook)
    return NextResponse.json(
      { 
        success: true, 
        message: 'Test webhook processed successfully',
        receivedPayload: body,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json(
      { error: 'Test webhook failed' },
      { status: 500 }
    );
  }
}
