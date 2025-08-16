'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{id: string, fields: Record<string, unknown>, createdTime: string}>>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Simulate search delay and fetch from Airtable API
      const response = await fetch('/api/airtable');
      const data = await response.json();
      
      if (response.ok && data.records) {
        // Filter records based on search query
        const filteredResults = data.records.filter((record: {fields: Record<string, unknown>}) => {
          const searchText = searchQuery.toLowerCase();
          return Object.values(record.fields).some((value: unknown) => 
            value && value.toString().toLowerCase().includes(searchText)
          );
        });
        setSearchResults(filteredResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const renderSearchResult = (record: {id: string, fields: Record<string, unknown>}, index: number) => {
    return (
      <Card key={record.id} className="mb-4">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Record #{index + 1}</div>
            {Object.entries(record.fields).map(([key, value]: [string, unknown]) => (
              <div key={key} className="flex flex-col sm:flex-row sm:space-x-2">
                <span className="font-medium text-sm min-w-[120px]">{key}:</span>
                <span className="text-sm break-words">
                  {value ? (Array.isArray(value) ? value.join(', ') : value.toString()) : '-'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4">
      {/* Search Section */}
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Search Your Data
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Search through your Airtable records with our powerful search engine
          </p>
        </div>

        {/* Google-style Search Box */}
        <form onSubmit={handleSearch} className="w-full max-w-2xl">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Search your records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-6 text-lg rounded-full border-2 focus:border-primary shadow-lg"
              disabled={isSearching}
            />
          </div>
          
          <div className="flex justify-center space-x-4 mt-6">
            <Button 
              type="submit" 
              disabled={isSearching || !searchQuery.trim()}
              className="px-8 py-2"
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                'Search Records'
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setHasSearched(false);
              }}
              className="px-8 py-2"
            >
              Clear
            </Button>
          </div>
        </form>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="pb-10">
          <div className="border-t pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">
                Search Results
                {searchResults.length > 0 && (
                  <span className="text-muted-foreground text-lg ml-2">
                    ({searchResults.length} found)
                  </span>
                )}
              </h2>
            </div>

            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Searching your records...</p>
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((record, index) => renderSearchResult(record, index))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">No results found</h3>
                    <p className="text-muted-foreground">
                      No records match your search query &ldquo;{searchQuery}&rdquo;. Try different keywords.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
