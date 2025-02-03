export interface Accessory {
  id: string;
  name: string;
  description: string;
  mainImageUrl: string;
  price: number;
  stock: number;
  machines?: {
    id: string;
    name: string;
  }[];
  createdAt: string;
}

export interface AccessoryImage {
  id: string;
  accessoryId: string;
  imageUrl: string;
  isMain: boolean;
  createdAt: string;
}

export interface AccessoryMachine {
  id: string;
  accessoryId: string;
  machineId: string;
  createdAt: string;
}