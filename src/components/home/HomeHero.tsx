import React, { useState, useEffect } from 'react';
import { Search, Mic, MicOff, Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useGPT4 } from '../../hooks/useGPT4';
import { useProductSearch } from '../../hooks/useProductSearch';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { useDeepSeek } from '../../hooks/useDeepSeek';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useChatContext } from '../../contexts/ChatContext';
import { TypeAnimation } from 'react-type-animation';
import { BrandsCarousel } from './BrandsCarousel';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const welcomeSequence = [
  'Bem-vindo à Mariloc\nA Ferramenta certa para sua obra',
  2000,
  'As melhores marcas mundiais,\nvocê aluga na Mariloc',
  2000,
  'De Profissional para Profissional\nAs melhores soluções para você',
  2000,
];

const searchHints = [
  'Você pode me dizer o que precisa fazer, por exemplo: "preciso quebrar uma parede"',
  'Descreva sua necessidade e eu encontro o equipamento ideal para você',
  'Digite sua necessidade em linguagem natural, como se estivesse conversando comigo',
  'Me conte qual é o seu projeto e eu te ajudo a encontrar as ferramentas certas',
];

const successMessages = [
  'Ótimo! Encontrei algumas opções para você:',
  'Perfeito! Aqui estão os equipamentos ideais:',
  'Excelente escolha! Veja o que separei para você:',
  'Encontrei exatamente o que você precisa:',
];

const noResultsMessages = [
  'Hmm, não encontrei equipamentos para essa necessidade. Que tal tentar descrever de outra forma?',
  'Desculpe, não achei equipamentos específicos para isso. Pode detalhar melhor o que precisa fazer?',
  'Não tenho equipamentos que correspondam exatamente a isso. Tente explicar de outro jeito?',
  'Não encontrei resultados. Pode me dar mais detalhes sobre o que você precisa fazer?',
];

const getRandomMessage = (messages: string[]) => {
  return messages[Math.floor(Math.random() * messages.length)];
};

export function HomeHero() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentText, setCurrentText] = useState('');
  const navigate = useNavigate();
  const { setProductContext } = useChatContext();
  const { systemSettings } = useSelector((state: RootState) => state.theme);

  // Debug
  useEffect(() => {
    console.log('HomeHero systemSettings:', systemSettings);
  }, [systemSettings]);

  const { searchWithGPT4, isProcessing: isGPTProcessing } = useGPT4();
  const { searchWithDeepSeek, isProcessing: isDeepSeekProcessing } = useDeepSeek();
  const { searchProducts } = useProductSearch();

  const { 
    isRecording, 
    startRecording, 
    stopRecording, 
    transcript,
    resetTranscript,
    isSupported 
  } = useVoiceRecognition();

  // Função para calcular o tempo de espera baseado no tamanho do texto
  const waitForTyping = async (text: string) => {
    setCurrentText(text);
    // Espera 50ms por caractere para digitar + 2 segundos para ler
    const typingTime = text.length * 50;
    const readingTime = 2000;
    await new Promise(resolve => setTimeout(resolve, typingTime + readingTime));
  };

  const handleSearch = async (query: string) => {
    setShowWelcome(false);
    setIsSearching(true);
    
    try {
      await waitForTyping("Estou analisando sua necessidade...");

      const [gptResponse, deepSeekResponse] = await Promise.all([
        searchWithGPT4(query),
        searchWithDeepSeek(query)
      ]);

      if (!gptResponse && !deepSeekResponse) {
        await waitForTyping("Hmm, não entendi bem sua necessidade. Pode explicar de outro jeito?");
        return;
      }

      const searchTerms = new Set<string>();
      if (gptResponse?.searchTerms) {
        gptResponse.searchTerms.forEach(term => searchTerms.add(term.toLowerCase().trim()));
      }
      if (deepSeekResponse?.searchTerms) {
        deepSeekResponse.searchTerms.forEach(term => searchTerms.add(term.toLowerCase().trim()));
      }

      const context = gptResponse?.context || deepSeekResponse?.context;
      await waitForTyping(`Entendi! ${context}`);
      
      await waitForTyping("Procurando o equipamento ideal...");

      const products = await searchProducts(Array.from(searchTerms));
      
      if (products && products.length > 0) {
        const product = products[0];
        setProductContext({
          name: product.name,
          description: product.description,
          category: product.category?.name
        });

        await waitForTyping(`Perfeito! Encontrei o equipamento ideal: ${product.name}. Vou te mostrar mais detalhes...`);

        const productSlug = product.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');

        navigate(`/catalogo-de-produtos/produto/${productSlug}`);
      } else {
        await waitForTyping("Não encontrei um equipamento específico para isso. Me fala mais sobre o que você precisa fazer?");
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      await waitForTyping('Ops! Tive um problema ao processar sua busca. Pode tentar novamente?');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isGPTProcessing || isDeepSeekProcessing || isSearching) return;
    handleSearch(searchQuery);
    setSearchQuery('');
  };

  const handleVoiceClick = () => {
    if (isRecording) {
      stopRecording();
      if (transcript) {
        handleSearch(transcript);
        resetTranscript();
      }
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    if (transcript) {
      setSearchQuery(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (searchQuery.trim() && !isSearching) {
      setShowWelcome(false);
      setCurrentText("Me conte o que você precisa fazer...");
    } else if (!searchQuery.trim() && !isSearching) {
      setShowWelcome(true);
      setCurrentText('');
    }
  }, [searchQuery, isSearching]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#3b82f6_1px,transparent_0)] bg-[size:20px_20px] opacity-[0.2]"></div>
      <section className="w-full min-h-[calc(100vh-4rem)] bg-transparent flex flex-col items-center px-4">
        {/* Elementos decorativos sutis */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,#f1f5f9_0%,transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,#f1f5f9_0%,transparent_50%)]"></div>
        </div>

        <div className="w-full max-w-5xl mx-auto flex flex-col items-center pt-32 relative z-10">
          <div className="text-center h-[180px] flex items-center justify-center mb-36">
            {showWelcome ? (
              <TypeAnimation
                sequence={welcomeSequence}
                wrapper="h1"
                speed={50}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.2] tracking-[-0.02em] whitespace-pre-line max-w-[1000px]"
                repeat={Infinity}
                cursor={false}
              />
            ) : (
              <TypeAnimation
                key={currentText}
                sequence={[currentText]}
                wrapper="h1"
                speed={50}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.2] tracking-[-0.02em] whitespace-pre-line max-w-[1000px]"
                cursor={true}
              />
            )}
          </div>

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSubmit}
            className="w-full max-w-3xl mx-auto space-y-4 mt-12"
          >
            <div className="relative flex items-center gap-3">
              <div className="relative flex-1">
                <div className="absolute left-5 top-1/2 -translate-y-1/2">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                
                <Input
                  type="text"
                  placeholder="Digite sua necessidade..."
                  className={cn(
                    "w-full h-[64px] pl-14 pr-14 text-lg rounded-xl",
                    "bg-white border-gray-200",
                    "text-gray-900 placeholder:text-gray-400",
                    "focus:ring-2 focus:ring-red-500/20 focus:border-red-500",
                    "shadow-sm hover:shadow-md transition-all duration-200"
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isSearching}
                />

                {isSupported && (
                  <Button
                    type="button"
                    onClick={handleVoiceClick}
                    className={cn(
                      "absolute right-4 top-1/2 -translate-y-1/2",
                      "h-11 w-11 p-0",
                      "bg-transparent hover:bg-gray-100",
                      isRecording ? "text-red-500" : "text-gray-400",
                      "transition-colors duration-200"
                    )}
                    disabled={isSearching}
                  >
                    {isRecording ? (
                      <MicOff className="w-6 h-6" />
                    ) : (
                      <Mic className="w-6 h-6" />
                    )}
                  </Button>
                )}
              </div>

              <Button 
                type="submit"
                className={cn(
                  "h-[64px] px-10 rounded-xl",
                  "bg-red-600 hover:bg-red-700",
                  "text-white text-lg font-medium",
                  "shadow-sm hover:shadow-md transition-all duration-200"
                )}
                disabled={isSearching || isGPTProcessing || isDeepSeekProcessing}
              >
                {isSearching || isGPTProcessing || isDeepSeekProcessing ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  "Enviar"
                )}
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Mic className="w-4 h-4" />
              <span className="text-sm">
                Digite ou mande um áudio do equipamento que precisa ou tipo de obra que está fazendo
              </span>
            </div>
          </motion.form>

          {/* Logos em Destaque */}
          {systemSettings?.featured_logos_enabled && systemSettings?.featured_logos && systemSettings.featured_logos.length > 0 && (
            <div className="mt-16 w-full">
              <div className="text-center mb-8">
                <h3 className="text-xl font-medium text-gray-600">
                  As melhores marcas mundiais, você aluga na Mariloc
                </h3>
              </div>
              <div>
                <BrandsCarousel logos={systemSettings.featured_logos} />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
