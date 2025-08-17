'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Wand2, Copy, CheckCircle, AlertCircle } from 'lucide-react';

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
  createdTime: string;
}

interface GeneratedTitle {
  title: string;
  id: string;
}

interface GenerateTitlesModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoData: AirtableRecord[];
}

export function GenerateTitlesModal({ isOpen, onClose, videoData }: GenerateTitlesModalProps) {
  // Form state
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState<GeneratedTitle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [copiedTitles, setCopiedTitles] = useState<Set<string>>(new Set());

  // Extract titles from video data
  const availableTitles = videoData.map(video => ({
    id: video.id,
    title: video.fields.Title as string || 'Untitled',
    channel: video.fields['Channel Name'] as string || 'Unknown Channel'
  }));

  const handleTitleToggle = (titleId: string) => {
    setSelectedTitles(prev => 
      prev.includes(titleId) 
        ? prev.filter(id => id !== titleId)
        : [...prev, titleId]
    );
  };

  const handleSelectAll = () => {
    const allTitleIds = availableTitles.map(t => t.id);
    setSelectedTitles(allTitleIds);
  };

  const handleDeselectAll = () => {
    setSelectedTitles([]);
  };

  const resetForm = () => {
    setSelectedTitles([]);
    setSpecialInstructions('');
    setVideoDescription('');
    setShowResults(false);
    setGeneratedTitles([]);
    setError(null);
    setRetryCount(0);
    setCopiedTitles(new Set());
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (selectedTitles.length === 0) {
      setError('Please select at least one title for context.');
      return;
    }

    if (!videoDescription.trim()) {
      setError('Please provide a video description or transcript.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get selected titles data
      const selectedTitlesData = availableTitles
        .filter(t => selectedTitles.includes(t.id))
        .map(t => t.title);

      const payload = {
        titles: selectedTitlesData,
        specialInstructions: specialInstructions.trim(),
        description: videoDescription.trim()
      };

      console.log('🎬 Sending title generation request:', payload);

      const response = await fetch('/api/generate-titles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Title generation failed');
      }

      // Parse the titles from response
      const titles = result.generatedTitles || result.titles || [];
      const formattedTitles = titles.map((title: string, index: number) => ({
        id: `title_${index}`,
        title: title
      }));

      setGeneratedTitles(formattedTitles);
      setShowResults(true);
      setRetryCount(0);

    } catch (error) {
      console.error('Title generation error:', error);
      
      if (error instanceof Error && error.message.includes('webhook not configured')) {
        setError('Title generation webhook is not configured. Please set GENERATE_TITLES_WEBHOOK in your .env.local file.');
      } else {
        setError(`Failed to generate titles: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    if (retryCount >= 1) {
      setError('Maximum retry attempts reached. Please check your configuration and try again later.');
      return;
    }
    
    setRetryCount(prev => prev + 1);
    await handleSubmit();
  };

  const handleCopyTitle = async (title: string, titleId: string) => {
    try {
      await navigator.clipboard.writeText(title);
      setCopiedTitles(prev => new Set([...prev, titleId]));
      
      // Clear the copied status after 2 seconds
      setTimeout(() => {
        setCopiedTitles(prev => {
          const newSet = new Set(prev);
          newSet.delete(titleId);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to copy title:', error);
    }
  };

  const handleTryAgain = () => {
    setShowResults(false);
    setGeneratedTitles([]);
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            {showResults ? 'Generated Titles' : 'Generate Video Titles'}
          </DialogTitle>
        </DialogHeader>

        {!showResults ? (
          <div className="space-y-6">
            {/* Title Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Select Reference Titles</Label>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="text-xs"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeselectAll}
                    className="text-xs"
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                {availableTitles.map((titleData) => (
                  <div key={titleData.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={titleData.id}
                      checked={selectedTitles.includes(titleData.id)}
                      onCheckedChange={() => handleTitleToggle(titleData.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor={titleData.id}
                        className="text-sm font-medium cursor-pointer block"
                      >
                        {titleData.title}
                      </label>
                      <p className="text-xs text-muted-foreground">{titleData.channel}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected: {selectedTitles.length} of {availableTitles.length} titles
              </p>
            </div>

            {/* Special Instructions */}
            <div className="space-y-2">
              <Label htmlFor="instructions" className="text-base font-medium">
                Special Instructions
              </Label>
              <Input
                id="instructions"
                placeholder="e.g., Make them more clickbait, focus on benefits, target beginners..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="text-sm"
              />
            </div>

            {/* Video Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-medium">
                Video Description / Transcript *
              </Label>
              <textarea
                id="description"
                placeholder="Paste your video description, transcript, or key talking points here..."
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                className="w-full h-32 px-3 py-2 text-sm border border-input bg-background rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                required
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-destructive/15 border border-destructive/50 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-destructive">{error}</p>
                  {retryCount < 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRetry}
                      className="mt-2 text-destructive hover:text-destructive"
                    >
                      Try Again
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleSubmit}
                disabled={isLoading || selectedTitles.length === 0 || !videoDescription.trim()}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generate Titles!
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Results */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Generated {generatedTitles.length} title suggestions:
              </p>
              
              <div className="space-y-3">
                {generatedTitles.map((titleData) => (
                  <div
                    key={titleData.id}
                    className="border rounded-lg p-4 flex items-start justify-between gap-3 hover:bg-muted/50 transition-colors"
                  >
                    <p className="text-sm flex-1 leading-relaxed">{titleData.title}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyTitle(titleData.title, titleData.id)}
                      className="flex items-center gap-2 flex-shrink-0"
                    >
                      {copiedTitles.has(titleData.id) ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Results Actions */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleTryAgain}
              >
                Try Again
              </Button>
              <Button onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
