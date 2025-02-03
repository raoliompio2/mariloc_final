import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Package, Search, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AdminPageHeader } from '../components/AdminPageHeader';

interface Return {
  id: string;
  rental: {
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
    startDate: string;
    endDate: string;
  };
  returnMethod: 'store' | 'pickup';
  returnAddress: string | null;
  requestedDate: string;
  completedDate: string;
  status: 'completed';
  observations: string | null;
}

export function CompletedReturns() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: returnsData, error } = await supabase
        .from('returns')
        .select(`
          *,
          rental:rentals(
            id,
            rental_period,
            start_date,
            end_date,
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
          )
        `)
        .eq('status', 'completed')
        .order('completed_date', { ascending: false });

      if (error) throw error;

      const transformedReturns = returnsData.map(returnData => ({
        id: returnData.id,
        rental: {
          id: returnData.rental.id,
          machine: {
            id: returnData.rental.machine.id,
            name: returnData.rental.machine.name,
            mainImageUrl: returnData.rental.machine.main_image_url
          },
          client: {
            id: returnData.rental.client.id,
            name: returnData.rental.client.name || returnData.rental.client.email,
            email: returnData.rental.client.email
          },
          rentalPeriod: returnData.rental.rental_period,
          startDate: returnData.rental.start_date,
          endDate: returnData.rental.end_date
        },
        returnMethod: returnData.return_method,
        returnAddress: returnData.return_address,
        requestedDate: returnData.requested_date,
        completedDate: returnData.completed_date,
        status: returnData.status,
        observations: returnData.observations
      }));

      setReturns(transformedReturns);
    } catch (err) {
      console.error('Error loading returns:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReturns = returns.filter(returnItem =>
    returnItem.rental.machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    returnItem.rental.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    returnItem.rental.client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const breadcrumbs = [
    { label: 'Painel', path: '/landlord-dashboard' },
    { label: 'Devoluções Finalizadas' }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <AdminPageHeader
        title="Devoluções Finalizadas"
        breadcrumbs={breadcrumbs}
      />
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-secondary rounded-xl shadow-lg p-8">
            {/* Search */}
            <div className="mb-8">
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar devoluções..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                />
              </div>
            </div>

            {/* Returns List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto"></div>
                <p className="mt-4 text-text">Carregando devoluções...</p>
              </div>
            ) : filteredReturns.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-text">Nenhuma devolução encontrada.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredReturns.map((returnItem) => (
                  <div
                    key={returnItem.id}
                    className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Machine Image */}
                      <div className="w-full md:w-48 h-48 bg-white dark:bg-gray-700 rounded-lg p-4 flex-shrink-0">
                        {returnItem.rental.machine.mainImageUrl ? (
                          <img
                            src={returnItem.rental.machine.mainImageUrl}
                            alt={returnItem.rental.machine.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Return Details */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-text mb-2">
                              {returnItem.rental.machine.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Cliente: {returnItem.rental.client.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              E-mail: {returnItem.rental.client.email}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              Finalizado
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Período de Locação
                            </h4>
                            <p className="text-text">{returnItem.rental.rentalPeriod}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Método de Devolução
                            </h4>
                            <p className="text-text">
                              {returnItem.returnMethod === 'store'
                                ? 'Devolução na Loja'
                                : 'Retirada no Local'}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Data de Início
                            </h4>
                            <p className="text-text">
                              {new Date(returnItem.rental.startDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Data de Devolução
                            </h4>
                            <p className="text-text">
                              {new Date(returnItem.completedDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <a
                            href={`/rentals/${returnItem.rental.id}/details`}
                            className="flex items-center px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}