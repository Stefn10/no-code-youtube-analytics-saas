'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageIcon, Wand2, RefreshCw, AlertCircle } from 'lucide-react';

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
  createdTime: string;
}

interface GenerateThumbnailModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoData: AirtableRecord | null;
}

export function GenerateThumbnailModal({ isOpen, onClose, videoData }: GenerateThumbnailModalProps) {
  // Form state
  const [prompt, setPrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  
  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setPrompt('');
    setGeneratedImageUrl(null);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleGenerate = async (isRegenerate = false) => {
    if (!prompt.trim()) {
      setError('Please enter a prompt for the thumbnail.');
      return;
    }

    if (!videoData) {
      setError('No video data available.');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      // Get thumbnail URL from Airtable data
      const thumbnailUrl = getOriginalThumbnailUrl();
      if (!thumbnailUrl) {
        throw new Error('Could not find thumbnail URL in the data.');
      }

      const payload = {
        prompt: prompt.trim(),
        thumbnailUrl: thumbnailUrl,
        steps: 18,
        width: 768,
        height: 768,
        denoising_strength: 0.6
      };

      console.log('🖼️ Sending thumbnail generation request:', payload);

      const response = await fetch('/api/generate-thumb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Thumbnail generation failed');
      }

      console.log('✅ Thumbnail generation successful:', result);
      
      if (result.imageDataUrl) {
        setGeneratedImageUrl(result.imageDataUrl);
      } else {
        throw new Error('No image data URL received from API');
      }

    } catch (error) {
      console.error('Thumbnail generation error:', error);
      
      if (error instanceof Error && error.message.includes('webhook not configured')) {
        setError('Thumbnail generation webhook is not configured. Please set GENERATE_IMAGES_WEBHOOK in your .env.local file.');
      } else {
        setError(`Failed to generate thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerate(true);
  };

  const getVideoUrl = (video: AirtableRecord): string | null => {
    // Try to extract video URL from various possible field names
    const possibleFields = ['Open Video', 'YouTube URL', 'Video URL', 'URL'];
    
    for (const fieldName of possibleFields) {
      const fieldValue = video.fields[fieldName];
      if (fieldValue) {
        if (typeof fieldValue === 'string' && fieldValue.startsWith('http')) {
          return fieldValue;
        } else if (Array.isArray(fieldValue) && fieldValue.length > 0) {
          if (typeof fieldValue[0] === 'string' && fieldValue[0].startsWith('http')) {
            return fieldValue[0];
          } else if (typeof fieldValue[0] === 'object' && fieldValue[0] && 'url' in fieldValue[0]) {
            return (fieldValue[0] as { url: string }).url;
          }
        } else if (typeof fieldValue === 'object' && fieldValue && 'url' in fieldValue) {
          return (fieldValue as { url: string }).url;
        }
      }
    }
    
    return null;
  };

  const getVideoTitle = (): string => {
    if (!videoData) return '';
    return (videoData.fields.Title as string) || 'Untitled Video';
  };

  const getChannelName = (): string => {
    if (!videoData) return '';
    return (videoData.fields['Channel Name'] as string) || 'Unknown Channel';
  };

  const getOriginalThumbnailUrl = (): string | null => {
    if (!videoData) return null;
    
    const thumbnailField = videoData.fields['Thumbnail'];
    if (Array.isArray(thumbnailField) && thumbnailField.length > 0) {
      const thumbnail = thumbnailField[0];
      if (thumbnail && typeof thumbnail === 'object' && 'url' in thumbnail) {
        return (thumbnail as { url: string }).url;
      }
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Generate Thumbnail
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Context */}
          {videoData && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {getChannelName()}
              </p>
              <p className="text-sm">{getVideoTitle()}</p>
            </div>
          )}

          {/* Prompt Input */}
          <div className="space-y-3">
            <Label htmlFor="prompt" className="text-base font-medium">
              Thumbnail Prompt *
            </Label>
            <Input
              id="prompt"
              placeholder="e.g., A modern tech workspace with laptop, coffee, and clean design. Professional thumbnail style with bold text overlay..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="text-sm"
              disabled={isGenerating}
            />
            <p className="text-xs text-muted-foreground">
              Describe the thumbnail you want to generate. Be specific about style, colors, and elements.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-destructive/15 border border-destructive/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          {/* Image Display Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium">Thumbnail Comparison</h3>
              {generatedImageUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Original Thumbnail */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Original Thumbnail</h4>
                <div className="border-2 border-muted-foreground/25 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                  {getOriginalThumbnailUrl() ? (
                    <img
                      src={getOriginalThumbnailUrl()!}
                      alt="Original thumbnail"
                      className="max-w-full max-h-[280px] object-contain rounded-md shadow-sm"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No original thumbnail available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Generated Thumbnail */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Generated Thumbnail</h4>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                  {isGenerating ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Generating thumbnail...</p>
                    </div>
                  ) : generatedImageUrl ? (
                    <img
                      src={generatedImageUrl}
                      alt="Generated thumbnail"
                      className="max-w-full max-h-[280px] object-contain rounded-md shadow-lg"
                      onError={(e) => {
                        console.error('Failed to load generated image:', generatedImageUrl);
                        setError('Failed to load the generated image. Please try regenerating.');
                      }}
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Your generated thumbnail will appear here</p>
                      <p className="text-xs">Click "Generate Thumbnail" to create your first image</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button
              onClick={() => handleGenerate(false)}
              disabled={isGenerating || !prompt.trim()}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Thumbnail
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
