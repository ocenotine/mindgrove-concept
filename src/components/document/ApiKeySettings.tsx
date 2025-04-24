
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Key, Save, Check, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { setOpenRouterApiKey, getOpenRouterApiKey } from '@/utils/openRouterUtils';
import { motion } from 'framer-motion';

interface ApiKeySettingsProps {
  onSave?: () => void;
}

const ApiKeySettings = ({ onSave }: ApiKeySettingsProps) => {
  const [apiKey, setApiKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const savedKey = getOpenRouterApiKey();
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);
  
  const handleSave = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      setOpenRouterApiKey(apiKey);
      
      toast({
        title: "API key saved",
        description: "Your OpenRouter API key has been saved successfully",
        action: (
          <Button variant="outline" size="sm" className="gap-1">
            <Check className="h-4 w-4" />
          </Button>
        )
      });
      
      if (onSave) {
        onSave();
      }
      
      // Hide the settings after successful save
      setTimeout(() => {
        setIsVisible(false);
      }, 1500);
      
    } catch (error) {
      toast({
        title: "Error saving API key",
        description: "Something went wrong while saving your API key",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="relative">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsVisible(!isVisible)}
        className="gap-1 mb-3"
      >
        <Key className="h-4 w-4" />
        {apiKey ? "Change API Key" : "Set API Key"}
      </Button>
      
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute left-0 top-full z-50 w-[350px] max-w-[95vw]"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>OpenRouter API Key</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsVisible(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>
                Enter your OpenRouter API key to use AI features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input 
                type="password"
                placeholder="sk-or-xxxx..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mb-2"
              />
              <p className="text-xs text-muted-foreground">
                Don't have an API key?{' '}
                <a 
                  href="https://openrouter.ai/keys" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Get one from OpenRouter
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSave} 
                disabled={isSaving} 
                className="w-full gap-1"
              >
                {isSaving ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-4 w-4 border-2 border-t-transparent border-white rounded-full"
                  />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? "Saving..." : "Save API Key"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default ApiKeySettings;
