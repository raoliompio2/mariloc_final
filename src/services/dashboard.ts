export interface Dashboard {
  totalRevenue: number;
  totalProperties: number;
  activeLeases: number;
  pendingMaintenance: number;
  revenueData: {
    month: string;
    revenue: number;
  }[];
  propertyDistribution: {
    type: string;
    value: number;
  }[];
  recentTransactions: {
    id: string;
    property: string;
    type: string;
    date: string;
    amount: number;
  }[];
}

export const getDashboardData = async (): Promise<Dashboard> => {
  // Simulated data - replace with actual API call
  return {
    totalRevenue: 150000,
    totalProperties: 24,
    activeLeases: 18,
    pendingMaintenance: 5,
    revenueData: [
      { month: 'Jan', revenue: 12000 },
      { month: 'Feb', revenue: 15000 },
      { month: 'Mar', revenue: 18000 },
      { month: 'Apr', revenue: 16000 },
      { month: 'May', revenue: 21000 },
      { month: 'Jun', revenue: 19000 }
    ],
    propertyDistribution: [
      { type: 'Residential', value: 60 },
      { type: 'Commercial', value: 30 },
      { type: 'Industrial', value: 10 }
    ],
    recentTransactions: [
      {
        id: '1',
        property: 'Apartment 101',
        type: 'Rent Payment',
        date: '2025-01-28',
        amount: 2500
      },
      {
        id: '2',
        property: 'Office Space B',
        type: 'Maintenance',
        date: '2025-01-27',
        amount: -500
      },
      {
        id: '3',
        property: 'Warehouse 3',
        type: 'Deposit',
        date: '2025-01-26',
        amount: 3000
      }
    ]
  };
};