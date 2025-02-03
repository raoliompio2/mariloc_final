export interface TechnicalData {
  id: string;
  label: string;
  value: string;
  isHighlight?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  bannerUrl: string;
  iconUrl: string;
  type: 'primary' | 'secondary';
  created_at: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  mainImageUrl: string;
  categoryId: string;
  secondaryCategoryId?: string;
  ownerId?: string;
  createdAt: string;
  category?: Category;
  secondaryCategory?: Category;
  technical_data?: TechnicalData[];
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  isMain: boolean;
  created_at: string;
}