export interface Quote {
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
  landlord?: {
    id: string;
    name: string;
    email: string;
  };
  rentalPeriod: string;
  deliveryAddress: string;
  observations: string | null;
  status: 'pending' | 'answered' | 'rejected';
  response: string | null;
  responsePrice: number | null;
  createdAt: string;
  accessories?: {
    id: string;
    name: string;
    price: number;
  }[];
}