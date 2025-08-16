'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Search, Loader2, ChevronDown, ChevronUp, Settings } from "lucide-react";

interface AdvancedSearchParams {
  regionCode: string;
  relevanceLanguage: string;
  videoDuration: string;
  publishedAfter: string;
  publishedBefore: string;
  order: string;
  maxResults: number;
}

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [webhookError, setWebhookError] = useState<string | null>(null);
  
  // Advanced search parameters
  const [advancedParams, setAdvancedParams] = useState<AdvancedSearchParams>({
    regionCode: "any",
    relevanceLanguage: "any",
    videoDuration: "any",
    publishedAfter: "",
    publishedBefore: "",
    order: "relevance",
    maxResults: 5
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setWebhookError(null);

    try {
      // Prepare search payload with basic query and advanced parameters
      const searchPayload = {
        q: searchQuery,
        // Only include advanced parameters if they have meaningful values
        ...(advancedParams.regionCode && advancedParams.regionCode !== 'any' && { regionCode: advancedParams.regionCode }),
        ...(advancedParams.relevanceLanguage && advancedParams.relevanceLanguage !== 'any' && { relevanceLanguage: advancedParams.relevanceLanguage }),
        ...(advancedParams.videoDuration !== 'any' && { videoDuration: advancedParams.videoDuration }),
        ...(advancedParams.publishedAfter && { publishedAfter: advancedParams.publishedAfter }),
        ...(advancedParams.publishedBefore && { publishedBefore: advancedParams.publishedBefore }),
        ...(advancedParams.order !== 'relevance' && { order: advancedParams.order }),
        ...(advancedParams.maxResults !== 5 && { maxResults: advancedParams.maxResults })
      };

      // Call the search webhook API
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchPayload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Webhook was successful, redirect to videos page
        router.push('/videos');
      } else {
        // Handle webhook error
        setWebhookError(data.error || 'Search webhook failed');
        setIsSearching(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setWebhookError('Network error occurred while searching');
      setIsSearching(false);
    }
  };

  const resetAdvancedSearch = () => {
    setAdvancedParams({
      regionCode: "any",
      relevanceLanguage: "any",
      videoDuration: "any",
      publishedAfter: "",
      publishedBefore: "",
      order: "relevance",
      maxResults: 5
    });
  };



  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            YouTube Video Search
          </h1>
          <p className="text-xl text-muted-foreground">
            Search for YouTube videos with powerful filtering options
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-6">
          {/* Main Search Box */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Search for videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-6 text-lg rounded-full border-2 focus:border-primary shadow-lg"
              disabled={isSearching}
            />
          </div>

          {/* Advanced Search Toggle */}
          <div className="flex justify-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
              <span>Advanced Search</span>
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {/* Advanced Search Panel */}
          {showAdvanced && (
            <Card className="border-2 border-dashed">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Location & Language */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg mb-4">Location & Language</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="regionCode">Region</Label>
                      <Select 
                        value={advancedParams.regionCode} 
                        onValueChange={(value) => setAdvancedParams(prev => ({...prev, regionCode: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any region</SelectItem>
                          <SelectItem value="US">🇺🇸 United States</SelectItem>
                          <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
                          <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                          <SelectItem value="AU">🇦🇺 Australia</SelectItem>
                          <SelectItem value="DE">🇩🇪 Germany</SelectItem>
                          <SelectItem value="FR">🇫🇷 France</SelectItem>
                          <SelectItem value="JP">🇯🇵 Japan</SelectItem>
                          <SelectItem value="KR">🇰🇷 South Korea</SelectItem>
                          <SelectItem value="IN">🇮🇳 India</SelectItem>
                          <SelectItem value="BR">🇧🇷 Brazil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="relevanceLanguage">Language</Label>
                      <Select 
                        value={advancedParams.relevanceLanguage} 
                        onValueChange={(value) => setAdvancedParams(prev => ({...prev, relevanceLanguage: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any language</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="ja">Japanese</SelectItem>
                          <SelectItem value="ko">Korean</SelectItem>
                          <SelectItem value="pt">Portuguese</SelectItem>
                          <SelectItem value="hi">Hindi</SelectItem>
                          <SelectItem value="zh">Chinese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Content Filters */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg mb-4">Content Filters</h3>
                    
                    <div className="space-y-3">
                      <Label>Video Duration</Label>
                      <RadioGroup 
                        value={advancedParams.videoDuration} 
                        onValueChange={(value) => setAdvancedParams(prev => ({...prev, videoDuration: value}))}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="any" id="duration-any" />
                          <Label htmlFor="duration-any">Any duration</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="short" id="duration-short" />
                          <Label htmlFor="duration-short">Short (&lt; 4 minutes)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medium" id="duration-medium" />
                          <Label htmlFor="duration-medium">Medium (4-20 minutes)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="long" id="duration-long" />
                          <Label htmlFor="duration-long">Long (&gt; 20 minutes)</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxResults">Max Results: {advancedParams.maxResults}</Label>
                      <Input
                        type="range"
                        min="1"
                        max="50"
                        value={advancedParams.maxResults}
                        onChange={(e) => setAdvancedParams(prev => ({...prev, maxResults: parseInt(e.target.value)}))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1</span>
                        <span>50</span>
                      </div>
                    </div>
                  </div>

                  {/* Date Filters */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg mb-4">Date Range</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="publishedAfter">Published After</Label>
                      <Input
                        type="date"
                        value={advancedParams.publishedAfter}
                        onChange={(e) => setAdvancedParams(prev => ({...prev, publishedAfter: e.target.value}))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="publishedBefore">Published Before</Label>
                      <Input
                        type="date"
                        value={advancedParams.publishedBefore}
                        onChange={(e) => setAdvancedParams(prev => ({...prev, publishedBefore: e.target.value}))}
                      />
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg mb-4">Sort & Order</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="order">Sort by</Label>
                      <Select 
                        value={advancedParams.order} 
                        onValueChange={(value) => setAdvancedParams(prev => ({...prev, order: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="relevance">Relevance</SelectItem>
                          <SelectItem value="date">Upload Date</SelectItem>
                          <SelectItem value="viewCount">View Count</SelectItem>
                          <SelectItem value="rating">Rating</SelectItem>
                          <SelectItem value="title">Title</SelectItem>
                          <SelectItem value="videoCount">Video Count</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Reset Advanced Search */}
                <div className="mt-6 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetAdvancedSearch}
                    className="w-full"
                  >
                    Reset Advanced Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search Buttons */}
          <div className="flex justify-center space-x-4">
            <Button 
              type="submit" 
              disabled={isSearching || !searchQuery.trim()}
              className="px-8 py-3"
              size="lg"
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching videos...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search Videos
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setWebhookError(null);
                resetAdvancedSearch();
              }}
              className="px-8 py-3"
              size="lg"
              disabled={isSearching}
            >
              Clear All
            </Button>
          </div>

          {/* Error Display */}
          {webhookError && (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 bg-destructive rounded-full flex items-center justify-center">
                      <span className="text-destructive-foreground text-xs font-bold">!</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-destructive">Search Error</h3>
                    <p className="text-sm text-muted-foreground mt-1">{webhookError}</p>
                    {webhookError.includes('not configured') && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Please configure your SEARCH_WEBHOOK in the .env.local file with your n8n webhook URL.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
}
