
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, FileText, XCircle, Settings, BookOpen, Plus, Trash2, Edit, MessageSquare, Copy, StopCircle, Download } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { v4 as uuidv4 } from 'uuid';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useDocuments } from '@/hooks/useDocuments';
import { getOpenRouterApiKey, playNotificationSound } from '@/utils/openRouterUtils';
import { streamAIResponse } from '@/integrations/openAI/client';

// Import Prism for code highlighting
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism-tomorrow.css';

import { ChatMessage, ChatSession } from '@/types/chat';

const AIChat = () => {
  const [userInput, setUserInput] = useState('');
  const [inputRows, setInputRows] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState({ start: 0, elapsed: 0 });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { user } = useAuthStore();
  const {
    sessions,
    currentSessionId,
    createNewSession,
    setCurrentSession,
    addMessage,
    deleteSession,
    updateSessionTitle,
    setDocumentContext,
    clearDocumentContext,
    getSessions,
    getCurrentSession,
    getMessages,
  } = useChatStore();
  const { fetchDocumentById } = useDocuments();

  // Scroll to bottom on message changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [getMessages()]);

  // Load last session on mount
  useEffect(() => {
    if (!currentSessionId && sessions.length > 0) {
      setCurrentSession(sessions[0].id);
    }
  }, [sessions, currentSessionId, setCurrentSession]);

  // Auto-focus on input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle textarea height
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setUserInput(textarea.value);
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    setInputRows(textarea.value.split('\n').length);
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle new messages
  const updateMessage = (messageId: string, updates: Partial<ChatMessage>) => {
    const currentMessages = getMessages();
    const messageIndex = currentMessages.findIndex(msg => msg.id === messageId);

    if (messageIndex !== -1) {
      const updatedMessages = [...currentMessages];
      updatedMessages[messageIndex] = { ...updatedMessages[messageIndex], ...updates };

      // Update the message in the chat store
      const targetSessionId = currentSessionId;
      if (!targetSessionId) return;

      const sessions = [...getSessions()];
      const sessionIndex = sessions.findIndex(s => s.id === targetSessionId);

      if (sessionIndex !== -1) {
        const updatedSession = { ...sessions[sessionIndex] };
        updatedSession.messages = updatedMessages;
        updatedSession.lastUpdated = new Date();
        sessions[sessionIndex] = updatedSession;

        // Persist the updated session
        setCurrentSession(targetSessionId);
      }
    }
  };

  // Handle streaming messages
  const updateStreamingMessage = (messageId: string, token: string) => {
    const currentMessages = getMessages();
    const messageIndex = currentMessages.findIndex(msg => msg.id === messageId);

    if (messageIndex !== -1) {
      const updatedMessages = [...currentMessages];
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        content: updatedMessages[messageIndex].content + token
      };

      // Update the message in the chat store
      const targetSessionId = currentSessionId;
      if (!targetSessionId) return;

      const sessions = [...getSessions()];
      const sessionIndex = sessions.findIndex(s => s.id === targetSessionId);

      if (sessionIndex !== -1) {
        const updatedSession = { ...sessions[sessionIndex] };
        updatedSession.messages = updatedMessages;
        updatedSession.lastUpdated = new Date();
        sessions[sessionIndex] = updatedSession;

        // Persist the updated session
        setCurrentSession(targetSessionId);
      }
    }
  };

  // Handle highlighting code blocks
  const highlightCodeInMessage = (messageId: string) => {
    const currentMessages = getMessages();
    const messageIndex = currentMessages.findIndex(msg => msg.id === messageId);

    if (messageIndex !== -1) {
      const message = currentMessages[messageIndex];
      if (message.role === 'assistant') {
        // Use a regular expression to find all code blocks
        const codeBlocks = message.content.match(/```[\w-]*\n[\s\S]*?\n```/g);

        if (codeBlocks) {
          let highlightedContent = message.content;

          codeBlocks.forEach(codeBlock => {
            // Extract the language and code from the code block
            const languageMatch = codeBlock.match(/```([\w-]+)\n([\s\S]*)\n```/);

            if (languageMatch) {
              const language = languageMatch[1];
              const code = languageMatch[2];

              try {
                // Highlight the code using Prism
                const highlightedCode = Prism.highlight(code, Prism.languages[language] || Prism.languages.javascript, language);

                // Replace the original code block with the highlighted code
                highlightedContent = highlightedContent.replace(codeBlock, `<pre><code class="language-${language}">${highlightedCode}</code></pre>`);
              } catch (error) {
                console.error("Error highlighting code:", error);
                // If there's an error, leave the original code block as is
              }
            }
          });

          // Update the message with the highlighted content
          updateMessage(messageId, { content: highlightedContent });
        }
      }
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    // Add user message to chat
    addMessage({
      content: userInput,
      role: 'user',
      timestamp: new Date()
    });

    // Reset the input field
    setUserInput('');
    setInputRows(1);

    setIsGenerating(true);
    setGenerationError(null);

    // Start the generation timer
    const startTime = Date.now();
    setGenerationTime({
      start: startTime,
      elapsed: 0
    });

    // Update elapsed time every second
    const timer = setInterval(() => {
      setGenerationTime(prev => ({
        ...prev,
        elapsed: Math.round((Date.now() - prev.start) / 1000)
      }));
    }, 1000);

    try {
      const responseId = `assistant-${Date.now()}`;
      let promptContext = '';
      
      // If a document is selected, use that context for the response
      const currentSession = getCurrentSession();
      if (currentSession?.documentId && currentSession?.documentTitle) {
        // Fetch the document content if available
        const document = await fetchDocumentById(currentSession.documentId);
        if (document?.content) {
          promptContext = `Context from document "${currentSession.documentTitle}":\n${document.content}`;
        }
      }
      
      // Play sound if enabled
      if (soundEnabled) {
        await playNotificationSound();
      }

      // Show generation feedback
      toast({
        title: "Generating response",
        description: "The AI is thinking...",
        duration: 3000
      });
      
      // Add an initial empty message that will be updated during streaming
      addMessage({
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        id: responseId
      });
      
      // Generate response
      const response = await streamAIResponse({
        currentMessage: userInput,
        previousMessages: getMessages().map(m => ({ role: m.role, content: m.content })),
        documentContext: promptContext,
        onToken: (token) => {
          updateStreamingMessage(responseId, token);
        }
      });
      
      // Final message update - just in case streaming missed anything
      if (response) {
        updateMessage(responseId, {
          content: response,
          role: 'assistant',
          timestamp: new Date()
        });
      }
      
      // Final highlighting of code blocks
      setTimeout(() => {
        highlightCodeInMessage(responseId);
      }, 100);
      
    } catch (error) {
      console.error("Error generating response:", error);
      setGenerationError(error instanceof Error ? error.message : "Failed to generate response");
      
      toast({
        title: "Error",
        description: "Failed to generate AI response. Please try again.",
        variant: "destructive"
      });
      
      // Add error message to chat
      addMessage({
        content: "I'm sorry, I encountered an error while generating a response. Please try again.",
        role: 'assistant',
        timestamp: new Date()
      });
    } finally {
      setIsGenerating(false);
      clearInterval(timer);
      
      // Scroll to bottom
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Handle creating a new chat session
  const handleNewChat = () => {
    const newSessionId = createNewSession();
    setCurrentSession(newSessionId);
  };

  // Handle deleting a chat session
  const handleDeleteChat = (sessionId: string) => {
    deleteSession(sessionId);
  };

  // Handle selecting a chat session
  const handleSelectChat = (sessionId: string) => {
    setCurrentSession(sessionId);
  };

  // Handle updating the chat title
  const handleUpdateChatTitle = (sessionId: string, title: string) => {
    updateSessionTitle(sessionId, title);
  };

  // Handle setting document context
  const handleSetDocumentContext = (documentId: string | null, documentTitle: string | null) => {
    setDocumentContext(documentId, documentTitle);
  };

  // Handle clearing document context
  const handleClearDocumentContext = () => {
    clearDocumentContext();
  };

  // User avatar URL from auth store - fixed to handle optional properties
  const userAvatarUrl = user?.user_metadata?.avatar_url || '';
  
  // Get user initials for avatar fallback - fixed to handle optional properties
  const getUserInitials = (): string => {
    const name = user?.name || 
                user?.user_metadata?.name || 
                user?.email || 
                '';
                
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex h-screen">
      {/* Chat List */}
      <div className="w-64 border-r border-border flex-shrink-0">
        <div className="p-3">
          <h2 className="text-lg font-semibold mb-2">Chats</h2>
          <button
            onClick={handleNewChat}
            className="w-full text-sm rounded-md p-2 bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2 inline-block" /> New Chat
          </button>
        </div>
        <ScrollArea className="h-[calc(100vh-100px)]">
          <div className="py-2">
            {getSessions().map((session) => (
              <button
                key={session.id}
                onClick={() => handleSelectChat(session.id)}
                className={`w-full text-sm rounded-md p-2 hover:bg-secondary/80 transition-colors text-left overflow-hidden whitespace-nowrap text-ellipsis ${session.id === currentSessionId ? 'bg-secondary' : ''
                  }`}
              >
                {session.title}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col bg-muted">
        {/* Chat Header */}
        <div className="border-b border-border p-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {getCurrentSession()?.title || 'New Chat'}
          </h2>
          <div className="flex items-center space-x-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="p-2 hover:bg-secondary/80 rounded-md transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your chat and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (currentSessionId) {
                        handleDeleteChat(currentSessionId);
                      }
                    }}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <button className="p-2 hover:bg-secondary/80 rounded-md transition-colors">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {getMessages().map((message) => (
              <div
                key={message.id}
                className={`flex items-start ${message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="w-8 h-8 mr-3">
                    <AvatarImage src="/mindgrove.png" alt="AI Avatar" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-md p-3 max-w-2xl prose prose-sm dark:prose-invert ${message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                    }`}
                >
                  {message.content.split('\n').map((text, i) => (
                    <p key={i} className="my-1">{text}</p>
                  ))}
                </div>
                {message.role === 'user' && (
                  <Avatar className="w-8 h-8 ml-3">
                    <AvatarImage src={userAvatarUrl} alt={user?.name} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className="p-4 border-t border-border">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              rows={inputRows}
              placeholder="Type your message..."
              className="w-full p-3 pr-12 rounded-md border border-input bg-background resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              disabled={isGenerating}
            />
            <button
              onClick={handleSendMessage}
              className="absolute right-3 bottom-3 p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50"
              disabled={isGenerating || !userInput.trim()}
            >
              {isGenerating ? (
                <span className="animate-spin">◒</span>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
