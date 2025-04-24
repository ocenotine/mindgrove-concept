
import { useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import Button from '@/components/common/Button';
import { Copy, Check, Sparkles } from 'lucide-react';
import { Document } from '@/utils/mockData';

interface DocumentSummaryProps {
  document: Document;
  className?: string;
}

const DocumentSummary = ({ document, className }: DocumentSummaryProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (document.summary) {
      navigator.clipboard.writeText(document.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!document.summary) {
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
              No summary available for this document yet.
            </p>
            <Button>Generate Summary</Button>
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
          {document.summary}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentSummary;
