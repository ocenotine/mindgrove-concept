import React, { useState, useRef, useEffect } from 'react';
import InstitutionLayout from '@/components/layout/InstitutionLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { Send, Sparkles, Copy, FileText, Download } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
}

const InstitutionAIChat = () => {
  const { user } = useAuthStore();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [expandedTextarea, setExpandedTextarea] = useState(false);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const researchPrompts = [
    "Analyze the latest trends in AI adoption in higher education",
    "Provide a literature review on climate change impacts in East Africa",
    "Suggest research methodologies for studying student engagement",
    "Generate citations for recent papers about machine learning in healthcare"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages]);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        const institutionId = user?.user_metadata?.institution_id || user?.institution_id;
        
        if (institutionId) {
          const { data, error } = await supabase
            .from('institutions')
            .select('is_premium')
            .eq('id', institutionId)
            .single();
          
          if (!error && data) {
            setIsPremium(!!data.is_premium);
          }
        }
      } catch (error) {
        console.error('Error checking premium status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkPremiumStatus();
    
    const mockSessions: ChatSession[] = [
      {
        id: '1',
        title: 'Academic Research Assistant',
        lastMessage: 'How can I help with your research today?',
        timestamp: new Date(),
        messages: [
          {
            id: 'm1',
            role: 'assistant',
            content: 'Hello! I\'m your AI research assistant. How can I help with your academic work today?',
            timestamp: new Date()
          }
        ]
      },
      {
        id: '2',
        title: 'Literature Review Helper',
        lastMessage: 'Here are the key papers I found on that topic...',
        timestamp: new Date(Date.now() - 86400000),
        messages: [
          {
            id: 'm2',
            role: 'assistant',
            content: 'Welcome to your literature review session. I can help you find and analyze relevant papers.',
            timestamp: new Date(Date.now() - 86400000)
          }
        ]
      },
      {
        id: '3',
        title: 'Grant Proposal Draft',
        lastMessage: 'I\'ve refined the methodology section as requested.',
        timestamp: new Date(Date.now() - 172800000),
        messages: [
          {
            id: 'm3',
            role: 'assistant',
            content: 'Let\'s work on your grant proposal. What area would you like to focus on first?',
            timestamp: new Date(Date.now() - 172800000)
          }
        ]
      }
    ];
    
    setChatSessions(mockSessions);
    setActiveSession(mockSessions[0]);
  }, [user]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    setIsSending(true);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };
    
    const updatedSession = {
      ...activeSession!,
      messages: [...activeSession!.messages, userMessage]
    };
    
    setActiveSession(updatedSession);
    setInputMessage('');
    
    setTimeout(() => {
      const aiResponses = [
        "Based on recent academic literature, the trends you're asking about show significant growth in the past five years. Several key papers from top journals highlight the importance of this area. Would you like me to provide specific citations?",
        "Your research question is interesting. From my analysis, there are three main methodological approaches you could consider: qualitative interviews, quantitative surveys, or mixed methods. Each has advantages depending on your specific objectives.",
        "I've analyzed the data sources you mentioned, and there appear to be some potential gaps in the methodology section. Consider addressing the sampling approach more explicitly and providing clearer justification for your analytical framework.",
        "Looking at comparative studies in this field, researchers have identified several key factors that influence outcomes: institutional support, technological infrastructure, and faculty development programs. Would you like me to elaborate on any of these areas?"
      ];
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date()
      };
      
      const finalUpdatedSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, aiMessage],
        lastMessage: aiMessage.content.substring(0, 50) + '...'
      };
      
      setActiveSession(finalUpdatedSession);
      
      setChatSessions(prev => 
        prev.map(session => 
          session.id === activeSession!.id ? finalUpdatedSession : session
        )
      );
      
      setIsSending(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Research Chat',
      lastMessage: 'How can I help with your research?',
      timestamp: new Date(),
      messages: [
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Hello! I\'m your AI research assistant. How can I help with your research today?',
          timestamp: new Date()
        }
      ]
    };
    
    setChatSessions([newSession, ...chatSessions]);
    setActiveSession(newSession);
  };

  const selectSession = (session: ChatSession) => {
    setActiveSession(session);
  };

  const usePrompt = (prompt: string) => {
    setInputMessage(prompt);
    setExpandedTextarea(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Text copied successfully"
    });
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <InstitutionLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-400">Loading...</span>
        </div>
      </InstitutionLayout>
    );
  }

  return (
    <InstitutionLayout>
      <PageTransition>
        <div className="pb-10 h-[calc(100vh-80px)]">
          <div className="flex h-full">
            <div className="hidden md:block w-64 border-r border-gray-800 h-full overflow-y-auto pr-2">
              <div className="p-4">
                <Button
                  className="w-full mb-4"
                  onClick={startNewChat}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
                
                <h3 className="text-sm font-medium text-gray-400 mb-2">Recent Chats</h3>
                
                <div className="space-y-1">
                  {chatSessions.map(session => (
                    <Button
                      key={session.id}
                      variant="ghost"
                      className={`w-full justify-start text-left truncate h-auto py-2 px-3 ${
                        activeSession?.id === session.id 
                          ? 'bg-primary/15 text-primary' 
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                      onClick={() => selectSession(session)}
                    >
                      <div className="truncate">
                        <div className="font-medium truncate">{session.title}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {session.lastMessage.length > 30 
                            ? session.lastMessage.substring(0, 30) + '...' 
                            : session.lastMessage}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="border-b border-gray-800 py-3 px-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-white">{activeSession?.title}</h2>
                  {!isPremium && (
                    <div className="flex items-center mt-1">
                      <Badge variant="outline" className="text-xs">
                        Basic
                      </Badge>
                      <span className="text-xs text-gray-400 ml-2">
                        {Math.floor(Math.random() * 80) + 120}/200 queries remaining
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" className="h-8 border-gray-700 text-gray-300 hover:bg-gray-800">
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 border-gray-700 text-gray-300 hover:bg-gray-800">
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {activeSession?.messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div 
                      className={`max-w-3xl rounded-lg p-4 ${
                        message.role === 'user' 
                          ? 'bg-primary/20 text-white' 
                          : 'bg-[#191C27] text-gray-200 border border-gray-800'
                      }`}
                    >
                      <div className="prose prose-invert">
                        {message.content.split('\n').map((text, i) => (
                          <p key={i} className="my-1">{text}</p>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                        <span>{formatMessageTime(message.timestamp)}</span>
                        {message.role === 'assistant' && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => copyToClipboard(message.content)}
                            className="h-6 w-6 p-1 text-gray-400 hover:text-white hover:bg-gray-800"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              {isPremium && (
                <div className="px-4 py-2 border-t border-gray-800 flex items-center gap-2 overflow-x-auto">
                  {researchPrompts.map((prompt, index) => (
                    <Button 
                      key={index} 
                      variant="outline" 
                      size="sm" 
                      className="whitespace-nowrap border-gray-700 text-gray-300 hover:bg-gray-800"
                      onClick={() => usePrompt(prompt)}
                    >
                      {prompt.length > 35 ? prompt.substring(0, 35) + '...' : prompt}
                    </Button>
                  ))}
                </div>
              )}
              
              <div className="border-t border-gray-800 p-4">
                <div className="relative">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setExpandedTextarea(true)}
                    onBlur={() => setExpandedTextarea(inputMessage.length > 0)}
                    placeholder="Type your research question..."
                    className={`bg-[#131620] border-gray-700 text-white resize-none pr-12 ${
                      expandedTextarea ? 'min-h-[120px]' : 'min-h-[60px]'
                    }`}
                  />
                  <Button
                    className="absolute right-2 bottom-2"
                    size="sm"
                    disabled={!inputMessage.trim() || isSending}
                    onClick={handleSendMessage}
                  >
                    {isSending ? (
                      <span className="animate-spin h-4 w-4">⊝</span>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {isPremium ? 
                    "Premium access: Unlimited AI research queries available." :
                    "Basic plan: Limited to 200 AI queries per month. Upgrade for unlimited access."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </InstitutionLayout>
  );
};

export default InstitutionAIChat;
