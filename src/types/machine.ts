export interface TechnicalData {
  id?: string;
  machine_id?: string;
  label: string;
  value: string;
  is_highlight?: boolean;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  created_at?: string;
}

export interface Machine {
  id: string;
  name: string;
  description: string;
  brand: string;
  main_image_url: string;
  gallery_images?: string[];
  technical_data: TechnicalData[];
  category_id: string;
  category?: Category;
  owner_id: string;
  created_at: string;
  updated_at?: string;
}

export interface MachineImage {
  id?: string;
  machine_id: string;
  url: string;
  is_main: boolean;
  created_at?: string;
}