import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Package, Calendar, MapPin, Clock, User, Mail, Phone, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { useToast } from '../hooks/use-toast';

interface ReturnRequest {
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
      phone: string;
    };
    rentalPeriod: string;
    startDate: string;
  };
  returnMethod: 'store' | 'pickup';
  returnAddress: string | null;
  requestedDate: string;
  completedDate: string | null;
  status: 'pending' | 'approved' | 'completed';
  observations: string | null;
}

export function RentalReturn() {
  const { id } = useParams();
  const { toast } = useToast();
  const [returnRequest, setReturnRequest] = useState<ReturnRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadReturnRequest();
  }, [id]);

  const loadReturnRequest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: returnData, error: returnError } = await supabase
        .from('returns')
        .select(`
          *,
          rental:rentals(
            id,
            rental_period,
            start_date,
            machine:machines(
              id,
              name,
              main_image_url
            ),
            client:profiles!rentals_client_id_fkey(
              id,
              name,
              email,
              phone
            )
          )
        `)
        .eq('rental_id', id)
        .single();

      if (returnError) throw returnError;
      if (!returnData) throw new Error('Solicitação de devolução não encontrada');

      setReturnRequest({
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
            email: returnData.rental.client.email,
            phone: returnData.rental.client.phone || 'Não informado'
          },
          rentalPeriod: returnData.rental.rental_period,
          startDate: returnData.rental.start_date
        },
        returnMethod: returnData.return_method,
        returnAddress: returnData.return_address,
        requestedDate: returnData.requested_date,
        completedDate: returnData.completed_date,
        status: returnData.status,
        observations: returnData.observations
      });
    } catch (err) {
      console.error('Error loading return request:', err);
      setError('Erro ao carregar solicitação de devolução');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReturn = async () => {
    if (!returnRequest) return;
    setProcessing(true);

    try {
      const { error: updateError } = await supabase
        .from('returns')
        .update({
          status: 'approved'
        })
        .eq('id', returnRequest.id);

      if (updateError) throw updateError;

      loadReturnRequest();
      toast({
        variant: 'success',
        title: 'Devolução Aprovada',
        description: 'A devolução foi aprovada com sucesso!'
      });
    } catch (err) {
      console.error('Error approving return:', err);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao aprovar devolução. Por favor, tente novamente.'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCompleteReturn = async () => {
    if (!returnRequest) return;
    setProcessing(true);

    try {
      // Atualizar status da devolução
      const { error: returnError } = await supabase
        .from('returns')
        .update({
          status: 'completed',
          completed_date: new Date().toISOString()
        })
        .eq('id', returnRequest.id);

      if (returnError) throw returnError;

      // Atualizar status do aluguel
      const { error: rentalError } = await supabase
        .from('rentals')
        .update({
          status: 'completed',
          end_date: new Date().toISOString()
        })
        .eq('id', returnRequest.rental.id);

      if (rentalError) throw rentalError;

      loadReturnRequest();
      toast({
        variant: 'success',
        title: 'Devolução Finalizada',
        description: 'A devolução foi finalizada com sucesso!'
      });
    } catch (err) {
      console.error('Error completing return:', err);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao finalizar devolução. Por favor, tente novamente.'
      });
    } finally {
      setProcessing(false);
    }
  };

  const breadcrumbs = [
    { label: 'Painel', path: '/landlord-dashboard' },
    { label: 'Aluguéis Ativos', path: '/rentals' },
    { label: 'Devolução' }
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

  if (error || !returnRequest) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-text mb-4">{error || 'Solicitação não encontrada'}</p>
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
        title="Devolução de Equipamento"
        breadcrumbs={breadcrumbs}
      />
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Return Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-secondary rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-text mb-6">
                  Equipamento
                </h2>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-48 h-48 bg-white dark:bg-gray-700 rounded-lg p-4 flex-shrink-0">
                    {returnRequest.rental.machine.mainImageUrl ? (
                      <img
                        src={returnRequest.rental.machine.mainImageUrl}
                        alt={returnRequest.rental.machine.name}
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
                      {returnRequest.rental.machine.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Período de Locação
                        </h4>
                        <p className="text-text">{returnRequest.rental.rentalPeriod}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Data de Início
                        </h4>
                        <p className="text-text">
                          {new Date(returnRequest.rental.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-secondary rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-text mb-6">
                  Detalhes da Devolução
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Método de Devolução
                    </h4>
                    <p className="text-text">
                      {returnRequest.returnMethod === 'store'
                        ? 'Devolução na Loja'
                        : 'Solicitar Retirada'}
                    </p>
                  </div>
                  {returnRequest.returnAddress && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Endereço para Retirada
                      </h4>
                      <p className="text-text">{returnRequest.returnAddress}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Data da Solicitação
                    </h4>
                    <p className="text-text">
                      {new Date(returnRequest.requestedDate).toLocaleDateString()}
                    </p>
                  </div>
                  {returnRequest.completedDate && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Data de Conclusão
                      </h4>
                      <p className="text-text">
                        {new Date(returnRequest.completedDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Status and Actions */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-secondary rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-text mb-6">
                  Status da Devolução
                </h2>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-6">
                  <span className="font-medium text-text">Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      returnRequest.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : returnRequest.status === 'approved'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {returnRequest.status === 'pending'
                      ? 'Pendente'
                      : returnRequest.status === 'approved'
                      ? 'Aprovado'
                      : 'Concluído'}
                  </span>
                </div>

                {returnRequest.status === 'pending' && (
                  <button
                    onClick={handleApproveReturn}
                    disabled={processing}
                    className="w-full flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Aprovar Devolução
                  </button>
                )}

                {returnRequest.status === 'approved' && (
                  <button
                    onClick={handleCompleteReturn}
                    disabled={processing}
                    className="w-full flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Finalizar Devolução
                  </button>
                )}
              </div>

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
                        {returnRequest.rental.client.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-text">E-mail</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {returnRequest.rental.client.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-text">Telefone</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {returnRequest.rental.client.phone}
                      </p>
                    </div>
                  </div>
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