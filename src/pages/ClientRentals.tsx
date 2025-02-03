import React, { useState, useEffect } from 'react';
import { RentalCard } from '../components/rentals/RentalCard';
import { FilterBar } from '../components/common/FilterBar';
import type { Rental } from '../types/rental';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { supabase } from '../lib/supabase';
import { AdminPageHeader } from '../components/AdminPageHeader';

const filterOptions = [
  {
    name: 'status',
    label: 'Status',
    options: [
      { label: 'Em Aprovação', value: 'pending' },
      { label: 'Em Andamento', value: 'active' },
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
      { label: 'Aguardando', value: 'pending' },
      { label: 'Agendada', value: 'scheduled' },
      { label: 'Realizada', value: 'completed' }
    ]
  }
];

interface Rental {
  id: string;
  machine: {
    id: string;
    name: string;
    mainImageUrl: string;
  };
  client: {
    id: string;
    name: string;
    email: string;
  };
  rentalPeriod: string;
  deliveryAddress: string;
  startDate: string | null;
  endDate: string | null;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  price: number;
  createdAt: string;
}

export function ClientRentals() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [filteredRentals, setFilteredRentals] = useState<Rental[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRentals = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const { data: rentalsData, error } = await supabase
          .from('rentals')
          .select(`
            *,
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
          .eq('client_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const transformedRentals = rentalsData.map(rental => ({
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
          price: rental.price,
          createdAt: rental.created_at
        }));

        setRentals(transformedRentals);
        setFilteredRentals(transformedRentals);
      } catch (err) {
        console.error('Error loading rentals:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRentals();
  }, []);

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

  const breadcrumbs = [
    { label: 'Painel', path: '/client-dashboard' },
    { label: 'Meus Aluguéis' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <AdminPageHeader
          title="Meus Aluguéis"
          breadcrumbs={breadcrumbs}
        />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-secondary rounded-xl shadow-lg p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Meus Aluguéis
              </h1>
              <FilterBar
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                filterOptions={filterOptions}
                placeholder="Pesquisar por máquina ou endereço..."
              />
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto"></div>
                <p className="mt-4 text-text">Carregando aluguéis...</p>
              </div>
            ) : filteredRentals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhum aluguel encontrado com os filtros selecionados.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredRentals.map(rental => (
                  <RentalCard
                    key={rental.id}
                    rental={rental}
                    onApprove={() => {}}
                    onReject={() => {}}
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

export default ClientRentals;