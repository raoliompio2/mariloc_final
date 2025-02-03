import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { QuoteCard } from '../components/quotes/QuoteCard';
import { FilterBar } from '../components/common/FilterBar';
import { handleSupabaseError } from '../lib/supabase';
import type { Quote } from '../types/quote';

const filterOptions = [
  {
    name: 'status',
    label: 'Status',
    options: [
      { label: 'Aguardando Resposta', value: 'pending' },
      { label: 'Respondidos', value: 'answered' },
      { label: 'Rejeitados', value: 'rejected' },
      { label: 'Aprovados', value: 'approved' }
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

export function ClientQuotes() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Usuário não autenticado');
        return;
      }

      const { data, error } = await supabase
        .from('quotes')
        .select(`
          id,
          machine_id,
          client_id,
          landlord_id,
          rental_period,
          delivery_address,
          observations,
          status,
          response,
          response_price,
          created_at,
          machine:machines!quotes_machine_id_fkey (
            id,
            name,
            main_image_url
          ),
          client:profiles!quotes_client_id_fkey (
            id,
            name,
            email
          ),
          quote_accessories (
            accessory:accessories (
              id,
              name,
              price
            )
          )
        `)
        .eq('client_id', user?.id)
        .in('status', ['pending', 'answered', 'rejected', 'approved'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro na query:', error);
        throw error;
      }

      const transformedQuotes = data.map(quote => ({
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
        landlordId: quote.landlord_id,
        rentalPeriod: quote.rental_period,
        deliveryAddress: quote.delivery_address,
        observations: quote.observations,
        status: quote.status,
        response: quote.response,
        responsePrice: quote.response_price,
        createdAt: quote.created_at,
        accessories: quote.quote_accessories?.map((qa: any) => ({
          id: qa.accessory.id,
          name: qa.accessory.name,
          price: qa.accessory.price
        })) || []
      }));

      setQuotes(transformedQuotes);
      setFilteredQuotes(transformedQuotes);
      setError('');
    } catch (err) {
      console.error('Error loading quotes:', err);
      setError(handleSupabaseError(err));
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

    // Ordenar por prioridade: respondidos primeiro (que precisam de aprovação), depois por data mais recente
    filtered.sort((a, b) => {
      // Se um está respondido e outro não, o respondido vem primeiro
      if (a.status === 'answered' && b.status !== 'answered') return -1;
      if (a.status !== 'answered' && b.status === 'answered') return 1;
      
      // Se ambos têm o mesmo status, ordena por data mais recente
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredQuotes(filtered);
  };

  const handleApproveQuote = async (quote: Quote) => {
    if (quote.status !== 'answered') {
      alert('Este orçamento ainda não foi respondido pelo proprietário');
      return;
    }
    if (!quote.responsePrice) {
      alert('Este orçamento não possui um valor definido');
      return;
    }

    try {
      // Create rental with pending status
      const { data: rental, error: rentalError } = await supabase
        .from('rentals')
        .insert([{
          machine_id: quote.machine.id,
          client_id: quote.client.id,
          landlord_id: quote.landlordId,
          rental_period: quote.rentalPeriod,
          delivery_address: quote.deliveryAddress,
          status: 'pending',
          price: quote.responsePrice
        }])
        .select()
        .single();

      if (rentalError) throw rentalError;
      if (!rental) throw new Error('Erro ao criar aluguel');

      // Add accessories if any
      if (quote.accessories && quote.accessories.length > 0) {
        const accessoryRelations = quote.accessories.map(accessory => ({
          rental_id: rental.id,
          accessory_id: accessory.id
        }));

        const { error: accessoryError } = await supabase
          .from('rental_accessories')
          .insert(accessoryRelations);

        if (accessoryError) throw accessoryError;
      }

      // Update quote status to approved
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', quote.id);

      if (quoteError) throw quoteError;

      // Atualiza a lista local
      const updatedQuotes = quotes.map(q =>
        q.id === quote.id
          ? { ...q, status: 'approved', approvedAt: new Date().toISOString() }
          : q
      );
      setQuotes(updatedQuotes);
      applyFilters(searchQuery, activeFilters);

      // Redireciona para a página de aluguéis
      navigate('/client-rentals');
      alert('Orçamento aprovado com sucesso! Você será redirecionado para seus aluguéis.');

    } catch (err) {
      console.error('Error approving quote:', err);
      alert('Erro ao aprovar orçamento. Por favor, tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <AdminPageHeader
          title="Minhas Cotações"
          breadcrumbs={[
            { label: 'Painel', path: '/client-dashboard' },
            { label: 'Minhas Cotações' }
          ]}
        />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-secondary rounded-xl shadow-lg p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-between items-start mb-8">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Meus Orçamentos
                </h1>
                <FilterBar
                  onSearch={handleSearch}
                  onFilterChange={handleFilterChange}
                  filterOptions={filterOptions}
                  placeholder="Pesquisar por máquina ou endereço..."
                />
              </div>
            </div>

            {/* Quotes List */}
            {loading ? (
              <LoadingSpinner text="Carregando cotações..." />
            ) : filteredQuotes.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Nenhuma cotação encontrada"
                description={searchQuery ? 'Tente ajustar sua busca.' : 'Que tal solicitar um orçamento?'}
                action={
                  <a
                    href="/aluguel-de-equipamentos"
                    className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    <Package className="h-5 w-5 mr-2" />
                    Ver Catálogo
                  </a>
                }
              />
            ) : (
              <div className="space-y-6">
                {filteredQuotes.map((quote) => (
                  <QuoteCard
                    key={quote.id}
                    quote={quote}
                    onApprove={handleApproveQuote}
                    showClientActions={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ClientQuotes;