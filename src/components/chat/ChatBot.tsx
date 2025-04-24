
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, XCircle, Sparkles } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import Typewriter from './Typewriter';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [typingComplete, setTypingComplete] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      const initialMessage: Message = {
        id: 'initial',
        content: "👋 Hello! I'm your MindGrove assistant. I can help you learn about our platform and answer your questions. What would you like to know?",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([initialMessage]);
    }
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typingComplete]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputMessage.trim()) {
      sendMessage();
    }
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setShowSuggestions(false);

    // Generate response based on user input
    setTimeout(() => {
      const botResponse: Message = {
        id: `bot-${Date.now()}`,
        content: generateResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: suggestion,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setIsTyping(true);
    setShowSuggestions(false);

    setTimeout(() => {
      const botResponse: Message = {
        id: `bot-${Date.now()}`,
        content: generateResponse(suggestion),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const generateResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('what is mindgrove') || input.includes('about mindgrove')) {
      return "MindGrove is an AI-powered research assistant platform that helps you organize, analyze, and learn from your research documents. It provides features like document analysis, summary generation, flashcard creation, and intelligent search to enhance your research and learning experience.";
    } 
    else if (input.includes('feature') || input.includes('what can you do')) {
      return "MindGrove offers several key features: 1) Document analysis with AI-generated summaries, 2) Automatic flashcard generation from your documents, 3) OCR text recognition for scanned documents, 4) Intelligent search across your research materials, 5) A daily streak system to encourage regular learning, and 6) An AI chatbot to assist with questions about your documents.";
    }
    else if (input.includes('upload') || input.includes('document')) {
      return "To upload a document, go to the Dashboard and click on 'Upload Document' or use the upload button in the sidebar. MindGrove supports PDF files and will automatically process them to extract text, generate summaries, and allow you to create flashcards from your content.";
    }
    else if (input.includes('flashcard') || input.includes('study')) {
      return "MindGrove's flashcard system helps you study effectively. Once you've uploaded a document, you can generate flashcards automatically from its content. Access your flashcards from the Flashcards section, where you can review them, shuffle them, and track your progress.";
    }
    else if (input.includes('search') || input.includes('find')) {
      return "MindGrove's search functionality lets you search across all your uploaded documents. Just type your query in the search bar at the top of the page, and MindGrove will find relevant information from your research materials.";
    }
    else if (input.includes('streak') || input.includes('daily')) {
      return "The daily streak feature encourages consistent learning habits. Your streak increases each time you use MindGrove after a 24-hour period. Keep your streak going by logging in regularly and engaging with your research materials.";
    }
    else if (input.includes('profile') || input.includes('account')) {
      return "You can manage your profile by clicking on your profile picture or visiting the Profile section. There you can update your personal information, view your statistics, and manage your email preferences.";
    }
    else if (input.includes('help') || input.includes('support')) {
      return "If you need help, you can use this chatbot for quick answers, check our documentation by clicking on the Help button in the sidebar, or send us feedback through the contact form on the Dashboard. For technical issues, please email support@mindgrove.ai.";
    }
    else if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello! How can I help you with MindGrove today? Would you like to learn about uploading documents, creating flashcards, or using our other features?";
    }
    else if (input.includes('thank')) {
      return "You're welcome! I'm here to help. Is there anything else you'd like to know about MindGrove?";
    }
    else {
      return "I'm not sure I understand. Would you like to know about MindGrove's features, how to upload documents, or how to use flashcards? Feel free to ask a specific question about how MindGrove can help with your research and learning.";
    }
  };

  const suggestionPrompts = [
    "What is MindGrove?",
    "What features does MindGrove offer?",
    "How do I upload documents?",
    "How do the flashcards work?",
    "What's the daily streak feature?"
  ];

  const handleTypewriterComplete = (messageId: string) => {
    setTypingComplete(prev => ({
      ...prev,
      [messageId]: true
    }));
  };

  return (
    <>
      {/* Chat button */}
      <motion.button
        className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors"
        onClick={toggleChat}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Chat with AI assistant"
      >
        <MessageSquare className="h-5 w-5" />
      </motion.button>
      
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleChat}
          />
        )}
      </AnimatePresence>
      
      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-[90vw] sm:w-96 h-[500px] bg-card rounded-lg shadow-xl flex flex-col border overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            {/* Chat header */}
            <div className="bg-primary p-4 text-white flex items-center justify-between">
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2" />
                <h2 className="font-bold">MindGrove Assistant</h2>
              </div>
              <button 
                onClick={toggleChat}
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="Close chat"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-card/30">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">
                      {message.sender === 'bot' ? (
                        typingComplete[message.id] ? (
                          message.content
                        ) : (
                          <Typewriter 
                            text={message.content} 
                            delay={30} 
                            onComplete={() => handleTypewriterComplete(message.id)} 
                          />
                        )
                      ) : (
                        message.content
                      )}
                    </p>
                    <p className="text-xs opacity-70 mt-1 text-right">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="mb-4 flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                    <p className="text-sm">
                      <span className="typing-animation">Thinking...</span>
                    </p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Suggested prompts */}
            {showSuggestions && messages.length <= 2 && (
              <div className="px-4 py-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestionPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      className="text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-full px-3 py-1 transition-colors"
                      onClick={() => handleSuggestionClick(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Related questions after bot response */}
            {!isTyping && messages.length > 1 && messages[messages.length - 1].sender === 'bot' && typingComplete[messages[messages.length - 1].id] && (
              <div className="px-4 py-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">You might also want to know:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestionPrompts
                    .filter(prompt => !messages.some(m => m.sender === 'user' && m.content === prompt))
                    .slice(0, 3)
                    .map((prompt, index) => (
                      <button
                        key={index}
                        className="text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-full px-3 py-1 transition-colors"
                        onClick={() => handleSuggestionClick(prompt)}
                      >
                        {prompt}
                      </button>
                    ))}
                </div>
              </div>
            )}
            
            {/* Chat input */}
            <div className="p-3 border-t border-border bg-background">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 p-2 border rounded-l-md bg-background focus:outline-none focus:ring-1 focus:ring-primary text-foreground dark:text-white"
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                />
                <button
                  className="bg-primary text-white p-2 rounded-r-md hover:bg-primary/90 transition-colors"
                  onClick={sendMessage}
                  disabled={!inputMessage.trim()}
                  aria-label="Send message"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
