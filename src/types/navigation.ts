import { LucideIcon } from 'lucide-react';

export type UserRole = 'client' | 'landlord' | 'admin';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

export interface MenuSection {
  id: string;
  items: MenuItem[];
}

export interface NavigationState {
  showMobileMenu: boolean;
  showCategories: boolean;
  showDropdown: boolean;
  currentSlide: number;
}

export interface SearchState {
  searchTerm: string;
  filteredProducts: Product[];
  filteredCategories: Category[];
  isLoading: boolean;
}

export interface MenuUser {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  avatar_url: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon_url: string | null;
}

export interface Product {
  id: string;
  name: string;
  main_image_url: string | null;
}
