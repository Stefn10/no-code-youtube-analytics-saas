import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if environment variables are set
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableId = process.env.AIRTABLE_TABLE_ID;

    if (!apiKey || !baseId || !tableId) {
      return NextResponse.json(
        { 
          error: 'Missing Airtable configuration', 
          details: 'Please check your .env.local file for AIRTABLE_API_KEY, AIRTABLE_BASE_ID, and AIRTABLE_TABLE_ID' 
        },
        { status: 500 }
      );
    }

    // Fetch data from Airtable
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${tableId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { 
          error: 'Airtable API error', 
          status: response.status,
          details: errorData 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract column names from the first record (if any records exist)
    const columns = data.records && data.records.length > 0 
      ? Object.keys(data.records[0].fields)
      : [];

    return NextResponse.json({
      records: data.records || [],
      columns,
      totalRecords: data.records?.length || 0
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
