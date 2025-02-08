import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MessageSquare } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { supabase } from '../lib/supabase';
import type { Machine, Accessory } from '../types/machine';
import { useSystemSettings } from '../hooks/useSystemSettings';
import { MobileQuoteBlock } from '../components/product/MobileQuoteBlock';

export function ProductDetail() {
  const { slug } = useParams();
  const { settings } = useSystemSettings();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showMobileQuote, setShowMobileQuote] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show on scroll up or when near bottom
      const isScrollingUp = currentScrollY < lastScrollY;
      const isNearBottom = 
        window.innerHeight + window.scrollY >= 
        document.documentElement.scrollHeight - 100;

      setShowMobileQuote(isScrollingUp || isNearBottom);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  console.log('URL params:', { slug });

  useEffect(() => {
    if (slug) {
      // Decodifica o slug e converte para o formato do nome
      const productName = decodeURIComponent(slug)
        .replace(/-/g, ' ')
        .replace(/\s+/g, ' ')  // Remove múltiplos espaços
        .trim();               // Remove espaços no início e fim
      
      console.log('Nome do produto após processamento:', productName);
      loadMachineByName(productName);
    } else {
      setError('Nome do produto não encontrado na URL');
      setLoading(false);
    }
  }, [slug]);

  const loadMachineByName = async (productName: string) => {
    try {
      console.log('Buscando máquina com nome:', productName);
      
      // Load machine details usando o nome exato primeiro
      let { data: machineData, error: machineError } = await supabase
        .from('machines')
        .select(`
          *,
          category:categories!machines_category_id_fkey(*),
          secondary_category:categories!machines_secondary_category_id_fkey(*),
          technical_data(*)
        `)
        .eq('name', productName);

      if (machineError) {
        console.error('Erro ao buscar máquina:', machineError);
        setError('Erro ao carregar os detalhes da máquina');
        setLoading(false);
        return;
      }

      // Se não encontrar com nome exato, tenta com ILIKE
      if (!machineData || machineData.length === 0) {
        console.log('Tentando busca aproximada para:', productName);
        
        const { data: fuzzyData, error: fuzzyError } = await supabase
          .from('machines')
          .select(`
            *,
            category:categories!machines_category_id_fkey(*),
            secondary_category:categories!machines_secondary_category_id_fkey(*),
            technical_data(*)
          `)
          .ilike('name', `%${productName}%`)
          .limit(1);

        if (fuzzyError) {
          console.error('Erro na busca aproximada:', fuzzyError);
          setError('Erro ao carregar os detalhes da máquina');
          setLoading(false);
          return;
        }

        if (!fuzzyData || fuzzyData.length === 0) {
          setError('Máquina não encontrada');
          setLoading(false);
          return;
        }

        machineData = fuzzyData;
      }

      const machineRecord = machineData[0];

      // Transform technical data correctly
      const technicalData = machineRecord.technical_data?.map(data => ({
        id: data.id,
        machineId: data.machine_id,
        label: data.label,
        value: data.value,
        isHighlight: data.is_highlight,
        createdAt: data.created_at
      }));

      // Transform machine data
      const transformedMachine: Machine = {
        id: machineRecord.id,
        name: machineRecord.name,
        description: machineRecord.description,
        mainImageUrl: machineRecord.main_image_url,
        categoryId: machineRecord.category_id,
        secondaryCategoryId: machineRecord.secondary_category_id,
        ownerId: machineRecord.owner_id,
        createdAt: machineRecord.created_at,
        technical_data: technicalData
      };

      console.log('Dados da máquina transformados:', transformedMachine);
      setMachine(transformedMachine);

      // Load accessories
      const { data: accessoryData, error: accessoryError } = await supabase
        .from('accessory_machines')
        .select(`
          accessory:accessories(
            id,
            name,
            description,
            main_image_url,
            price
          )
        `)
        .eq('machine_id', machineRecord.id);

      if (accessoryError) {
        console.error('Erro ao carregar acessórios:', accessoryError);
      } else {
        const accessories = accessoryData
          .map(item => item.accessory)
          .filter(Boolean)
          .map(accessory => ({
            id: accessory.id,
            name: accessory.name,
            description: accessory.description,
            mainImageUrl: accessory.main_image_url,
            price: accessory.price
          }));

        console.log('Acessórios carregados:', accessories);
        setAccessories(accessories);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar os detalhes da máquina');
    } finally {
      setLoading(false);
    }
  };

  const handleAccessoryToggle = (accessoryId: string) => {
    setSelectedAccessories(prev => 
      prev.includes(accessoryId)
        ? prev.filter(id => id !== accessoryId)
        : [...prev, accessoryId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text mb-4">{error}</h1>
            <Link to="/" className="text-primary hover:underline">
              Voltar para o início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text mb-4">Máquina não encontrada</h1>
            <Link to="/" className="text-primary hover:underline">
              Voltar para o início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const highlightData = machine.technical_data?.filter(data => data.isHighlight) || [];
  const otherData = machine.technical_data?.filter(data => !data.isHighlight) || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{`${machine.name} - Aluguel de Equipamentos`}</title>
        <meta name="description" content={machine.description} />
      </Helmet>

      <Navbar />

      <div className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Breadcrumbs */}
          <nav className="flex text-sm mb-6 sm:mb-8">
            <ol className="flex items-center space-x-2">
              <li>
                <Link to="/" className="text-gray-500 hover:text-primary transition-colors duration-200">
                  Início
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                {machine.category && (
                  <>
                    <Link 
                      to={`/catalogo-de-produtos/${machine.category.slug || ''}`} 
                      className="text-gray-500 hover:text-primary transition-colors duration-200"
                    >
                      {machine.category.name}
                    </Link>
                  </>
                )}
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <span className="text-primary font-medium">{machine.name}</span>
              </li>
            </ol>
          </nav>

          {/* Product Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column */}
            <div className="space-y-6 sm:space-y-8">
              {/* Main Image */}
              <div className="bg-white dark:bg-secondary rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700">
                {machine.mainImageUrl ? (
                  <img
                    src={machine.mainImageUrl}
                    alt={machine.name}
                    className="w-full h-[400px] object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="w-full h-[400px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="text-gray-400">Sem imagem</span>
                  </div>
                )}
              </div>

              {/* Technical Data */}
              <div className="bg-white dark:bg-secondary rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-text mb-6 pb-2 border-b border-gray-300 dark:border-gray-600">
                  Dados Técnicos
                </h2>
                
                {/* Highlight Data */}
                {highlightData.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-text mb-4">Dados em Destaque</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {highlightData.map((data, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-200 dark:border-gray-700"
                        >
                          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            {data.label}
                          </div>
                          <div className="font-medium text-text">
                            {data.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Technical Data */}
                {otherData.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-text mb-4">Outros Dados Técnicos</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {otherData.map((data, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-200 dark:border-gray-700"
                        >
                          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            {data.label}
                          </div>
                          <div className="font-medium text-text">
                            {data.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-white dark:bg-secondary rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-text mb-4 pb-2 border-b border-gray-300 dark:border-gray-600">
                  Descrição
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-justify tracking-normal whitespace-pre-line">
                    {machine.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Sticky */}
            <div className="lg:sticky lg:top-36 space-y-6 sm:space-y-8 h-fit">
              <div className="bg-white dark:bg-secondary rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-700">
                {/* Product Name */}
                <h1 className="text-2xl sm:text-3xl font-bold text-text mb-6 pb-2 border-b border-gray-300 dark:border-gray-600">
                  {machine.name}
                </h1>

                {/* Category */}
                <div className="mb-6">
                  <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    Categoria
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {machine.category && (
                      <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
                        {machine.category.name}
                      </span>
                    )}
                    {machine.secondary_category && (
                      <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
                        {machine.secondary_category.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Highlight Technical Data */}
                {highlightData.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                      Especificações Técnicas
                    </h2>
                    <div className="space-y-3">
                      {highlightData.map((data, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                          <span className="text-text">{data.label}</span>
                          <span className="font-medium text-text">{data.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quote Button - Desktop Only */}
                <div className="mt-8 hidden lg:block">
                  <Link
                    to={`/quote/request/${slug}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-green-600 text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 shadow-sm"
                  >
                    <MessageSquare className="h-5 w-5" />
                    Solicitar Orçamento via WhatsApp
                  </Link>
                </div>

                {/* Accessories */}
                {accessories.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-text mb-4">
                      Acessórios Disponíveis
                    </h3>
                    <div className="space-y-3">
                      {accessories.map((accessory) => (
                        <label
                          key={accessory.id}
                          className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-200 dark:border-gray-700"
                        >
                          <input
                            type="checkbox"
                            checked={selectedAccessories.includes(accessory.id)}
                            onChange={() => handleAccessoryToggle(accessory.id)}
                            className="mt-1.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <div className="flex-1">
                            <div className="flex gap-4">
                              {accessory.mainImageUrl && (
                                <img
                                  src={accessory.mainImageUrl}
                                  alt={accessory.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              )}
                              <div>
                                <h4 className="font-medium text-text">
                                  {accessory.name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                                  {accessory.description}
                                </p>
                                <p className="text-sm font-medium text-primary mt-2">
                                  R$ {accessory.price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Quote Block */}
      <MobileQuoteBlock slug={slug} isVisible={showMobileQuote} />
    </div>
  );
}