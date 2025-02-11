import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

interface ChatContextType {
  setProductContext: (context: ProductContext | null) => void;
  productContext: ProductContext | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  messages: Message[];
  addMessage: (text: string, sender: 'bot' | 'user') => void;
  setMessage: (text: string) => void;
}

export interface ProductContext {
  name: string;
  description?: string;
  category?: string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [productContext, setProductContext] = useState<ProductContext | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = (text: string, sender: 'bot' | 'user') => {
    const newMessage: Message = {
      id: uuidv4(),
      text,
      sender,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Função auxiliar para definir uma mensagem do bot
  const setMessage = (text: string) => {
    addMessage(text, 'bot');
  };

  return (
    <ChatContext.Provider
      value={{
        productContext,
        setProductContext,
        isOpen,
        setIsOpen,
        messages,
        addMessage,
        setMessage
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
