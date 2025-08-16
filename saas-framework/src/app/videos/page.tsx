'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
  createdTime: string;
}

interface AirtableResponse {
  records: AirtableRecord[];
  columns: string[];
  totalRecords: number;
}

interface ErrorResponse {
  error: string;
  details?: string;
  status?: number;
}

export default function VideosPage() {
  const [data, setData] = useState<AirtableResponse | null>(null);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/airtable');
      const result = await response.json();

      if (!response.ok) {
        setError(result);
        return;
      }

      setData(result);
    } catch (err) {
      setError({
        error: 'Network error',
        details: err instanceof Error ? err.message : 'Failed to fetch data'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderTableCell = (value: unknown) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">-</span>;
    }
    
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return String(value);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Videos Dashboard</h1>
        <p className="text-xl text-muted-foreground">
          Data from your Airtable base
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Airtable Data</CardTitle>
              <CardDescription>
                {data ? `${data.totalRecords} records found` : 'Loading data...'}
              </CardDescription>
            </div>
            <Button 
              onClick={fetchData} 
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading data from Airtable...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/15 border border-destructive/50 rounded-lg p-6">
              <h3 className="font-semibold text-destructive mb-2">Error: {error.error}</h3>
              {error.details && (
                <p className="text-sm text-muted-foreground mb-4">{error.details}</p>
              )}
              {error.status && (
                <p className="text-sm text-muted-foreground">Status Code: {error.status}</p>
              )}
              <div className="mt-4 p-4 bg-muted rounded border">
                <h4 className="font-semibold mb-2">Configuration Check:</h4>
                <ul className="text-sm space-y-1">
                  <li>✓ Make sure your .env.local file exists in the project root</li>
                  <li>✓ Verify AIRTABLE_API_KEY is set correctly</li>
                  <li>✓ Verify AIRTABLE_BASE_ID is set correctly</li>
                  <li>✓ Verify AIRTABLE_TABLE_ID is set correctly</li>
                  <li>✓ Restart your development server after updating .env.local</li>
                </ul>
              </div>
            </div>
          )}

          {data && !loading && !error && (
            <div className="space-y-4">
              {data.records.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No records found in your Airtable.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border border-border p-3 text-left font-semibold">ID</th>
                        {data.columns.map((column) => (
                          <th key={column} className="border border-border p-3 text-left font-semibold">
                            {column}
                          </th>
                        ))}
                        <th className="border border-border p-3 text-left font-semibold">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.records.map((record) => (
                        <tr key={record.id} className="hover:bg-muted/25">
                          <td className="border border-border p-3 font-mono text-sm">
                            {record.id}
                          </td>
                          {data.columns.map((column) => (
                            <td key={column} className="border border-border p-3">
                              {renderTableCell(record.fields[column])}
                            </td>
                          ))}
                          <td className="border border-border p-3 text-sm text-muted-foreground">
                            {new Date(record.createdTime).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {data && !loading && !error && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Total Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.totalRecords}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Columns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.columns.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                {data.columns.slice(0, 3).map((column) => (
                  <div key={column} className="truncate">{column}</div>
                ))}
                {data.columns.length > 3 && (
                  <div className="text-muted-foreground">
                    +{data.columns.length - 3} more...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
