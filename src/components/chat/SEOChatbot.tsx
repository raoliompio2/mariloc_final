import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { openai } from '../../lib/openai-client';
import { openAIUsage } from '../../services/openai-usage';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SEOChatbotProps {
  onSelectDescription?: (description: string) => void;
  initialKeywords?: string[];
}

export function SEOChatbot({ onSelectDescription, initialKeywords = [] }: SEOChatbotProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou seu assistente de SEO. Me diga as palavras-chave do seu produto e eu ajudo a criar uma descrição otimizada. 🎯'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Adiciona palavras-chave iniciais se fornecidas
  useEffect(() => {
    if (initialKeywords?.length > 0) {
      handleInitialKeywords();
    }
  }, [initialKeywords]);

  const handleInitialKeywords = async () => {
    const keywordsStr = initialKeywords.join(', ');
    const message = `Palavras-chave iniciais: ${keywordsStr}. Por favor, sugira uma descrição otimizada.`;
    await sendMessage(message);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const newMessage: Message = { role: 'user', content: messageText };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const prompt = `
        Você é um especialista em SEO para aluguel de máquinas e equipamentos.
        Crie uma meta description otimizada para SEO usando estas palavras-chave: ${messageText}

        REGRAS DE SEO:
        1. Comprimento ideal: 150-160 caracteres (Google trunca após isso)
        2. Estrutura:
           - Comece com um verbo de ação forte
           - Inclua a palavra-chave principal nos primeiros 120 caracteres
           - Termine com call-to-action claro

        ELEMENTOS OBRIGATÓRIOS:
        1. Palavras-chave LSI (sinônimos e termos relacionados)
        2. Benefícios específicos e mensuráveis
        3. Proposta de valor única
        4. Localização geográfica (se fornecida)
        5. Credenciais ou diferenciais relevantes

        OTIMIZAÇÃO:
        1. Use linguagem natural e fluida
        2. Evite keyword stuffing
        3. Inclua números e dados quando relevante
        4. Use modificadores de pesquisa (melhor, top, profissional)

        RESTRIÇÕES:
        1. NUNCA mencionar preços específicos
        2. NUNCA mencionar prazos de entrega específicos
        3. Usar "Entre em contato" para preços
        4. Usar "Consulte disponibilidade" para prazos

        EXEMPLO DE ESTRUTURA:
        [Verbo Ação] + [Palavra-chave Principal] + [Benefício Único] + [Diferenciais] + [Call-to-Action]

        Retorne apenas a descrição otimizada, sem explicações adicionais.
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }]
      });

      if (!response?.choices?.[0]?.message?.content) {
        throw new Error('Resposta inválida da OpenAI');
      }

      const aiResponse = response.choices[0].message.content;

      // Registra uso do GPT apenas se houver dados de uso
      if (response.usage?.total_tokens) {
        try {
          await openAIUsage.logUsage({
            tokens: response.usage.total_tokens,
            cost: response.usage.total_tokens * 0.00003,
            model: 'gpt-4',
            purpose: 'seo_chatbot',
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error logging GPT usage:', error);
          // Não interrompe o fluxo se falhar o log
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);

    } catch (error) {
      console.error('Error generating SEO description:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Desculpe, tive um problema ao gerar a descrição. Tente novamente.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
      >
        SEO
      </button>
    );
  }

  return (
    <div className={`fixed right-4 bg-white rounded-lg shadow-xl transition-all duration-200 ${
      isMinimized ? 'bottom-4 h-14' : 'bottom-4 h-[500px]'
    }`} style={{ width: '350px' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Assistente de SEO</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-[380px] overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.role === 'assistant' && onSelectDescription && (
                    <button
                      onClick={() => onSelectDescription(message.content)}
                      className="mt-2 text-xs text-primary-600 hover:underline"
                    >
                      Usar esta descrição
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={isLoading ? 'Gerando descrição...' : 'Digite suas palavras-chave...'}
                disabled={isLoading}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!isLoading && input.trim()) {
                      sendMessage(input);
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (!isLoading && input.trim()) {
                    sendMessage(input);
                  }
                }}
                disabled={isLoading}
                className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
