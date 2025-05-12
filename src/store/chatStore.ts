
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
  documentId?: string | null;
  documentTitle?: string | null;
}

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  
  // Actions
  createNewSession: () => string;
  setCurrentSession: (sessionId: string) => void;
  addMessage: (message: Omit<Message, 'id'>, sessionId?: string) => void;
  deleteSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  setDocumentContext: (documentId: string | null, documentTitle: string | null) => void;
  clearDocumentContext: () => void;
  getSessions: () => ChatSession[];
  getCurrentSession: () => ChatSession | null;
  getMessages: (sessionId?: string) => Message[];
}

// Helper function to generate a title from the first user message
const generateTitleFromMessage = (content: string): string => {
  // Truncate to first 30 chars or first sentence
  const title = content.split(/[.!?]/)[0].trim();
  return title.length > 30 ? title.substring(0, 27) + '...' : title;
};

// Create store with persistence
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,

      createNewSession: () => {
        const newSessionId = uuidv4();
        const newSession: ChatSession = {
          id: newSessionId,
          title: 'New Chat',
          messages: [
            {
              id: uuidv4(),
              content: "👋 Hello! I'm your MindGrove AI assistant. How can I help you today?",
              role: 'assistant',
              timestamp: new Date(),
            }
          ],
          lastUpdated: new Date(),
        };

        set(state => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: newSessionId
        }));
        
        return newSessionId;
      },

      setCurrentSession: (sessionId) => {
        set({ currentSessionId: sessionId });
      },

      addMessage: (message, sessionId) => {
        const targetSessionId = sessionId || get().currentSessionId;
        
        if (!targetSessionId) {
          // If no session exists, create one and add the message to it
          const newSessionId = get().createNewSession();
          
          set(state => {
            const sessions = [...state.sessions];
            const sessionIndex = sessions.findIndex(s => s.id === newSessionId);
            
            if (sessionIndex !== -1) {
              const updatedSession = { ...sessions[sessionIndex] };
              const newMessage = { id: uuidv4(), ...message };
              updatedSession.messages = [...updatedSession.messages, newMessage];
              
              // If this is the first user message, update the title
              if (message.role === 'user' && updatedSession.title === 'New Chat') {
                updatedSession.title = generateTitleFromMessage(message.content);
              }
              
              updatedSession.lastUpdated = new Date();
              sessions[sessionIndex] = updatedSession;
              
              return { sessions };
            }
            return state;
          });
          return;
        }

        set(state => {
          const sessions = [...state.sessions];
          const sessionIndex = sessions.findIndex(s => s.id === targetSessionId);
          
          if (sessionIndex !== -1) {
            const updatedSession = { ...sessions[sessionIndex] };
            const newMessage = { id: message.id || uuidv4(), ...message };
            updatedSession.messages = [...updatedSession.messages, newMessage];
            
            // If this is the first user message, update the title
            if (message.role === 'user' && updatedSession.title === 'New Chat') {
              updatedSession.title = generateTitleFromMessage(message.content);
            }
            
            updatedSession.lastUpdated = new Date();
            sessions[sessionIndex] = updatedSession;
            
            return { sessions };
          }
          return state;
        });
      },

      deleteSession: (sessionId) => {
        set(state => {
          const newSessions = state.sessions.filter(s => s.id !== sessionId);
          
          // If the deleted session was the current one, set current to null
          const newCurrentSessionId = 
            state.currentSessionId === sessionId
              ? newSessions.length > 0 ? newSessions[0].id : null
              : state.currentSessionId;
              
          return {
            sessions: newSessions,
            currentSessionId: newCurrentSessionId
          };
        });
      },

      updateSessionTitle: (sessionId, title) => {
        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? { ...session, title }
              : session
          )
        }));
      },

      setDocumentContext: (documentId, documentTitle) => {
        if (!get().currentSessionId) {
          // Create a new session if none exists
          const newSessionId = get().createNewSession();
          
          set(state => {
            const sessions = [...state.sessions];
            const sessionIndex = sessions.findIndex(s => s.id === newSessionId);
            
            if (sessionIndex !== -1) {
              sessions[sessionIndex] = {
                ...sessions[sessionIndex],
                documentId: documentId,
                documentTitle: documentTitle,
                title: documentTitle ? `Chat about: ${documentTitle}` : 'New Chat',
                messages: [
                  ...sessions[sessionIndex].messages,
                  {
                    id: uuidv4(),
                    role: 'system',
                    content: `📄 Now discussing document: "${documentTitle}". You can ask me questions about this document.`,
                    timestamp: new Date()
                  }
                ]
              };
              
              return { sessions };
            }
            return state;
          });
          return;
        }
        
        set(state => {
          const sessions = [...state.sessions];
          const sessionIndex = sessions.findIndex(s => s.id === state.currentSessionId);
          
          if (sessionIndex !== -1) {
            const updatedSession = {
              ...sessions[sessionIndex],
              documentId,
              documentTitle,
              title: documentTitle ? `Chat about: ${documentTitle}` : sessions[sessionIndex].title,
              lastUpdated: new Date()
            };
            
            // Add system message indicating document selection
            updatedSession.messages = [
              ...updatedSession.messages,
              {
                id: uuidv4(),
                role: 'system',
                content: `📄 Now discussing document: "${documentTitle}". You can ask me questions about this document.`,
                timestamp: new Date()
              }
            ];
            
            sessions[sessionIndex] = updatedSession;
            
            return { sessions };
          }
          return state;
        });
      },

      clearDocumentContext: () => {
        if (!get().currentSessionId) return;
        
        set(state => {
          const sessions = [...state.sessions];
          const sessionIndex = sessions.findIndex(s => s.id === state.currentSessionId);
          
          if (sessionIndex !== -1) {
            sessions[sessionIndex] = {
              ...sessions[sessionIndex],
              documentId: null,
              documentTitle: null,
              lastUpdated: new Date()
            };
            
            // Add system message indicating document unselection
            sessions[sessionIndex].messages = [
              ...sessions[sessionIndex].messages,
              {
                id: uuidv4(),
                role: 'system',
                content: `Document context has been removed. I'll respond to general questions now.`,
                timestamp: new Date()
              }
            ];
            
            return { sessions };
          }
          return state;
        });
      },

      getSessions: () => get().sessions,
      
      getCurrentSession: () => {
        const { sessions, currentSessionId } = get();
        return sessions.find(s => s.id === currentSessionId) || null;
      },
      
      getMessages: (sessionId) => {
        const targetSessionId = sessionId || get().currentSessionId;
        if (!targetSessionId) return [];
        
        const session = get().sessions.find(s => s.id === targetSessionId);
        return session ? session.messages : [];
      }
    }),
    {
      name: 'mindgrove-chat-storage',
      partialize: (state) => ({
        sessions: state.sessions.map(session => ({
          ...session,
          messages: session.messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp.toISOString()
          })),
          lastUpdated: session.lastUpdated.toISOString()
        })),
        currentSessionId: state.currentSessionId
      }),
      onRehydrateStorage: () => (state) => {
        // Fix date objects after rehydration from localStorage
        if (state && state.sessions) {
          state.sessions = state.sessions.map(session => ({
            ...session,
            messages: session.messages.map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            })),
            lastUpdated: new Date(session.lastUpdated)
          }));
        }
      }
    }
  )
);
