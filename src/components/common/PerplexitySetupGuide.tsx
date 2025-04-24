
import React from 'react';
import { Steps, Step } from '@/components/ui/steps';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface HuggingFaceSetupGuideProps {
  onClose?: () => void;
}

const HuggingFaceSetupGuide = ({ onClose }: HuggingFaceSetupGuideProps) => {
  return (
    <div className="max-h-[80vh] overflow-y-auto p-1">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">HuggingFace API Setup Guide</h2>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <p className="text-muted-foreground mb-8">
        Follow these steps to set up your HuggingFace API integration to enable AI features like document summarization
        and flashcard generation.
      </p>
      
      <Steps>
        <Step number={1} title="Create a HuggingFace account">
          <p className="text-sm text-muted-foreground mb-2">
            Visit the HuggingFace website and create a free account if you don't already have one.
          </p>
          <Button variant="outline" size="sm" className="mb-2" asChild>
            <a href="https://huggingface.co/join" target="_blank" rel="noopener noreferrer">
              Go to HuggingFace
            </a>
          </Button>
        </Step>
        
        <Step number={2} title="Generate an API token">
          <p className="text-sm text-muted-foreground mb-2">
            Navigate to your HuggingFace account settings and create a new API token.
          </p>
          <Button variant="outline" size="sm" className="mb-2" asChild>
            <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer">
              Go to API Tokens page
            </a>
          </Button>
          <div className="mt-3 space-y-2">
            <p className="text-sm text-muted-foreground">
              1. Click on "New token"
            </p>
            <p className="text-sm text-muted-foreground">
              2. Enter a name for your token (e.g., "StudyAI")
            </p>
            <p className="text-sm text-muted-foreground">
              3. Select "Read" role
            </p>
            <p className="text-sm text-muted-foreground">
              4. Click "Generate a token"
            </p>
            <p className="text-sm text-muted-foreground">
              5. Copy your new token
            </p>
          </div>
        </Step>
        
        <Step number={3} title="Add the API token to your Supabase project">
          <p className="text-sm text-muted-foreground mb-2">
            Add your HuggingFace API token to your Supabase project settings.
          </p>
          <div className="mt-3 space-y-2">
            <p className="text-sm text-muted-foreground">
              1. Go to your Supabase project dashboard
            </p>
            <p className="text-sm text-muted-foreground">
              2. Navigate to "Settings" → "API"
            </p>
            <p className="text-sm text-muted-foreground">
              3. Find the "HTTP Request Headers" section
            </p>
            <p className="text-sm text-muted-foreground">
              4. Add a new header with the key "HUGGINGFACE_API_KEY" and paste your token as the value
            </p>
            <p className="text-sm text-muted-foreground">
              5. Save your changes
            </p>
          </div>
        </Step>
        
        <Step number={4} title="Restart your application">
          <p className="text-sm text-muted-foreground">
            Refresh your browser or restart your application to ensure the API key is properly loaded.
          </p>
        </Step>
      </Steps>
      
      <div className="mt-8 bg-muted p-4 rounded-md">
        <h3 className="font-medium mb-2">Usage Limits</h3>
        <p className="text-sm text-muted-foreground">
          The free tier of HuggingFace's Inference API has usage limits. If you plan to use these features extensively,
          consider upgrading to a paid plan directly on the HuggingFace website.
        </p>
      </div>
    </div>
  );
};

export default HuggingFaceSetupGuide;
