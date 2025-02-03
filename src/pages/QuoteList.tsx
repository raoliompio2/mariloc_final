import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { QuoteCard } from '../components/quotes/QuoteCard';
import { FilterBar } from '../components/common/FilterBar';
import { supabase } from '../lib/supabase';
import type { Quote } from '../types/quote';

const filterOptions = [
  {
    name: 'status',
    label: 'Status',
    options: [
      { label: 'Pendentes', value: 'pending' },
      { label: 'Respondidos', value: 'answered' },
      { label: 'Rejeitados', value: 'rejected' }
    ]
  },
  {
    name: 'period',
    label: 'Período',
    options: [
      { label: 'Últimos 7 dias', value: '7d' },
      { label: 'Últimos 30 dias', value: '30d' },
      { label: 'Últimos 90 dias', value: '90d' }
    ]
  }
];

export function QuoteList() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: quotesData, error } = await supabase
        .from('quotes')
        .select(`
          *,
          machine:machines(
            id,
            name,
            main_image_url
          ),
          client:profiles!quotes_client_id_fkey(
            id,
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedQuotes = quotesData.map(quote => ({
        id: quote.id,
        machine: {
          id: quote.machine.id,
          name: quote.machine.name,
          mainImageUrl: quote.machine.main_image_url
        },
        client: {
          id: quote.client.id,
          name: quote.client.name || quote.client.email,
          email: quote.client.email
        },
        rentalPeriod: quote.rental_period,
        deliveryAddress: quote.delivery_address,
        status: quote.status,
        responsePrice: quote.response_price,
        response: quote.response,
        createdAt: quote.created_at
      }));

      setQuotes(transformedQuotes);
      setFilteredQuotes(transformedQuotes);
      setError('');
    } catch (err) {
      console.error('Error loading quotes:', err);
      setError('Erro ao carregar orçamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, activeFilters);
  };

  const handleFilterChange = (filters: Record<string, string[]>) => {
    setActiveFilters(filters);
    applyFilters(searchQuery, filters);
  };

  const applyFilters = (query: string, filters: Record<string, string[]>) => {
    let filtered = [...quotes];

    // Aplicar filtro de pesquisa
    if (query) {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter(quote =>
        quote.machine.name.toLowerCase().includes(searchLower) ||
        quote.client.name.toLowerCase().includes(searchLower) ||
        quote.deliveryAddress.toLowerCase().includes(searchLower)
      );
    }

    // Aplicar filtros de status
    if (filters.status?.length > 0) {
      filtered = filtered.filter(quote => filters.status.includes(quote.status));
    }

    // Aplicar filtros de período
    if (filters.period?.length > 0) {
      const now = new Date();
      filtered = filtered.filter(quote => {
        const quoteDate = new Date(quote.createdAt);
        const diffDays = Math.floor((now.getTime() - quoteDate.getTime()) / (1000 * 60 * 60 * 24));

        return filters.period.some(period => {
          switch (period) {
            case '7d':
              return diffDays <= 7;
            case '30d':
              return diffDays <= 30;
            case '90d':
              return diffDays <= 90;
            default:
              return true;
          }
        });
      });
    }

    // Ordenar por prioridade: pendentes primeiro, depois por data mais recente
    filtered.sort((a, b) => {
      // Se um é pendente e outro não, o pendente vem primeiro
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      
      // Se ambos têm o mesmo status, ordena por data mais recente
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredQuotes(filtered);
  };

  const handleRespond = async (quoteId: string, response: string, price: number) => {
    try {
      const { error } = await supabase
        .from('quotes')
        .update({
          status: 'answered',
          response_price: price,
          response: response
        })
        .eq('id', quoteId);

      if (error) throw error;

      // Atualiza a lista local
      const updatedQuotes = quotes.map(quote =>
        quote.id === quoteId
          ? { ...quote, status: 'answered', responsePrice: price, response }
          : quote
      );
      setQuotes(updatedQuotes);
      applyFilters(searchQuery, activeFilters);

    } catch (err) {
      console.error('Error responding to quote:', err);
      alert('Erro ao responder orçamento');
    }
  };

  const handleReject = async (quoteId: string, response: string) => {
    try {
      const { error } = await supabase
        .from('quotes')
        .update({
          status: 'rejected',
          response: response
        })
        .eq('id', quoteId);

      if (error) throw error;

      // Atualiza a lista local
      const updatedQuotes = quotes.map(quote =>
        quote.id === quoteId
          ? { ...quote, status: 'rejected', response }
          : quote
      );
      setQuotes(updatedQuotes);
      applyFilters(searchQuery, activeFilters);

    } catch (err) {
      console.error('Error rejecting quote:', err);
      alert('Erro ao rejeitar orçamento');
    }
  };

  const breadcrumbs = [
    { label: 'Painel', path: '/landlord-dashboard' },
    { label: 'Orçamentos' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pb-8">
        <AdminPageHeader
          title="Orçamentos"
          breadcrumbs={breadcrumbs}
        />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-secondary rounded-xl shadow-lg p-8">
            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <FilterBar
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              filterOptions={filterOptions}
              placeholder="Pesquisar por máquina, cliente ou endereço..."
            />

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto"></div>
                <p className="mt-4 text-gray-500 dark:text-gray-400">Carregando orçamentos...</p>
              </div>
            ) : filteredQuotes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhum orçamento encontrado com os filtros selecionados.
                </p>
              </div>
            ) : (
              <div className="space-y-6 mt-6">
                {filteredQuotes.map(quote => (
                  <QuoteCard
                    key={quote.id}
                    quote={quote}
                    onRespond={handleRespond}
                    onReject={handleReject}
                    showLandlordActions={true}
                    showClientActions={false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}