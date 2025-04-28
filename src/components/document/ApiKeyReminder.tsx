
import React, { useEffect, useState } from 'react';
import { AlertCircle, Check, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getOpenRouterApiKey } from '@/utils/openRouterUtils';
import { useNavigate } from 'react-router-dom';

const ApiKeyReminder = () => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const apiKey = getOpenRouterApiKey();
    setHasApiKey(!!apiKey);
  }, []);

  const handleSetApiKey = () => {
    navigate('/settings');
  };
  
  if (hasApiKey) {
    return (
      <Alert className="mb-4 border border-blue-200 bg-background dark:border-blue-800">
        <div className="flex items-start">
          <Check className="h-5 w-5 mt-0.5 mr-2 text-green-500" />
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
            </AlertDescription>
          </div>
        </div>
      </Alert>
    );
  }
  
  return (
    <Alert className="mb-4 border border-yellow-200 bg-background dark:border-yellow-900/30">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 mt-0.5 mr-2 text-yellow-500" />
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <AlertTitle className="mb-0">API Key Required</AlertTitle>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200 flex items-center gap-1 w-fit">
              <AlertCircle className="h-3 w-3" /> Setup Needed
            </Badge>
          </div>
          <AlertDescription className="text-muted-foreground">
            <p className="mb-2">
              To use AI features, you need to set your OpenRouter API key. Click "Set API Key" below to add your key.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => window.open('https://openrouter.ai/keys', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" /> Get OpenRouter Key
              </Button>
              <Button 
                variant="default"
                size="sm"
                className="text-xs h-7 px-2"
                onClick={handleSetApiKey}
              >
                Set API Key
              </Button>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

export default ApiKeyReminder;
