
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, FileText, XCircle, Settings, BookOpen, Plus, Trash2, Edit, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { TypingIndicator } from '@/components/animations/TypingIndicator';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { generateGeneralChatResponse } from '@/utils/openRouterUtils';
import DocumentIcon from '@/components/document/DocumentIcon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useChatStore, ChatSession, Message } from '@/store/chatStore';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Document {
  id: string;
  title: string;
  file_type: string;
  content?: string;
  created_at: string;
}

const AIChat = () => {
  // States for current UI
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userDocuments, setUserDocuments] = useState<Document[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [documentContent, setDocumentContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState('chat');
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(true);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameSessionId, setRenameSessionId] = useState<string | null>(null);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  
  // References for auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use auth store
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  // Chat store hooks
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
    getMessages
  } = useChatStore();
  
  // Derived values
  const messages = getMessages();
  const currentSession = sessions.find(s => s.id === currentSessionId);

  // Scroll to bottom on message updates
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Initialize a session if none exists
  useEffect(() => {
    if (sessions.length === 0) {
      createNewSession();
    }
  }, [sessions.length, createNewSession]);

  // Fetch user's documents
  useEffect(() => {
    if (user) {
      fetchUserDocuments();
    }
  }, [user]);

  // Scroll to bottom helper function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
      // Don't re-fetch if it's already the selected document
      if (selectedDocumentId === documentId) return;
      
      setSelectedDocumentId(documentId);
      
      const { data, error } = await supabase
        .from('documents')
        .select('content, title')
        .eq('id', documentId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setDocumentContent(data.content || '');
        
        // Update chat store with document context
        setDocumentContext(documentId, data.title);
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

    const userMessageContent = inputMessage.trim();
    setInputMessage('');
    setIsProcessing(true);

    // Add user message to the current chat session
    addMessage({
      content: userMessageContent,
      role: 'user',
      timestamp: new Date()
    });

    try {
      let response: string;
      
      // If a document is selected, use that context for the response
      if (selectedDocumentId && documentContent) {
        // Use document content as context
        const prompt = `
Document content:
${documentContent.substring(0, 3000)}

User question:
${userMessageContent}

Please answer the user's question based on the document content.
`;
        response = await generateGeneralChatResponse(prompt);
      } else {
        // General chat without document context
        response = await generateGeneralChatResponse(userMessageContent);
      }
      
      // Add AI response to the current chat session
      addMessage({
        content: response,
        role: 'assistant',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate a response. Please try again.',
        variant: 'destructive',
      });
      
      // Add error message to chat
      addMessage({
        content: 'Sorry, I encountered an error while generating a response. Please try again.',
        role: 'assistant',
        timestamp: new Date()
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
      addMessage({
        content: `📄 Document "${file.name}" has been added to your documents.`,
        role: 'system',
        timestamp: new Date()
      });

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
  
  // Chat history management
  const startNewChat = () => {
    createNewSession();
    setSelectedDocumentId(null);
    setDocumentContent('');
  };
  
  const handleSelectChat = (sessionId: string) => {
    setCurrentSession(sessionId);
    
    // Update selected document if this chat has one
    const session = sessions.find(s => s.id === sessionId);
    if (session?.documentId) {
      setSelectedDocumentId(session.documentId);
      handleSelectDocument(session.documentId);
    } else {
      setSelectedDocumentId(null);
      setDocumentContent('');
    }
  };
  
  const handleDeleteChat = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSession(sessionId);
  };
  
  const openRenameDialog = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setNewSessionTitle(session.title);
      setRenameSessionId(sessionId);
      setRenameDialogOpen(true);
    }
  };
  
  const handleRenameSession = () => {
    if (renameSessionId && newSessionTitle.trim()) {
      updateSessionTitle(renameSessionId, newSessionTitle.trim());
      setRenameDialogOpen(false);
      setRenameSessionId(null);
      setNewSessionTitle('');
    }
  };
  
  const formatTimestamp = (dateStr: Date) => {
    const date = new Date(dateStr);
    return date.toLocaleString(undefined, {
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  const formatMessageTime = (dateStr: Date) => {
    return new Date(dateStr).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const toggleChatSidebar = () => {
    setIsChatSidebarOpen(!isChatSidebarOpen);
  };

  return (
    <MainLayout>
      <PageTransition>
        <div className="container max-w-6xl mx-auto px-4">
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
                <div className="flex flex-1 gap-4">
                  {/* Chat sidebar - right side */}
                  <AnimatePresence>
                    {isChatSidebarOpen && (
                      <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "270px", opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="border rounded-lg shadow-sm bg-card flex flex-col"
                      >
                        <div className="p-3 border-b flex items-center justify-between">
                          <h3 className="font-semibold">Chat History</h3>
                          <Button variant="ghost" size="sm" onClick={startNewChat}>
                            <Plus className="h-4 w-4" />
                            <span className="ml-1">New</span>
                          </Button>
                        </div>
                        <ScrollArea className="flex-1 p-2">
                          {sessions.map((session) => (
                            <div 
                              key={session.id} 
                              className={`mb-2 p-2 rounded-md cursor-pointer hover:bg-accent/50 transition-colors ${
                                session.id === currentSessionId ? 'bg-accent/70' : ''
                              }`}
                              onClick={() => handleSelectChat(session.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="h-3.5 w-3.5 text-primary/70" />
                                  <div className="truncate font-medium text-sm">
                                    {session.title}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => openRenameDialog(session.id, e)}>
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => handleDeleteChat(session.id, e)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              {session.documentTitle && (
                                <div className="mt-1 text-xs flex items-center text-muted-foreground">
                                  <FileText className="h-3 w-3 mr-1" />
                                  {session.documentTitle}
                                </div>
                              )}
                              
                              <div className="mt-1 text-xs text-muted-foreground">
                                {formatTimestamp(session.lastUpdated)}
                              </div>
                            </div>
                          ))}
                        </ScrollArea>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Main chat area */}
                  <Card className="flex-1 flex flex-col overflow-hidden bg-background/50 backdrop-blur-sm border border-border/50">
                    <div className="flex items-center justify-between border-b border-border/30 p-2">
                      <div className="flex items-center gap-2">
                        {selectedDocumentId && (
                          <div className="flex items-center">
                            <DocumentIcon 
                              fileType={userDocuments.find(doc => doc.id === selectedDocumentId)?.file_type} 
                              className="h-4 w-4 mr-1" 
                            />
                            <span className="text-sm">
                              {userDocuments.find(doc => doc.id === selectedDocumentId)?.title}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-7 w-7 p-0 ml-1"
                              onClick={() => {
                                setSelectedDocumentId(null);
                                setDocumentContent('');
                                clearDocumentContext();
                              }}
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={startNewChat}
                          title="New Chat"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={toggleChatSidebar}
                          title={isChatSidebarOpen ? "Hide History" : "Show History"}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
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
                                    {formatMessageTime(message.timestamp)}
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
                </div>
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
                                  clearDocumentContext();
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
        
        {/* Rename Dialog */}
        <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Chat</DialogTitle>
              <DialogDescription>
                Give this conversation a new name to help you find it later.
              </DialogDescription>
            </DialogHeader>
            <Input 
              value={newSessionTitle} 
              onChange={(e) => setNewSessionTitle(e.target.value)}
              placeholder="Enter a new title"
              className="mt-2"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRenameSession}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageTransition>
    </MainLayout>
  );
};

export default AIChat;
