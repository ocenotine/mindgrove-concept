
import React, { useState } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface DocumentSearchInputProps {
  onSearch: (query: string) => Promise<any>;
  isSearching: boolean;
}

const DocumentSearchInput = ({ onSearch, isSearching }: DocumentSearchInputProps) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search documents by title or content..."
          className="pl-10 pr-16"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isSearching}
        />
        {query && (
          <div className="absolute right-2 flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleClear}
              disabled={isSearching}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs font-medium"
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Searching...
                </>
              ) : (
                'Search'
              )}
            </Button>
          </div>
        )}
      </div>
    </form>
  );
};

export default DocumentSearchInput;
