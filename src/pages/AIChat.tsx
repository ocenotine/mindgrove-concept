
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, FileText, XCircle, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { TypingIndicator } from '@/components/animations/TypingIndicator';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { generateGeneralChatResponse } from '@/utils/openRouterUtils';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    content: "👋 Hello! I'm your MindGrove AI assistant. How can I help you today?",
    role: 'assistant',
    timestamp: new Date()
  }]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputMessage.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);

    try {
      const response = await generateGeneralChatResponse(userMessage.content);
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate a response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) {
      toast({
        title: 'Upload Error',
        description: 'Please select a file and make sure you are logged in.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create document record directly without storage bucket
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          title: file.name,
          file_type: file.type,
          user_id: user.id,
          content: 'Processing...' // This will be updated with actual content
        })
        .select()
        .single();

      if (docError) throw docError;

      // Add system message about document upload
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        content: `📄 Document "${file.name}" has been added to your documents.`,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, systemMessage]);

      // Read file content if it's a text file
      if (file.type === 'text/plain') {
        const text = await file.text();
        await supabase
          .from('documents')
          .update({ content: text })
          .eq('id', docData.id);
      }

      toast({
        title: 'Document uploaded successfully',
        description: 'Your document has been added to your library.',
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your document.',
        variant: 'destructive',
      });
    }
  };

  return (
    <MainLayout>
      <PageTransition>
        <div className="container max-w-5xl mx-auto px-4">
          <div className="min-h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">AI Assistant</h1>
                <p className="text-muted-foreground">Your personal learning companion</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".txt,.pdf,.doc,.docx"
                />
                <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                  <FileText className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden bg-background/50 backdrop-blur-sm border border-border/50">
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start max-w-[80%] space-x-2 ${
                        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}>
                        <div className={`p-1.5 rounded-full ${
                          message.role === 'user' ? 'bg-primary/20' : 'bg-muted'
                        }`}>
                          {message.role === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div className={`rounded-lg p-4 ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          <div className="prose prose-sm dark:prose-invert">
                            {message.content}
                          </div>
                          <div className="mt-2 text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isProcessing && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-start space-x-2">
                        <div className="p-1.5 rounded-full bg-muted">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="rounded-lg p-4 bg-muted">
                          <TypingIndicator />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-border/50 p-4 backdrop-blur-sm">
                <div className="flex space-x-2">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="min-h-[60px] resize-none bg-background/50"
                    disabled={isProcessing}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!inputMessage.trim() || isProcessing}
                    className="px-4"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press Enter to send, Shift + Enter for new line
                </p>
              </div>
            </Card>
          </div>
        </div>
      </PageTransition>
    </MainLayout>
  );
};

export default AIChat;
