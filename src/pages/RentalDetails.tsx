import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Package, Calendar, MapPin, Clock, User, Mail, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AdminPageHeader } from '../components/AdminPageHeader';

interface RentalDetails {
  id: string;
  machine: {
    id: string;
    name: string;
    mainImageUrl: string;
    description: string;
  };
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  rentalPeriod: string;
  deliveryAddress: string;
  startDate: string;
  endDate: string | null;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  accessories: {
    id: string;
    name: string;
    price: number;
  }[];
}

export function RentalDetails() {
  const { id } = useParams();
  const [rental, setRental] = useState<RentalDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRentalDetails();
  }, [id]);

  const loadRentalDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: rentalData, error: rentalError } = await supabase
        .from('rentals')
        .select(`
          *,
          machine:machines(
            id,
            name,
            main_image_url,
            description
          ),
          client:profiles!rentals_client_id_fkey(
            id,
            name,
            email,
            phone
          ),
          rental_accessories(
            accessory:accessories(
              id,
              name,
              price
            )
          )
        `)
        .eq('id', id)
        .single();

      if (rentalError) throw rentalError;
      if (!rentalData) throw new Error('Aluguel não encontrado');

      setRental({
        id: rentalData.id,
        machine: {
          id: rentalData.machine.id,
          name: rentalData.machine.name,
          mainImageUrl: rentalData.machine.main_image_url,
          description: rentalData.machine.description
        },
        client: {
          id: rentalData.client.id,
          name: rentalData.client.name || rentalData.client.email,
          email: rentalData.client.email,
          phone: rentalData.client.phone || 'Não informado'
        },
        rentalPeriod: rentalData.rental_period,
        deliveryAddress: rentalData.delivery_address,
        startDate: rentalData.start_date,
        endDate: rentalData.end_date,
        status: rentalData.status,
        createdAt: rentalData.created_at,
        accessories: rentalData.rental_accessories?.map((ra: any) => ({
          id: ra.accessory.id,
          name: ra.accessory.name,
          price: ra.accessory.price
        })) || []
      });
    } catch (err) {
      console.error('Error loading rental details:', err);
      setError('Erro ao carregar detalhes do aluguel');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = [
    { label: 'Painel', path: '/landlord-dashboard' },
    { label: 'Aluguéis Ativos', path: '/rentals' },
    { label: 'Detalhes do Aluguel' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !rental) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-text mb-4">{error || 'Aluguel não encontrado'}</p>
            <a
              href="/rentals"
              className="text-primary hover:underline"
            >
              Voltar para Aluguéis
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <AdminPageHeader
        title="Detalhes do Aluguel"
        breadcrumbs={breadcrumbs}
      />
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Machine Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-secondary rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-text mb-6">
                  Equipamento
                </h2>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-48 h-48 bg-white dark:bg-gray-700 rounded-lg p-4 flex-shrink-0">
                    {rental.machine.mainImageUrl ? (
                      <img
                        src={rental.machine.mainImageUrl}
                        alt={rental.machine.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text mb-2">
                      {rental.machine.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {rental.machine.description}
                    </p>
                  </div>
                </div>
              </div>

              {rental.accessories.length > 0 && (
                <div className="bg-white dark:bg-secondary rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-text mb-6">
                    Acessórios
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rental.accessories.map((accessory) => (
                      <div
                        key={accessory.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <span className="text-text">{accessory.name}</span>
                        <span className="text-primary font-medium">
                          R$ {accessory.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-secondary rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-text mb-6">
                  Detalhes da Locação
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-text">Período</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {rental.rentalPeriod}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-text">Endereço de Entrega</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {rental.deliveryAddress}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-text">Data de Início</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {new Date(rental.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Client Details */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-secondary rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-text mb-6">
                  Dados do Cliente
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-text">Nome</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {rental.client.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-text">E-mail</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {rental.client.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-text">Telefone</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {rental.client.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-secondary rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-text mb-6">
                  Status do Aluguel
                </h2>
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-green-700 dark:text-green-300 font-medium">
                    Ativo
                  </span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 rounded-full text-sm">
                    Em Andamento
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}