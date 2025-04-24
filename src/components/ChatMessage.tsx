
import React from 'react';
import { Bookmark, Copy, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from "sonner";
import { cn } from '@/lib/utils';

export type MessageRole = 'user' | 'assistant';

interface ChatMessageProps {
  role: MessageRole;
  content: string;
  isLoading?: boolean;
  onSave?: () => void;
  onFeedback?: (feedback: 'positive' | 'negative') => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  role, 
  content, 
  isLoading = false,
  onSave,
  onFeedback
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success("Content copied to clipboard");
  };

  return (
    <div className={cn(
      "py-4 flex",
      role === 'user' ? "bg-muted" : "bg-card"
    )}>
      <div className="container max-w-4xl flex gap-4">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          role === 'user' 
            ? "bg-primary text-primary-foreground" 
            : "bg-secondary text-secondary-foreground"
        )}>
          {role === 'user' ? 'U' : 'AI'}
        </div>
        
        <div className="flex-1">
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            {isLoading ? (
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : (
              <div className="fade-in">{content}</div>
            )}
          </div>
          
          {role === 'assistant' && !isLoading && (
            <div className="mt-4 flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={handleCopy}
                    >
                      <Copy size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy response</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => onSave && onSave()}
                    >
                      <Bookmark size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Save response</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <div className="border-l border-border pl-2 flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => onFeedback && onFeedback('positive')}
                      >
                        <ThumbsUp size={14} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Good response</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => onFeedback && onFeedback('negative')}
                      >
                        <ThumbsDown size={14} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Bad response</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
