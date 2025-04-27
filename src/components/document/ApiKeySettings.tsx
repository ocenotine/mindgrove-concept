
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getOpenRouterApiKey, saveOpenRouterApiKey } from '@/utils/openRouterUtils';
import { useToast } from '@/components/ui/use-toast';

const ApiKeySettings: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();
  
  useEffect(() => {
    // Load API key from local storage on component mount
    const storedKey = getOpenRouterApiKey();
    setApiKey(storedKey);
    
    // Check if API key is in URL parameters (for auto-configuring from link)
    const urlParams = new URLSearchParams(window.location.search);
    const keyParam = urlParams.get('api_key');
    if (keyParam) {
      handleSaveKey(keyParam);
      // Remove param from URL for security
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Initialize with API key from error message if present
    if (window.location.hash && window.location.hash.includes('api_key=')) {
      const keyParam = window.location.hash.split('api_key=')[1].split('&')[0];
      if (keyParam) {
        handleSaveKey(keyParam);
        // Remove hash from URL for security
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  useEffect(() => {
    // Initialize with hardcoded API key if not already set
    const hardcodedKey = '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';
    
    if (!getOpenRouterApiKey() && hardcodedKey) {
      handleSaveKey(hardcodedKey);
    }
  }, []);
  
  const handleSaveKey = (key: string) => {
    saveOpenRouterApiKey(key);
    setApiKey(key);
    toast({
      title: 'API Key Saved',
      description: 'Your OpenRouter API key has been saved successfully.',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an API key.',
        variant: 'destructive',
      });
      return;
    }

    handleSaveKey(apiKey);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>OpenRouter API Settings</CardTitle>
        <CardDescription>
          Configure your OpenRouter API key to use AI features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your OpenRouter API key"
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => window.open('https://openrouter.ai/keys', '_blank')}
        >
          Get API Key
        </Button>
        <Button onClick={handleSubmit}>Save Key</Button>
      </CardFooter>
    </Card>
  );
};

export default ApiKeySettings;
