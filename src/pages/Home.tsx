/**
 * Home.tsx
 * 
 * Este arquivo implementa a página inicial com busca inteligente de produtos.
 * O fluxo de busca funciona da seguinte forma:
 * 
 * 1. Interface do Usuário:
 *    - Usuario digita sua necessidade em linguagem natural
 *    - Ex: "Preciso quebrar uma parede" ou "Quero fazer uma calçada"
 * 
 * 2. Processamento com GPT-4:
 *    - A busca do usuário é enviada para o GPT-4
 *    - O GPT-4 analisa e retorna:
 *      {
 *        context: "descrição do contexto" (ex: "demolição de parede")
 *        searchTerms: ["termo1", "termo2"] (ex: ["martelo demolidor", "rompedor"])
 *      }
 * 
 * 3. Busca no Banco (Supabase):
 *    - Busca todas as máquinas com seus relacionamentos (categoria, dados técnicos)
 *    - Filtra localmente usando os termos do GPT
 *    - Campos importantes: nome, descrição, categoria
 * 
 * 4. Exibição dos Resultados:
 *    - Mostra uma mensagem contextualizada da IA
 *    - Lista os produtos encontrados usando ProductCard
 *    - Cada produto tem link para sua página detalhada
 * 
 * Observações Importantes:
 * - A busca é feita em memória para melhor performance
 * - O GPT-4 precisa de uma API key válida em VITE_OPENAI_API_KEY
 * - Os produtos precisam ter nome e descrição bem definidos no Supabase
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, SendHorizontal, Bot, User2, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Navbar } from '../components/Navbar';
import { ProductCard } from '../components/product/ProductCard';
import { VoiceSearch } from '../components/VoiceSearch';
import type { Product, TechnicalData } from '../types/product';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  products: Product[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  mainImageUrl: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
}

/**
 * Retorna uma saudação apropriada baseada na hora do dia e no usuário
 */
const getGreeting = async () => {
  const hour = new Date().getHours();
  let timeGreeting = '';
  
  if (hour >= 5 && hour < 12) {
    timeGreeting = 'Bom dia';
  } else if (hour >= 12 && hour < 18) {
    timeGreeting = 'Boa tarde';
  } else {
    timeGreeting = 'Boa noite';
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Buscar o perfil do usuário para obter o nome
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', user.id)
        .single();

      if (profile?.first_name) {
        return `${timeGreeting}, ${profile.first_name}! 👋 Como posso ajudar você hoje? Me conte o que precisa fazer, por exemplo:`;
      }
    }
    
    // Mensagem padrão para usuários não logados
    return `${timeGreeting}! 👋 Sou seu assistente virtual e estou aqui para ajudar você a encontrar os equipamentos ideais para sua obra. Me conte o que precisa fazer, por exemplo:`;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return `${timeGreeting}! 👋 Como posso ajudar você hoje? Me conte o que precisa fazer, por exemplo:`;
  }
};

export function Home() {
  const chatRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiResponse, setAIResponse] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [voiceContext, setVoiceContext] = useState('');
  const theme = useSelector((state: RootState) => state.theme.theme);
  const [messages, setMessages] = useState<Message[]>([]);

  // Inicializar com a mensagem de boas-vindas
  useEffect(() => {
    const initializeGreeting = async () => {
      const hour = new Date().getHours();
      let timeGreeting = '';
      
      if (hour >= 5 && hour < 12) {
        timeGreeting = 'Bom dia';
      } else if (hour >= 12 && hour < 18) {
        timeGreeting = 'Boa tarde';
      } else {
        timeGreeting = 'Boa noite';
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Primeira mensagem - Saudação
        await addMessageWithDelay({
          id: 'welcome-1',
          type: 'ai',
          content: user ? `${timeGreeting}, ${user.user_metadata?.first_name || ''}! 👋` : `${timeGreeting}! 👋`,
          products: []
        }, 0);

        // Segunda mensagem - Apresentação
        await addMessageWithDelay({
          id: 'welcome-2',
          type: 'ai',
          content: 'Sou seu assistente virtual e estou aqui para ajudar você a encontrar os equipamentos ideais para sua obra.',
          products: []
        }, 800);

        // Terceira mensagem - Instruções
        await addMessageWithDelay({
          id: 'welcome-3',
          type: 'ai',
          content: `Me conte o que precisa fazer. Por exemplo:\n\n• "Preciso quebrar uma parede"\n• "Vou fazer uma calçada nova"\n• "Quero instalar piso em 100m²"`,
          products: []
        }, 1000);

      } catch (error) {
        console.error('Erro ao inicializar saudação:', error);
        // Em caso de erro, usa saudação simples
        setMessages([{
          id: 'welcome-fallback',
          type: 'ai',
          content: `${timeGreeting}! 👋 Como posso ajudar você hoje?`,
          products: []
        }]);
      }
    };
    
    initializeGreeting();
  }, []);

  // Scroll para o fim quando novas mensagens são adicionadas
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Função auxiliar para adicionar mensagem mantendo a ordem cronológica
  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  /**
   * Adiciona uma mensagem com delay para simular digitação
   */
  const addMessageWithDelay = async (message: Message, delay: number = 500) => {
    await new Promise(resolve => setTimeout(resolve, delay));
    setMessages(prev => [...prev, message]);
  };

  /**
   * Busca máquinas no banco de dados baseado nos termos sugeridos pela IA
   */
  const searchMachines = async (searchTerms: string[]): Promise<Product[]> => {
    try {
      console.log('Iniciando busca com termos:', searchTerms);
      
      // 1. Busca todas as máquinas com relacionamentos
      const { data: machines, error } = await supabase
        .from('machines')
        .select(`
          id,
          name,
          description,
          main_image_url,
          category_id,
          category:categories!machines_category_id_fkey (
            id,
            name,
            type
          )
        `);

      if (error) {
        console.error('Erro ao buscar máquinas:', error);
        return [];
      }

      if (!machines) {
        console.log('Nenhuma máquina encontrada no banco');
        return [];
      }

      console.log('Máquinas encontradas no banco:', machines.length);
      console.log('Primeira máquina:', machines[0]);

      // 2. Filtra localmente usando os termos de busca
      const filteredMachines = machines.filter(machine => {
        return searchTerms.some(term => {
          const searchTerm = term.toLowerCase();
          const nameMatch = machine.name?.toLowerCase().includes(searchTerm);
          const descMatch = machine.description?.toLowerCase().includes(searchTerm);
          const catMatch = machine.category?.name?.toLowerCase().includes(searchTerm);
          
          console.log(`Verificando máquina ${machine.id}:`, {
            termo: searchTerm,
            nome: machine.name,
            nameMatch,
            descMatch,
            catMatch
          });
          
          return nameMatch || descMatch || catMatch;
        });
      });

      console.log('Máquinas filtradas:', filteredMachines.length);

      // 3. Mapeia para o formato do ProductCard
      return filteredMachines.map(machine => ({
        id: machine.id,
        name: machine.name,
        description: machine.description,
        mainImageUrl: machine.main_image_url,
        categoryId: machine.category_id,
        category: machine.category
      }));
    } catch (error) {
      console.error('Erro ao buscar máquinas:', error);
      return [];
    }
  };

  /**
   * Processa a busca do usuário com GPT-4 e retorna produtos relevantes
   */
  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchTerm.trim()) return;

    setIsProcessingAI(true);

    try {
      // 1. Adiciona mensagem do usuário
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: searchTerm,
        products: []
      };
      addMessage(userMessage);

      // Primeira mensagem do assistente - reconhecimento
      await addMessageWithDelay({
        id: Date.now().toString(),
        type: 'ai',
        content: 'Deixa eu ver o que posso encontrar para você...',
        products: []
      }, 800);

      // 2. Processamento com GPT-4
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `Você é um especialista em equipamentos para construção civil.
                Analise a necessidade do usuário e retorne um JSON com:
                - context: breve descrição do contexto/necessidade
                - searchTerms: array com termos técnicos para busca de equipamentos
                Exemplo: {"context": "demolição de parede", "searchTerms": ["martelo demolidor", "rompedor", "martelete"]}
                Responda APENAS o JSON, sem texto adicional.`
            },
            {
              role: "user",
              content: searchTerm
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Erro na chamada da API do GPT');
      }

      const gptResponse = await response.json();
      const gptMessage = gptResponse.choices[0].message.content;
      
      // 3. Extrai contexto e termos de busca
      const { context, searchTerms } = JSON.parse(gptMessage);

      // Segunda mensagem do assistente - entendimento
      await addMessageWithDelay({
        id: Date.now().toString(),
        type: 'ai',
        content: `Entendi, você precisa de equipamentos para ${context.toLowerCase()}...`,
        products: []
      }, 1000);

      // 4. Busca produtos no Supabase
      const products = await searchMachines(searchTerms);

      // 5. Exibe resultados
      if (products.length === 0) {
        // Mensagem de desculpas
        await addMessageWithDelay({
          id: Date.now().toString(),
          type: 'ai',
          content: `Hmm, não encontrei equipamentos específicos para isso.`,
          products: []
        }, 800);

        // Sugestão de alternativas
        await addMessageWithDelay({
          id: Date.now().toString(),
          type: 'ai',
          content: `Que tal tentar descrever de outra forma? Por exemplo:
            • "Preciso quebrar uma parede"
            • "Quero fazer uma calçada"
            • "Preciso misturar concreto"`,
          products: []
        }, 1000);
      } else {
        // Mensagem de sucesso
        await addMessageWithDelay({
          id: Date.now().toString(),
          type: 'ai',
          content: `Ótimo! Encontrei ${products.length} ${products.length === 1 ? 'equipamento perfeito' : 'equipamentos perfeitos'} para você.`,
          products: []
        }, 800);

        // Mensagem com os produtos
        await addMessageWithDelay({
          id: Date.now().toString(),
          type: 'ai',
          content: 'Dá uma olhada nessas opções:',
          products: products
        }, 1000);
      }

      setSearchTerm('');
    } catch (error) {
      console.error('Erro no processamento da busca:', error);
      await addMessageWithDelay({
        id: Date.now().toString(),
        type: 'ai',
        content: 'Ops, tive um probleminha aqui. Pode tentar novamente?',
        products: []
      }, 800);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleVoiceSearch = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text
    };
    addMessage(userMessage);
    
    setIsProcessingAI(true);
    try {
      // Consulta o GPT-4 primeiro
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('API key não configurada');
      }

      console.log('Consultando GPT-4 com termo:', text);
      const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `Você é um assistente especializado em equipamentos para construção civil. 
                Analise a necessidade do usuário e retorne um JSON com:
                - context: breve descrição do contexto/necessidade
                - searchTerms: array com termos técnicos para busca de equipamentos
                Exemplo: {"context": "demolição de parede", "searchTerms": ["martelo demolidor", "rompedor"]}
                Responda APENAS o JSON, sem texto adicional.`
            },
            {
              role: "user",
              content: text
            }
          ]
        })
      });

      if (!gptResponse.ok) {
        throw new Error('Erro na chamada da API');
      }

      const { choices } = await gptResponse.json();
      if (!choices || choices.length === 0) {
        throw new Error('Sem resposta da IA');
      }

      // Processa a resposta do GPT
      const gptData = JSON.parse(choices[0].message.content);
      console.log('Resposta do GPT:', gptData);
      setVoiceContext(gptData.context);

      // Busca as máquinas com os termos sugeridos pela IA
      console.log('Buscando máquinas com termos:', gptData.searchTerms);
      const response = await searchMachines(gptData.searchTerms);
      console.log('Máquinas encontradas:', response);
      
      const aiResponseText = `Entendi que você precisa de equipamentos para ${gptData.context}. Encontrei ${response.length} opções que podem te ajudar.`;
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponseText,
        products: response
      };
      addMessage(aiMessage);
      
      setSearchResults(response);
      setAIResponse(aiResponseText);
    } catch (error) {
      console.error('Error processing voice search:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Desculpe, ocorreu um erro ao processar sua busca por voz. Por favor, tente novamente.',
        products: []
      };
      addMessage(errorMessage);
    } finally {
      setIsProcessingAI(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-background'}`}>
      <Navbar />
      
      <main className="flex flex-col h-screen">
        {/* Hero Section */}
        <div className="relative">
          {/* Fundo branco com gradiente */}
          <div className="absolute inset-0 -bottom-24">
            <div className={`w-full h-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`} />
            <div className={`absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b ${theme === 'dark' ? 'from-gray-900' : 'from-white'} to-transparent`} />
          </div>
          
          {/* Efeito decorativo sutil */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-1/4 -top-1/4 w-1/2 h-1/2 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
          </div>

          {/* Conteúdo do hero */}
          <div className="relative">
            <div className="container mx-auto px-4 relative py-10">
              <div className="max-w-4xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-block"
                >
                  <span className={`inline-flex items-center px-6 py-2.5 rounded-full text-lg font-medium ${theme === 'dark' ? 'bg-primary/20 text-primary-foreground' : 'bg-primary/10 text-primary'} mb-8`}>
                    <Bot className="w-6 h-6 mr-3" />
                    Aluguel inteligente de equipamentos
                  </span>
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight ${theme === 'dark' ? 'text-gray-100' : 'text-foreground'} mb-8`}
                >
                  Os melhores equipamentos para{' '}
                  <span className="relative inline-block">
                    <span className="text-primary">sua obra</span>
                    <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 100 10" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/30" />
                    </svg>
                  </span>
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`text-xl md:text-2xl leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'} max-w-3xl mx-auto`}
                >
                  Do pequeno reparo à grande construção, conte com equipamentos de qualidade 
                  e um atendimento que entende exatamente o que você precisa.
                </motion.p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Container - área rolável com altura fixa */}
        <div className="h-[346px] relative">
          {/* Área de mensagens com scroll */}
          <div className="h-full overflow-y-auto" ref={chatRef}>
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto py-4 space-y-4 flex flex-col">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full"
                  >
                    <div className={`flex gap-2 items-start ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {message.type === 'user' ? (
                          <User2 className="w-4 h-4 text-primary" />
                        ) : (
                          <Bot className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className={`flex-1 space-y-4 ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`backdrop-blur-sm rounded-2xl ${message.type === 'user' ? 'rounded-tr-sm bg-primary text-primary-foreground' : `rounded-tl-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-card/50 border-border/50'} border`} p-6 shadow-sm`}>
                          <p className={`text-sm whitespace-pre-wrap ${message.type === 'user' ? '' : theme === 'dark' ? 'text-gray-200' : ''}`}>
                            {message.content}
                          </p>
                        </div>
                        
                        {/* Renderiza os produtos se houver */}
                        {message.products && message.products.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                            {message.products.map((product) => (
                              <ProductCard
                                key={product.id}
                                product={product}
                                variant="compact"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Loading State */}
                {isProcessingAI && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2 items-start"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 max-w-[80%]">
                      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-card/50 border-border/50'} backdrop-blur-sm rounded-2xl rounded-tl-sm p-6 shadow-sm border`}>
                        <div className="flex items-center gap-2">
                          <Loader2 className={`w-4 h-4 animate-spin ${theme === 'dark' ? 'text-gray-200' : ''}`} />
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-200' : ''}`}>Processando sua pergunta...</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Input fixo */}
        <div className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-background border-t'}`}>
          <div className="container mx-auto px-4 py-4">
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative flex items-center gap-2">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2">
                    <Bot className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Descreva o que você precisa fazer..."
                    className={`flex-1 pl-14 pr-4 py-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-400' 
                        : 'bg-background border-input'
                    } border rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-base transition-all`}
                  />
                  <div className="flex items-center gap-2">
                    <VoiceSearch
                      onSearch={handleVoiceSearch}
                      onProcessingStateChange={setIsProcessingAI}
                    />
                    <button
                      type="submit"
                      disabled={!searchTerm.trim()}
                      className="h-12 w-12 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all shadow-lg"
                    >
                      <SendHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </form>

              {/* Quick Suggestions */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => setSearchTerm("Preciso quebrar uma parede de concreto")}
                  className={`text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-1 rounded-full border border-border/50 hover:border-primary/30 ${theme === 'dark' ? 'bg-gray-800' : 'bg-background/50'}`}
                >
                  Demolição
                </button>
                <button
                  onClick={() => setSearchTerm("Vou instalar piso em 100m²")}
                  className={`text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-1 rounded-full border border-border/50 hover:border-primary/30 ${theme === 'dark' ? 'bg-gray-800' : 'bg-background/50'}`}
                >
                  Acabamento
                </button>
                <button
                  onClick={() => setSearchTerm("Preciso fazer uma calçada nova")}
                  className={`text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-1 rounded-full border border-border/50 hover:border-primary/30 ${theme === 'dark' ? 'bg-gray-800' : 'bg-background/50'}`}
                >
                  Concretagem
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}