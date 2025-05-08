
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, FileText, XCircle, Settings, BookOpen } from 'lucide-react';
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
import DocumentIcon from '@/components/document/DocumentIcon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
}

interface Document {
  id: string;
  title: string;
  file_type: string;
  content?: string;
  created_at: string;
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
  const [userDocuments, setUserDocuments] = useState<Document[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [documentContent, setDocumentContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState('chat');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch user's documents
  useEffect(() => {
    if (user) {
      fetchUserDocuments();
    }
  }, [user]);

  const fetchUserDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('id, title, file_type, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      if (data) {
        setUserDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  // Handle document selection
  const handleSelectDocument = async (documentId: string) => {
    try {
      setSelectedDocumentId(documentId);
      
      const { data, error } = await supabase
        .from('documents')
        .select('content, title')
        .eq('id', documentId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setDocumentContent(data.content || '');
        
        // Add a system message about the selected document
        const systemMessage: Message = {
          id: `system-${Date.now()}`,
          content: `📄 Now discussing: "${data.title}". You can ask me questions about this document.`,
          role: 'system',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, systemMessage]);
      }
    } catch (error) {
      console.error('Error fetching document content:', error);
      toast({
        title: "Error",
        description: "Failed to load document content.",
        variant: "destructive",
      });
    }
  };

  // Generate chat response
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
      let response: string;
      
      // If a document is selected, use that context for the response
      if (selectedDocumentId && documentContent) {
        // Use document content as context
        const prompt = `
Document content:
${documentContent.substring(0, 3000)}

User question:
${userMessage.content}

Please answer the user's question based on the document content.
`;
        response = await generateGeneralChatResponse(prompt);
      } else {
        // General chat without document context
        response = await generateGeneralChatResponse(userMessage.content);
      }
      
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

      // Read file content
      let content = '';
      if (file.type === 'text/plain') {
        content = await file.text();
      } else if (file.type === 'application/pdf') {
        content = "PDF content extracted (text extraction simulation)";
      } else {
        content = `Document of type ${file.type} uploaded. Content extraction in progress.`;
      }

      // Update document with content
      await supabase
        .from('documents')
        .update({ content: content })
        .eq('id', docData.id);

      // Refresh documents list and select the new document
      fetchUserDocuments();
      handleSelectDocument(docData.id);

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
                <Button variant="outline" onClick={() => navigate('/documents')}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  My Documents
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="border-b mb-4">
                <TabsList>
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="chat" className="flex-1 flex flex-col">
                <Card className="flex-1 flex flex-col overflow-hidden bg-background/50 backdrop-blur-sm border border-border/50">
                  {selectedDocumentId && (
                    <div className="bg-muted/30 px-4 py-2 border-b border-border/30 flex items-center justify-between">
                      <div className="flex items-center text-sm">
                        <DocumentIcon 
                          fileType={userDocuments.find(doc => doc.id === selectedDocumentId)?.file_type} 
                          className="h-4 w-4 mr-2" 
                        />
                        <span>
                          Discussing: {userDocuments.find(doc => doc.id === selectedDocumentId)?.title}
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setSelectedDocumentId(null);
                          setDocumentContent('');
                        }}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    </div>
                  )}
                  
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
                          {message.role === 'system' ? (
                            <div className="w-full bg-muted/30 border border-border/40 rounded-lg p-3 text-center text-sm">
                              {message.content}
                            </div>
                          ) : (
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
                          )}
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
              </TabsContent>
              
              <TabsContent value="documents" className="flex-1">
                <Card className="h-full">
                  <div className="p-4">
                    <h3 className="text-lg font-medium mb-4">Your Documents</h3>
                    
                    {userDocuments.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">
                        <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p>You have not uploaded any documents yet.</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                          onClick={() => document.getElementById('file-upload')?.click()}
                        >
                          Upload your first document
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {userDocuments.map(doc => (
                          <div 
                            key={doc.id}
                            className={`flex items-center p-3 rounded-md cursor-pointer hover:bg-muted transition-colors ${
                              selectedDocumentId === doc.id ? 'bg-primary/10 border border-primary/20' : 'border'
                            }`}
                            onClick={() => handleSelectDocument(doc.id)}
                          >
                            <DocumentIcon fileType={doc.file_type} className="mr-3" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{doc.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(doc.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (selectedDocumentId === doc.id) {
                                  setSelectedDocumentId(null);
                                  setDocumentContent('');
                                } else {
                                  handleSelectDocument(doc.id);
                                }
                              }}
                            >
                              {selectedDocumentId === doc.id ? 'Deselect' : 'Select'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </PageTransition>
    </MainLayout>
  );
};

export default AIChat;
