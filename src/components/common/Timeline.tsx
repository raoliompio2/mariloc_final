import React from 'react';
import { LucideIcon } from 'lucide-react';

interface TimelineEvent {
  icon: LucideIcon;
  label: string;
  date: string | null;
  status: 'completed' | 'current' | 'upcoming';
}

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  const formatDate = (date: string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'current':
        return 'bg-blue-500';
      case 'upcoming':
        return 'bg-gray-300 dark:bg-gray-600';
    }
  };

  return (
    <div className="flow-root mt-4">
      <ul role="list" className="-mb-8">
        {events.map((event, eventIdx) => {
          const Icon = event.icon;
          const isLast = eventIdx === events.length - 1;
          const statusColor = getStatusColor(event.status);

          return (
            <li key={event.label}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-gray-800 ${statusColor}`}>
                      <Icon className="h-4 w-4 text-white" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className={`text-sm ${event.status === 'completed' ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                        {event.label}
                      </p>
                    </div>
                    {event.date && (
                      <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(event.date)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
