import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { NavigationState, MenuItem, UserRole } from '../types/navigation';
import { Home, Grid, Package, User, Settings, LayoutDashboard } from 'lucide-react';

export const useNavigation = (userRole?: UserRole) => {
  const location = useLocation();
  const [state, setState] = useState<NavigationState>({
    showMobileMenu: false,
    showCategories: false,
    showDropdown: false,
    currentSlide: 0,
  });

  // Reset menus when route changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      showMobileMenu: false,
      showCategories: false,
      showDropdown: false,
    }));
  }, [location.pathname]);

  const getMenuItems = useCallback((): MenuItem[] => {
    const baseItems: MenuItem[] = [
      { id: 'home', label: 'Início', icon: Home, path: '/' },
    ];

    if (!userRole) {
      return [
        ...baseItems,
        { id: 'login', label: 'Entrar', icon: User, path: '/login' },
        { id: 'register', label: 'Cadastrar', icon: User, path: '/register' },
      ];
    }

    const roleSpecificItems: Record<UserRole, MenuItem[]> = {
      landlord: [
        { id: 'landlord_dashboard', label: 'Painel do Proprietário', icon: LayoutDashboard, path: '/landlord/dashboard' },
        { id: 'quotes', label: 'Orçamentos', icon: Package, path: '/quote/list' },
        { id: 'rentals', label: 'Aluguéis', icon: Package, path: '/rental/list' },
      ],
      admin: [
        { id: 'admin_dashboard', label: 'Painel Administrativo', icon: LayoutDashboard, path: '/admin/dashboard' },
      ],
      client: [
        { id: 'client_dashboard', label: 'Meu Dashboard', icon: Grid, path: '/client/dashboard' },
        { id: 'quotes', label: 'Meus Orçamentos', icon: Package, path: '/client/quotes' },
        { id: 'rentals', label: 'Meus Aluguéis', icon: Package, path: '/client/rentals' },
        { id: 'returns', label: 'Minhas Devoluções', icon: Package, path: '/client/returns' },
      ],
    };

    const commonItems: MenuItem[] = [
      { id: 'profile', label: 'Meu Perfil', icon: User, path: '/profile' },
      { id: 'settings', label: 'Configurações', icon: Settings, path: '/settings' },
    ];

    return [
      ...baseItems,
      ...roleSpecificItems[userRole],
      ...commonItems,
    ];
  }, [userRole]);

  const toggleMenu = (menuKey: keyof NavigationState) => {
    setState(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  return {
    state,
    toggleMenu,
    getMenuItems,
  };
};
