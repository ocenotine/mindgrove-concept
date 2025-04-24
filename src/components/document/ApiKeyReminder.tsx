
import React from 'react';
import { AlertCircle, Check, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ApiKeyReminder = () => {
  return (
    <Alert className="mb-4">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 mt-0.5 mr-2 text-blue-500" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <AlertTitle className="mb-2">NLPCloud API Integration</AlertTitle>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
              <Check className="h-3 w-3" /> Active
            </Badge>
          </div>
          <AlertDescription className="text-muted-foreground">
            <p className="mb-2">
              AI features are powered by NLPCloud. The system will automatically generate summaries and flashcards when you upload documents.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => window.open('https://nlpcloud.com/home/playground', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" /> NLPCloud Playground
              </Button>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

export default ApiKeyReminder;
