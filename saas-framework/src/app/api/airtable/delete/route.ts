import { NextResponse } from 'next/server';

interface DeleteRequest {
  recordIds: string | string[]; // Single ID or array of IDs
}

export async function DELETE(request: Request) {
  try {
    const { recordIds }: DeleteRequest = await request.json();
    
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableId = process.env.AIRTABLE_TABLE_ID;

    if (!apiKey || !baseId || !tableId) {
      return NextResponse.json(
        { error: 'Missing Airtable configuration' },
        { status: 500 }
      );
    }

    if (!recordIds) {
      return NextResponse.json(
        { error: 'No record IDs provided' },
        { status: 400 }
      );
    }

    // Convert single ID to array for consistent handling
    const idsToDelete = Array.isArray(recordIds) ? recordIds : [recordIds];
    
    if (idsToDelete.length === 0) {
      return NextResponse.json(
        { error: 'No valid record IDs provided' },
        { status: 400 }
      );
    }

    // Airtable allows deleting up to 10 records at once
    const batchSize = 10;
    const deletedRecords = [];
    
    for (let i = 0; i < idsToDelete.length; i += batchSize) {
      const batch = idsToDelete.slice(i, i + batchSize);
      
      // Create query parameters for batch delete
      const queryParams = batch.map(id => `records[]=${encodeURIComponent(id)}`).join('&');
      
      const response = await fetch(
        `https://api.airtable.com/v0/${baseId}/${tableId}?${queryParams}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Airtable delete error:', errorData);
        return NextResponse.json(
          { 
            error: 'Failed to delete records from Airtable',
            details: errorData,
            status: response.status 
          },
          { status: response.status }
        );
      }

      const result = await response.json();
      deletedRecords.push(...result.records);
    }

    console.log(`Successfully deleted ${deletedRecords.length} record(s) from Airtable`);

    return NextResponse.json({
      success: true,
      deletedRecords: deletedRecords,
      deletedCount: deletedRecords.length,
    });

  } catch (error) {
    console.error('Delete API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
