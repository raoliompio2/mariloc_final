import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface QuotesAnalyticsData {
  receivedQuotes: number[];
  answeredQuotes: number[];
  completedRentals: number[];
  rentalValues: number[];
  labels: string[];
}

interface QuotesAnalyticsChartProps {
  data: QuotesAnalyticsData;
}

type TimeRange = '7d' | '30d' | '90d' | '180d' | '365d';
type DataType = 'all' | 'quotes' | 'rentals' | 'values';

export function QuotesAnalyticsChart({ data }: QuotesAnalyticsChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [dataType, setDataType] = useState<DataType>('all');

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: '7d', label: '7 dias' },
    { value: '30d', label: '30 dias' },
    { value: '90d', label: '3 meses' },
    { value: '180d', label: '6 meses' },
    { value: '365d', label: '1 ano' },
  ];

  const dataTypeOptions: { value: DataType; label: string }[] = [
    { value: 'all', label: 'Todos os dados' },
    { value: 'quotes', label: 'Orçamentos' },
    { value: 'rentals', label: 'Locações' },
    { value: 'values', label: 'Valores' },
  ];

  // Filtra os dados baseado no timeRange selecionado
  const getFilteredData = () => {
    const rangeMap: Record<TimeRange, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '180d': 180,
      '365d': 365,
    };

    const dataPoints = rangeMap[timeRange];
    const startIndex = Math.max(data.labels.length - dataPoints, 0);

    return {
      labels: data.labels.slice(startIndex),
      receivedQuotes: data.receivedQuotes.slice(startIndex),
      answeredQuotes: data.answeredQuotes.slice(startIndex),
      completedRentals: data.completedRentals.slice(startIndex),
      rentalValues: data.rentalValues.slice(startIndex),
    };
  };

  const filteredData = getFilteredData();

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: 'Análise de Orçamentos e Locações',
      },
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Quantidade',
        },
      },
      y1: {
        type: 'linear' as const,
        display: dataType === 'all' || dataType === 'values',
        position: 'right' as const,
        title: {
          display: true,
          text: 'Valor (R$)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const getDatasets = () => {
    const datasets = [];

    if (dataType === 'all' || dataType === 'quotes') {
      datasets.push(
        {
          label: 'Orçamentos Recebidos',
          data: filteredData.receivedQuotes,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          yAxisID: 'y',
        },
        {
          label: 'Orçamentos Respondidos',
          data: filteredData.answeredQuotes,
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.5)',
          yAxisID: 'y',
        }
      );
    }

    if (dataType === 'all' || dataType === 'rentals') {
      datasets.push({
        label: 'Locações Realizadas',
        data: filteredData.completedRentals,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        yAxisID: 'y',
      });
    }

    if (dataType === 'all' || dataType === 'values') {
      datasets.push({
        label: 'Valor em Locações (R$)',
        data: filteredData.rentalValues,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y1',
      });
    }

    return datasets;
  };

  const chartData = {
    labels: filteredData.labels,
    datasets: getDatasets(),
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Período
          </label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            {timeRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de Dados
          </label>
          <select
            value={dataType}
            onChange={(e) => setDataType(e.target.value as DataType)}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            {dataTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gráfico */}
      <div className="w-full h-[300px] md:h-[400px]">
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
}
