
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Sparkles, Loader } from 'lucide-react';
import { Document } from '@/store/documentStore';
import { generateSummary } from '@/utils/nlpUtils';
import { toast } from '@/hooks/use-toast';

interface DocumentSummaryProps {
  document: Document;
  className?: string;
}

const DocumentSummary = ({ document, className }: DocumentSummaryProps) => {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(document.summary || null);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = () => {
    if (summary || document.summary) {
      navigator.clipboard.writeText(summary || document.summary || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Copied to clipboard",
        description: "Summary text copied successfully"
      });
    }
  };

  const handleGenerateSummary = async () => {
    if (!document.content) {
      toast({
        title: "No content available",
        description: "This document has no content to summarize.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await generateSummary(document.id, document.content);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to generate summary");
      }
      
      setSummary(result.summary);
      toast({
        title: "Summary generated",
        description: "Document summary created successfully."
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate summary";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const displaySummary = summary || document.summary;

  if (!displaySummary) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground mb-4">
              {error ? `Error: ${error}` : "No summary available for this document yet."}
            </p>
            <Button onClick={handleGenerateSummary} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>Generate Summary</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-yellow-500" />
          AI-Generated Summary
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 w-8 p-0"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-sm whitespace-pre-line bg-muted/50 p-4 rounded-md">
          {displaySummary}
        </div>
      </CardContent>
      {isLoading && (
        <CardFooter className="flex justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader className="h-3 w-3 animate-spin" />
            Updating summary...
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default DocumentSummary;
