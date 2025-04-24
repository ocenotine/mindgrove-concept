
import React from 'react';
import { AlertCircle, Check, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ApiKeyReminder = () => {
  return (
    <Alert className="mb-4 border border-blue-200 bg-background dark:border-blue-800">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 mt-0.5 mr-2 text-blue-500" />
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <AlertTitle className="mb-0">AI Features Ready</AlertTitle>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1 w-fit">
              <Check className="h-3 w-3" /> Active
            </Badge>
          </div>
          <AlertDescription className="text-muted-foreground">
            <p className="mb-2">
              Your document is ready to be analyzed. Generate summaries and flashcards for efficient studying with just one click.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => window.open('https://openrouter.ai/docs', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" /> Learn More
              </Button>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

export default ApiKeyReminder;
