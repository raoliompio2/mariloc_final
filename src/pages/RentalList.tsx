import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { RentalCard } from '../components/rentals/RentalCard';
import { FilterBar } from '../components/common/FilterBar';
import { ConfirmationModal } from '../components/modals/ConfirmationModal';
import type { Rental } from '../types/rental';
import { useToast } from '../hooks/use-toast';

const filterOptions = [
  {
    name: 'status',
    label: 'Status',
    options: [
      { label: 'Aguardando Aprovação', value: 'pending' },
      { label: 'Ativos', value: 'active' },
      { label: 'Concluídos', value: 'completed' },
      { label: 'Cancelados', value: 'cancelled' }
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
  },
  {
    name: 'delivery',
    label: 'Entrega',
    options: [
      { label: 'Pendente', value: 'pending' },
      { label: 'Agendada', value: 'scheduled' },
      { label: 'Realizada', value: 'completed' }
    ]
  }
];

export function RentalList() {
  const { toast } = useToast();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [filteredRentals, setFilteredRentals] = useState<Rental[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: 'approve' | 'reject';
    rentalId: string;
  }>({
    isOpen: false,
    action: 'approve',
    rentalId: ''
  });

  useEffect(() => {
    loadRentals();
  }, []);

  const loadRentals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data: rentalsData, error: rentalsError } = await supabase
        .from('rentals')
        .select(`
          id,
          rental_period,
          delivery_address,
          start_date,
          end_date,
          status,
          price,
          created_at,
          machine:machines(
            id,
            name,
            main_image_url
          ),
          client:profiles!rentals_client_id_fkey(
            id,
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (rentalsError) throw rentalsError;

      const transformedRentals = (rentalsData || [])
        .filter(rental => rental && rental.machine && rental.client)
        .map(rental => ({
          id: rental.id,
          machine: {
            id: rental.machine.id,
            name: rental.machine.name,
            mainImageUrl: rental.machine.main_image_url
          },
          client: {
            id: rental.client.id,
            name: rental.client.name || rental.client.email,
            email: rental.client.email
          },
          rentalPeriod: rental.rental_period,
          deliveryAddress: rental.delivery_address,
          startDate: rental.start_date,
          endDate: rental.end_date,
          status: rental.status,
          price: rental.price || 0,
          createdAt: rental.created_at
        }));

      setRentals(transformedRentals);
      setFilteredRentals(transformedRentals);
      setError('');
    } catch (err) {
      console.error('Error loading rentals:', err);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Erro ao carregar aluguéis'
      });
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
    let filtered = [...rentals];

    // Aplicar filtro de pesquisa
    if (query) {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter(rental =>
        rental.machine.name.toLowerCase().includes(searchLower) ||
        rental.client.name.toLowerCase().includes(searchLower) ||
        rental.deliveryAddress.toLowerCase().includes(searchLower)
      );
    }

    // Aplicar filtros de status
    if (filters.status?.length > 0) {
      filtered = filtered.filter(rental => filters.status.includes(rental.status));
    }

    // Aplicar filtros de período
    if (filters.period?.length > 0) {
      const now = new Date();
      filtered = filtered.filter(rental => {
        const rentalDate = new Date(rental.createdAt);
        const diffDays = Math.floor((now.getTime() - rentalDate.getTime()) / (1000 * 60 * 60 * 24));

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

    // Aplicar filtros de entrega
    if (filters.delivery?.length > 0) {
      filtered = filtered.filter(rental => {
        if (filters.delivery.includes('pending') && !rental.startDate) return true;
        if (filters.delivery.includes('scheduled') && rental.startDate && !rental.endDate) return true;
        if (filters.delivery.includes('completed') && rental.endDate) return true;
        return false;
      });
    }

    setFilteredRentals(filtered);
  };

  const handleApproveRental = async (rentalId: string) => {
    setConfirmModal({
      isOpen: true,
      action: 'approve',
      rentalId
    });
  };

  const handleRejectRental = async (rentalId: string) => {
    setConfirmModal({
      isOpen: true,
      action: 'reject',
      rentalId
    });
  };

  const handleConfirmAction = async () => {
    const { action, rentalId } = confirmModal;
    
    try {
      // First check if rental exists and is still pending
      const { data: rental, error: checkError } = await supabase
        .from('rentals')
        .select('status')
        .eq('id', rentalId)
        .single();

      if (checkError) throw checkError;
      if (!rental) throw new Error('Locação não encontrada');
      if (rental.status !== 'pending') {
        throw new Error('Esta locação não está mais pendente');
      }

      // Then update the rental
      const { error: updateError } = await supabase
        .from('rentals')
        .update(action === 'approve' ? {
          status: 'active',
          start_date: new Date().toISOString()
        } : {
          status: 'cancelled'
        })
        .eq('id', rentalId);

      if (updateError) throw updateError;
      
      await loadRentals();
      toast({
        variant: 'success',
        title: action === 'approve' ? 'Locação Aprovada' : 'Locação Rejeitada',
        description: action === 'approve' 
          ? 'A locação foi aprovada com sucesso!'
          : 'A locação foi rejeitada com sucesso!'
      });
    } catch (err) {
      console.error(`Error ${action}ing rental:`, err);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err instanceof Error 
          ? err.message 
          : `Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} locação. Por favor, tente novamente.`
      });
    }
  };

  const breadcrumbs = [
    { label: 'Painel', path: '/landlord/dashboard' },
    { label: 'Aluguéis' }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <AdminPageHeader
        title="Aluguéis"
        breadcrumbs={breadcrumbs}
      />
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-secondary rounded-xl shadow-lg p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
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
                <p className="mt-4 text-text">Carregando aluguéis...</p>
              </div>
            ) : filteredRentals.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-text">Nenhum aluguel encontrado.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredRentals.map((rental) => (
                  <RentalCard
                    key={rental.id}
                    rental={rental}
                    onApprove={handleApproveRental}
                    onReject={handleRejectRental}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        title={confirmModal.action === 'approve' ? 'Aprovar Locação' : 'Rejeitar Locação'}
        description={confirmModal.action === 'approve' 
          ? 'Tem certeza que deseja aprovar esta locação? Esta ação não pode ser desfeita.'
          : 'Tem certeza que deseja rejeitar esta locação? Esta ação não pode ser desfeita.'
        }
        confirmText={confirmModal.action === 'approve' ? 'Aprovar' : 'Rejeitar'}
        variant={confirmModal.action === 'approve' ? 'default' : 'destructive'}
      />
    </div>
  );
}