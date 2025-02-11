import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bot, X, ChevronUp, Send, ExternalLink } from 'lucide-react';
import { useChatContext } from '../../contexts/ChatContext';
import { useGPT4 } from '../../hooks/useGPT4';
import { useDeepSeek } from '../../hooks/useDeepSeek';
import { useProductSearch } from '../../hooks/useProductSearch';
import { TypeAnimation } from 'react-type-animation';

interface ChatBotProps {
  initialMessage?: string;
}

interface ProductInfo {
  name: string;
  description: string;
  category: string;
  technical_data?: Array<{
    label: string;
    value: string;
  }>;
}

interface ProductLink {
  name: string;
  category?: string;
  url: string;
}

export function ChatBot({ initialMessage }: ChatBotProps) {
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [productLinks, setProductLinks] = useState<ProductLink[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { searchWithGPT4 } = useGPT4();
  const { searchWithDeepSeek } = useDeepSeek();
  const { searchProducts } = useProductSearch();

  const {
    isOpen,
    setIsOpen,
    messages,
    addMessage,
    productContext
  } = useChatContext();

  // Scroll para a última mensagem
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const generateProductUrl = (name: string) => {
    return `/catalogo-de-produtos/produto/${name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')}`;
  };

  // Carrega informações detalhadas do produto
  useEffect(() => {
    const loadProductInfo = async () => {
      if (!productContext?.name) return;

      try {
        const { data: products, error } = await searchProducts([productContext.name]);
        if (error) throw error;

        if (products && products.length > 0) {
          const product = products[0];
          setProductInfo({
            name: product.name,
            description: product.description,
            category: product.category?.name || '',
            technical_data: product.technical_data
          });

          // Adiciona o produto atual aos links
          setProductLinks([{
            name: product.name,
            category: product.category?.name,
            url: generateProductUrl(product.name)
          }]);
        }
      } catch (err) {
        console.error('Erro ao carregar informações do produto:', err);
      }
    };

    loadProductInfo();
  }, [productContext]);

  // Efeito para adicionar mensagem inicial
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      addMessage(initialMessage, 'bot');
    }
  }, [initialMessage, messages.length, addMessage]);

  // Efeito para adicionar contexto do produto
  useEffect(() => {
    if (productContext && !messages.some(m => m.text.includes(productContext.name))) {
      setIsTyping(true);
      setTimeout(() => {
        const productMessage = `Olá! Encontrei o ${productContext.name} para você. Como posso ajudar?`;
        addMessage(productMessage, 'bot');
        setIsTyping(false);
      }, 800);
    }
  }, [productContext, messages, addMessage]);

  const processAIResponses = async (cleanQuestion: string) => {
    try {
      // Faz chamadas paralelas para ambas as IAs
      const [gptResponse, deepSeekResponse] = await Promise.all([
        searchWithGPT4(cleanQuestion),
        searchWithDeepSeek(cleanQuestion)
      ]);

      // Combina os termos de busca das duas IAs
      const searchTerms = new Set<string>();
      if (gptResponse?.searchTerms) {
        gptResponse.searchTerms.forEach(term => searchTerms.add(term.toLowerCase().trim()));
      }
      if (deepSeekResponse?.searchTerms) {
        deepSeekResponse.searchTerms.forEach(term => searchTerms.add(term.toLowerCase().trim()));
      }

      // Se encontrou termos de busca
      if (searchTerms.size > 0) {
        // Usa a mesma função de busca da Home
        const products = await searchProducts(Array.from(searchTerms));
        console.log('Produtos encontrados:', products);

        if (products && products.length > 0) {
          // Remove duplicados baseado no nome
          const uniqueProducts = products.filter((product, index, self) =>
            index === self.findIndex((p) => p.name === product.name)
          );

          // Atualiza os links de produtos
          const newLinks = uniqueProducts.map(p => ({
            name: p.name,
            category: p.category?.name,
            url: generateProductUrl(p.name)
          }));

          setProductLinks(prevLinks => {
            const allLinks = [...prevLinks, ...newLinks];
            return allLinks.filter((link, index) => 
              allLinks.findIndex(l => l.url === link.url) === index
            );
          });

          // Se encontrou apenas um produto, atualiza o contexto e redireciona
          if (uniqueProducts.length === 1) {
            const product = uniqueProducts[0];
            setProductInfo({
              name: product.name,
              description: product.description,
              category: product.category?.name || '',
              technical_data: product.technical_data
            });
            
            // Redireciona para o produto
            const productUrl = generateProductUrl(product.name);
            navigate(productUrl);
            
            return `Aqui está o que você procura!\n→ ${product.name}`;
          }

          // Pega o contexto mais relevante das duas IAs
          const context = deepSeekResponse?.context || gptResponse?.context || '';
          const contextPart = context.split('.')[0];
          
          // Lista produtos sem duplicação
          const productList = uniqueProducts
            .map(p => `• ${p.name}${p.category?.name ? ` (${p.category.name})` : ''}`)
            .join('\n');

          return `${contextPart}.\n${productList}`;
        }
      }
      
      return "Não encontrei esse produto. Tente descrever de outra forma.";
    } catch (error) {
      console.error('Erro ao processar respostas das IAs:', error);
      return "Desculpe, tive um problema. Pode tentar novamente?";
    }
  };

  const processGPTResponse = async (question: string): Promise<string> => {
    try {
      // Limpa a entrada removendo comentários do GPT
      const cleanQuestion = question
        .replace(/O cliente está perguntando.*$/m, '')
        .replace(/após uma discussão.*$/m, '')
        .trim();

      // Primeiro, verifica se é uma pergunta direta sobre um produto
      const isAskingForProduct = cleanQuestion.toLowerCase().includes('tem') || 
                                cleanQuestion.toLowerCase().includes('sobre') ||
                                cleanQuestion.toLowerCase().includes('mostrar') ||
                                cleanQuestion.toLowerCase().includes('leve') ||
                                cleanQuestion.toLowerCase().includes('pagina') ||
                                cleanQuestion.toLowerCase().includes('página');

      // Se for uma pergunta direta, busca primeiro no banco
      if (isAskingForProduct) {
        const productName = cleanQuestion
          .toLowerCase()
          .replace(/tem /g, '')
          .replace(/sobre /g, '')
          .replace(/mostrar /g, '')
          .replace(/leve /g, '')
          .replace(/pagina d[aeo] /g, '')
          .replace(/página d[aeo] /g, '')
          .replace(/até a /g, '')
          .replace(/pff/g, '')
          .replace(/\?/g, '')
          .trim();

        const products = await searchProducts([productName]);
        if (products && products.length > 0) {
          const product = products[0];
          setProductInfo({
            name: product.name,
            description: product.description,
            category: product.category?.name || '',
            technical_data: product.technical_data
          });

          const productUrl = generateProductUrl(product.name);
          navigate(productUrl);
          
          return `Vou te mostrar todos os detalhes!\n→ ${product.name}`;
        }
      }

      // Se não encontrou diretamente, usa as IAs
      return processAIResponses(cleanQuestion);
    } catch (error) {
      console.error('Erro ao processar resposta:', error);
      return "Desculpe, tive um problema. Pode tentar novamente?";
    }
  };

  const handleProductClick = (url: string) => {
    // Encontra o produto clicado
    const clickedProduct = productLinks.find(p => p.url === url);
    if (clickedProduct) {
      // Atualiza o contexto do produto
      setProductInfo({
        name: clickedProduct.name,
        description: '', // Será carregado no useEffect
        category: clickedProduct.category || '',
        technical_data: [] // Será carregado no useEffect
      });
    }
    navigate(url);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    addMessage(inputText, 'user');
    const question = inputText;
    setInputText('');
    
    setIsTyping(true);
    const response = await processGPTResponse(question);
    addMessage(response, 'bot');
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary-dark transition-all flex items-center gap-2"
        >
          <Bot className="w-6 h-6" />
          <span className="hidden sm:inline">Precisa de ajuda?</span>
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl w-[350px] max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="bg-primary text-white p-3 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-medium">Assistente Bolt</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-primary-dark rounded p-1.5 transition-colors"
                title={isMinimized ? "Expandir" : "Minimizar"}
              >
                <ChevronUp
                  className={`w-4 h-4 transform transition-transform ${
                    isMinimized ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-primary-dark rounded p-1.5 transition-colors"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[350px] max-h-[450px]"
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.sender === 'bot' && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center mr-2 flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] p-2.5 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      <div className="whitespace-pre-line text-sm">
                        {message.sender === 'bot' ? (
                          <TypeAnimation
                            sequence={[message.text]}
                            wrapper="p"
                            speed={50}
                            cursor={false}
                          />
                        ) : (
                          message.text.split('\n').map((line, i) => {
                            // Se a linha começa com "→", é um link para produto
                            if (line.startsWith('→')) {
                              const productName = line.substring(2).trim();
                              return (
                                <div key={i} className="flex items-center gap-2">
                                  <span>{productName}</span>
                                  <ExternalLink className="w-4 h-4" />
                                </div>
                              );
                            }
                            // Se a linha começa com "•", é um item de lista
                            if (line.startsWith('•')) {
                              return (
                                <div key={i} className="flex items-center gap-2 mt-1">
                                  <span>{line}</span>
                                </div>
                              );
                            }
                            // Linha normal
                            return <div key={i}>{line}</div>;
                          })
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center mr-2 flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Links */}
              {productLinks.length > 0 && (
                <div className="border-t border-gray-100 p-3 bg-gray-50">
                  <div className="text-xs text-gray-500 mb-2">Produtos mencionados:</div>
                  <div className="space-y-1">
                    {productLinks.map((product, index) => (
                      <button
                        key={index}
                        onClick={() => handleProductClick(product.url)}
                        className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark transition-colors w-full text-left"
                      >
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{product.name}</span>
                        {product.category && (
                          <span className="text-gray-400 text-xs">({product.category})</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="border-t p-3">
                <div className="flex gap-2">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 border rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                    rows={1}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                      inputText.trim()
                        ? 'bg-primary text-white hover:bg-primary-dark'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
