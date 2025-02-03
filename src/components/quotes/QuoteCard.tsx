import React, { useState } from 'react';
import { Package, MapPin, Calendar, MessageSquare, DollarSign, User, Clock, X, Check } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { Timeline } from '../common/Timeline';

interface QuoteCardProps {
  quote: {
    id: string;
    machine: {
      name: string;
      mainImageUrl: string;
    };
    client: {
      name: string;
      email: string;
    };
    rentalPeriod: string;
    deliveryAddress: string;
    status: 'pending' | 'answered' | 'rejected';
    response?: string;
    responsePrice?: number;
    accessories?: {
      id: string;
      name: string;
      price: number;
    }[];
    createdAt: string;
    answeredAt?: string;
    rejectedAt?: string;
    approvedAt?: string;
    rentalApprovedAt?: string;
  };
  onRespond?: (quoteId: string, response: string, price: number) => void;
  onReject?: (quoteId: string, reason: string) => void;
  onApprove?: (quote: any) => void;
  showLandlordActions?: boolean;
  showClientActions?: boolean;
}

export function QuoteCard({
  quote,
  onRespond,
  onReject,
  onApprove,
  showLandlordActions = false,
  showClientActions = false,
}: QuoteCardProps) {
  const [price, setPrice] = useState<number>(0);
  const [response, setResponse] = useState<string>('');
  const [showResponseForm, setShowResponseForm] = useState(false);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { variant: 'warning' as const, text: 'Pendente', icon: Clock };
      case 'answered':
        return { variant: 'success' as const, text: 'Respondida', icon: MessageSquare };
      case 'rejected':
        return { variant: 'error' as const, text: 'Rejeitada', icon: X };
      default:
        return { variant: 'default' as const, text: status, icon: Package };
    }
  };

  const handleSubmitResponse = async () => {
    if (!price || !response) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    try {
      await onRespond?.(quote.id, response, price);
      setPrice(0);
      setResponse('');
      setShowResponseForm(false);
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Erro ao enviar resposta. Por favor, tente novamente.');
    }
  };

  const statusInfo = getStatusInfo(quote.status);

  const timelineEvents = [
    {
      icon: Clock,
      label: 'Orçamento Recebido',
      date: quote.createdAt,
      status: 'completed' as const
    },
    {
      icon: MessageSquare,
      label: 'Resposta do Proprietário',
      date: quote.answeredAt,
      status: quote.answeredAt ? 'completed' as const : quote.rejectedAt ? 'upcoming' as const : 'current' as const
    },
    {
      icon: Check,
      label: 'Aprovação do Cliente',
      date: quote.approvedAt,
      status: !quote.answeredAt ? 'upcoming' as const : quote.approvedAt ? 'completed' as const : 'current' as const
    },
    {
      icon: Check,
      label: 'Locação Aprovada',
      date: quote.rentalApprovedAt,
      status: !quote.approvedAt ? 'upcoming' as const : quote.rentalApprovedAt ? 'completed' as const : 'current' as const
    }
  ];

  if (quote.rejectedAt) {
    timelineEvents[1] = {
      icon: X,
      label: 'Orçamento Rejeitado',
      date: quote.rejectedAt,
      status: 'completed' as const
    };
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col md:flex-row">
        {/* Imagem e Status */}
        <div className="w-full md:w-48 p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700">
          <div className="w-32 h-32 bg-gray-50 dark:bg-gray-700 rounded-lg p-2 flex items-center justify-center">
            {quote.machine.mainImageUrl ? (
              <img
                src={quote.machine.mainImageUrl}
                alt={quote.machine.name}
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <Package className="w-12 h-12 text-gray-400" />
            )}
          </div>
          <div className="mt-4 text-center">
            <StatusBadge variant={statusInfo.variant} icon={statusInfo.icon}>
              {statusInfo.text}
            </StatusBadge>
          </div>
        </div>

        {/* Informações */}
        <div className="flex-1 p-6">
          <div className="space-y-4">
            {/* Cabeçalho */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {quote.machine.name}
              </h3>
              <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <User className="w-4 h-4 mr-2" />
                <span>{quote.client.name}</span>
              </div>
            </div>

            {/* Timeline */}
            <Timeline events={timelineEvents} />

            {/* Detalhes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Período</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{quote.rentalPeriod}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Endereço</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{quote.deliveryAddress}</p>
                </div>
              </div>
            </div>

            {/* Acessórios */}
            {quote.accessories && quote.accessories.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Acessórios</h4>
                <div className="flex flex-wrap gap-2">
                  {quote.accessories.map(accessory => (
                    <span
                      key={accessory.id}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                    >
                      {accessory.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Resposta do Proprietário */}
            {quote.status === 'answered' && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Resposta do Proprietário</h4>
                  <span className="text-lg font-semibold text-primary">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.responsePrice || 0)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{quote.response}</p>
              </div>
            )}
          </div>

          {/* Ações do Proprietário */}
          {showLandlordActions && quote.status === 'pending' && (
            <div className="mt-6 space-y-4">
              {!showResponseForm ? (
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowResponseForm(true)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Responder
                  </button>
                  <button
                    onClick={() => onReject?.(quote.id, 'Orçamento rejeitado')}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Rejeitar
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Valor do Orçamento
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-4 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Resposta
                    </label>
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-4 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                      placeholder="Digite sua resposta..."
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setShowResponseForm(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmitResponse}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Enviar Resposta
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ações do Cliente */}
          {showClientActions && quote.status === 'answered' && onApprove && (
            <div className="flex justify-end mt-6">
              <button
                onClick={() => onApprove(quote)}
                className="inline-flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Check className="w-5 h-5 mr-2" />
                Aprovar e Gerar Locação
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}