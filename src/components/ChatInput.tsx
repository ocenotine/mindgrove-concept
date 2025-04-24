
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSubmit, 
  isLoading = false,
  placeholder = "Ask a research question..."
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;
    
    onSubmit(message);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto resize the textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="border-t border-border p-4">
      <div className="container max-w-4xl">
        <div className="flex gap-2 items-end bg-muted p-2 rounded-lg focus-within:ring-2 focus-within:ring-ring">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[60px] max-h-[200px] flex-1 bg-transparent border-0 focus-visible:ring-0 resize-none"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!message.trim() || isLoading}
            className={`flex-shrink-0 ${message.trim() ? 'bg-primary' : 'bg-muted-foreground/50'}`}
          >
            <Send size={18} />
          </Button>
        </div>
        <div className="mt-2 text-xs text-center text-muted-foreground">
          Powered by Mindgrove AI • Press Enter to submit, Shift+Enter for a new line
        </div>
      </div>
    </form>
  );
};

export default ChatInput;
