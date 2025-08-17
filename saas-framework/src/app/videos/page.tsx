'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Wand2, ImageIcon, RotateCcw } from 'lucide-react';
import { GenerateTitlesModal } from '@/components/generate-titles-modal';

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

// Video button component to ensure proper URL binding
const VideoButton = ({ url, recordId }: { url: string; recordId: string }) => {
  const handleClick = (e: React.MouseEvent) => {
    console.log(`Video button clicked for record ${recordId}:`, url);
    console.log('Actual href:', e.currentTarget.getAttribute('href'));
  };

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
      onClick={handleClick}
    >
      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
      </svg>
      Watch
    </a>
  );
};

export default function VideosPage() {
  const [data, setData] = useState<AirtableResponse | null>(null);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [showTitlesModal, setShowTitlesModal] = useState(false);
  const router = useRouter();

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

      // Debug logging to understand data structure
      console.log('DEBUG - Airtable response:', result);
      if (result.records && result.records.length > 0) {
        console.log('DEBUG - First record fields:', result.records[0].fields);
        console.log('DEBUG - Available columns:', result.columns);
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

  // Handler functions for action buttons
  const handleAddMoreResults = () => {
    router.push('/');
  };

  const handleGenerateTitles = () => {
    if (!data || data.records.length === 0) {
      alert('No videos found to generate titles for.');
      return;
    }
    setShowTitlesModal(true);
  };

  const handleGenerateThumbnailAssets = async () => {
    if (!data || data.records.length === 0) {
      alert('No videos found to generate thumbnail assets for.');
      return;
    }

    try {
      setIsGeneratingImages(true);
      
      // Prepare video data for the webhook
      const videoData = data.records.map(record => ({
        id: record.id,
        fields: record.fields,
        createdTime: record.createdTime
      }));

      console.log('🖼️ Starting image generation for', videoData.length, 'videos');

      const response = await fetch('/api/generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoData }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Image generation failed');
      }

      console.log('✅ Image generation request sent successfully:', result);
      
      // Show success message
      alert(`Image generation started successfully! Request ID: ${result.requestId}\n\nProcessing ${result.videoCount} videos. You'll see the results in your Airtable once the webhook completes.`);
      
    } catch (error) {
      console.error('Image generation error:', error);
      
      if (error instanceof Error && error.message.includes('webhook not configured')) {
        alert('Image generation webhook is not configured. Please set GENERATE_IMAGES_WEBHOOK in your .env.local file.');
      } else {
        alert(`Failed to start image generation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const handleClearResults = async () => {
    if (!data || data.records.length === 0) return;
    
    const confirmed = confirm(`Are you sure you want to delete all ${data.records.length} records? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const recordIds = data.records.map(record => record.id);
      
      const response = await fetch('/api/airtable/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recordIds }),
      });

      if (!response.ok) {
        throw new Error(`Failed to clear results: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Clear results successful:', result);
      
      // Redirect to search page after successful deletion
      router.push('/');
    } catch (error) {
      console.error('Clear results error:', error);
      alert('Failed to clear results. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    const confirmed = confirm('Are you sure you want to delete this record? This action cannot be undone.');
    if (!confirmed) return;

    try {
      setDeletingRecordId(recordId);
      
      const response = await fetch('/api/airtable/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recordIds: recordId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete record: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Delete record successful:', result);
      
      // Refresh the data to reflect the deletion
      await fetchData();
    } catch (error) {
      console.error('Delete record error:', error);
      alert('Failed to delete record. Please try again.');
    } finally {
      setDeletingRecordId(null);
    }
  };

  const renderTableCell = (value: unknown, columnName: string, recordId?: string) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">-</span>;
    }

    // Debug logging to help understand data structure
    if (columnName === 'Thumbnail' || columnName === 'Open Video') {
      console.log(`DEBUG - ${columnName} column data:`, value);
    }
    
    // Handle Thumbnail column - expect array of objects with url field
    if (columnName === 'Thumbnail' && Array.isArray(value)) {
      if (value.length > 0 && value[0] && typeof value[0] === 'object' && 'url' in value[0]) {
        const thumbnailUrl = (value[0] as { url: string }).url;
        return (
          <div className="flex justify-center">
            <img 
              src={thumbnailUrl} 
              alt="Video thumbnail" 
              className="w-32 h-20 object-cover rounded-md shadow-sm border"
              loading="lazy"
              onLoad={() => console.log('Thumbnail loaded successfully:', thumbnailUrl)}
              onError={(e) => {
                console.error('Thumbnail failed to load:', thumbnailUrl);
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTI4IDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTI4IiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01NCA0MEw3NCA1Mkw1NCA2NFY0MFoiIGZpbGw9IiM5Q0E0QUYiLz4KPC9zdmc+';
                target.alt = 'Thumbnail unavailable';
              }}
            />
          </div>
        );
      } else {
        console.log('Thumbnail data structure unexpected:', value);
        return <span className="text-muted-foreground italic">No thumbnail</span>;
      }
    }
    
    // Handle Open Video column - expect URL string or object with URL
    if (columnName === 'Open Video') {
      let videoUrl: string | null = null;
      
      // Enhanced debugging for URL extraction
      console.log('DEBUG - Processing Open Video value:', {
        type: typeof value,
        isArray: Array.isArray(value),
        value: value
      });
      
      if (typeof value === 'string' && value.startsWith('http')) {
        videoUrl = value;
        console.log('DEBUG - Found string URL:', videoUrl);
      } else if (Array.isArray(value) && value.length > 0) {
        console.log('DEBUG - Processing array with length:', value.length);
        // Sometimes URLs might be in an array
        if (typeof value[0] === 'string' && value[0].startsWith('http')) {
          videoUrl = value[0];
          console.log('DEBUG - Found array string URL:', videoUrl);
        } else if (typeof value[0] === 'object' && value[0] && 'url' in value[0]) {
          videoUrl = (value[0] as { url: string }).url;
          console.log('DEBUG - Found array object URL:', videoUrl);
        }
      } else if (typeof value === 'object' && value && 'url' in value) {
        videoUrl = (value as { url: string }).url;
        console.log('DEBUG - Found object URL:', videoUrl);
      }
      
      if (videoUrl) {
        return <VideoButton url={videoUrl} recordId={recordId || 'unknown'} />;
      } else {
        console.log('Open Video data structure unexpected:', value);
        return <span className="text-muted-foreground italic">No video URL</span>;
      }
    }
    
    // Default handling for other columns
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    if (typeof value === 'object') {
      return (
        <details className="cursor-pointer">
          <summary className="text-sm text-muted-foreground">View data</summary>
          <pre className="text-xs mt-2 p-2 bg-muted rounded max-w-xs overflow-auto">
            {JSON.stringify(value, null, 2)}
          </pre>
        </details>
      );
    }
    
    return String(value);
  };

  // Columns to hide from the table display
  const hiddenColumns = [
    'Video ID',
    'Description', 
    'Created',
    '# Subscribers',
    'YouTube URL'
  ];

  // Filter out hidden columns
  const visibleColumns = data?.columns.filter(column => 
    !hiddenColumns.includes(column)
  ) || [];

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
              <CardTitle>YouTube Analytics Data</CardTitle>
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
                <>
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 justify-end mb-4">
                    <Button
                      onClick={handleAddMoreResults}
                      variant="default"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add More Results
                    </Button>
                    
                    <Button
                      onClick={handleGenerateTitles}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      disabled={data.records.length === 0}
                    >
                      <Wand2 className="w-4 h-4" />
                      Generate Titles
                    </Button>
                    
                    <Button
                      onClick={handleGenerateThumbnailAssets}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      disabled={isGeneratingImages || data.records.length === 0}
                    >
                      {isGeneratingImages ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      ) : (
                        <ImageIcon className="w-4 h-4" />
                      )}
                      {isGeneratingImages ? 'Generating...' : 'Generate Thumbnail Assets'}
                    </Button>
                    
                    <Button
                      onClick={handleClearResults}
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-2"
                      disabled={isDeleting}
                    >
                      <RotateCcw className="w-4 h-4" />
                      {isDeleting ? 'Clearing...' : 'Clear Results'}
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border">
                    <thead>
                      <tr className="bg-muted/50">
                        {visibleColumns.map((column) => (
                          <th key={column} className="border border-border p-3 text-left font-semibold">
                            {column}
                          </th>
                        ))}
                        <th className="border border-border p-3 text-left font-semibold w-24">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.records.map((record) => (
                        <tr key={record.id} className="hover:bg-muted/25">
                          {visibleColumns.map((column) => (
                            <td key={column} className="border border-border p-3">
                              {renderTableCell(record.fields[column], column, record.id)}
                            </td>
                          ))}
                          <td className="border border-border p-3">
                            <Button
                              onClick={() => handleDeleteRecord(record.id)}
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={deletingRecordId === record.id}
                            >
                              {deletingRecordId === record.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </>
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
              <CardTitle className="text-lg">Visible Columns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{visibleColumns.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Visible Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                {visibleColumns.slice(0, 3).map((column) => (
                  <div key={column} className="truncate">{column}</div>
                ))}
                {visibleColumns.length > 3 && (
                  <div className="text-muted-foreground">
                    +{visibleColumns.length - 3} more...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generate Titles Modal */}
      <GenerateTitlesModal
        isOpen={showTitlesModal}
        onClose={() => setShowTitlesModal(false)}
        videoData={data?.records || []}
      />
    </div>
  );
}
