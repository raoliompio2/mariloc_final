export interface Rental {
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