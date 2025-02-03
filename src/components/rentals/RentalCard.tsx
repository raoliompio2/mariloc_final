import React from 'react';
import { Package, ArrowRight, Truck, Check, X, MapPin, Calendar, User, Clock, DollarSign } from 'lucide-react';
import type { Rental } from '../../types/rental';
import { Timeline } from '../common/Timeline';

interface RentalCardProps {
  rental: Rental;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function RentalCard({ rental, onApprove, onReject }: RentalCardProps) {
  const getStatusInfo = (status: Rental['status']) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Aguardando Aprovação', icon: Clock };
      case 'active':
        return { color: 'bg-green-100 text-green-800', text: 'Ativo', icon: Check };
      case 'completed':
        return { color: 'bg-blue-100 text-blue-800', text: 'Concluído', icon: ArrowRight };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800', text: 'Cancelado', icon: X };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: status, icon: Package };
    }
  };

  const statusInfo = getStatusInfo(rental.status);

  const timelineEvents = [
    {
      icon: Clock,
      label: 'Locação Criada',
      date: rental.createdAt,
      status: 'completed' as const
    }
  ];

  if (rental.status === 'cancelled') {
    timelineEvents.push({
      icon: X,
      label: 'Locação Cancelada',
      date: rental.cancelledAt || null,
      status: 'completed' as const
    });
  } else {
    if (rental.status === 'pending') {
      timelineEvents.push({
        icon: Check,
        label: 'Aprovação da Locação',
        date: null,
        status: 'current' as const
      });
    } else {
      timelineEvents.push({
        icon: Check,
        label: 'Locação Aprovada',
        date: rental.startDate,
        status: 'completed' as const
      });

      if (rental.status === 'completed') {
        timelineEvents.push({
          icon: ArrowRight,
          label: 'Locação Finalizada',
          date: rental.endDate,
          status: 'completed' as const
        });
      } else if (rental.status === 'active') {
        timelineEvents.push({
          icon: ArrowRight,
          label: 'Locação em Andamento',
          date: null,
          status: 'current' as const
        });
      }
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col md:flex-row">
        {/* Imagem e Status */}
        <div className="w-full md:w-48 p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700">
          <div className="w-32 h-32 bg-gray-50 dark:bg-gray-700 rounded-lg p-2 flex items-center justify-center">
            {rental.machine.mainImageUrl ? (
              <img
                src={rental.machine.mainImageUrl}
                alt={rental.machine.name}
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <Package className="w-12 h-12 text-gray-400" />
            )}
          </div>
          <div className="mt-4 text-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
              <statusInfo.icon className="w-4 h-4 mr-2" />
              {statusInfo.text}
            </span>
          </div>
        </div>

        {/* Informações */}
        <div className="flex-1 p-6">
          <div className="space-y-4">
            {/* Cabeçalho */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {rental.machine.name}
              </h3>
              <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <User className="w-4 h-4 mr-2" />
                <span>{rental.client.name}</span>
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">{rental.rentalPeriod}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Endereço</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{rental.deliveryAddress}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Valor</p>
                  <p className="text-sm font-semibold text-primary">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rental.price)}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Truck className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Entrega</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {rental.deliveryDate ? new Date(rental.deliveryDate).toLocaleDateString() : 'A definir'}
                  </p>
                </div>
              </div>
            </div>

            {/* Ações */}
            {rental.status === 'pending' && (
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => onReject(rental.id)}
                  className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <X className="w-5 h-5 mr-2" />
                  Rejeitar
                </button>
                <button
                  onClick={() => onApprove(rental.id)}
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Aprovar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}