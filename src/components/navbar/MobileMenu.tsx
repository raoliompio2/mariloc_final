import React from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronRight, Search, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuLink } from '../navigation/MenuLink';
import { useNavigation } from '../../hooks/useNavigation';
import { MenuUser } from '../../types/navigation';

interface MobileMenuProps {
  showMobileMenu: boolean;
  setShowMobileMenu: (show: boolean) => void;
  user: MenuUser | null;
  theme: string;
  categories: any[];
  onLogout: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  showMobileMenu,
  setShowMobileMenu,
  user,
  theme,
  categories,
  onLogout,
}) => {
  const { getMenuItems } = useNavigation(user?.role);
  const menuItems = [
    { to: '/', label: 'Início', icon: <Package className="h-5 w-5" /> },
    { to: '/empresa', label: 'Empresa', icon: <Package className="h-5 w-5" /> },
    { to: '/contato', label: 'Contato', icon: <Package className="h-5 w-5" /> },
    { to: '/sac', label: 'SAC', icon: <Package className="h-5 w-5" /> },
  ];

  const slideVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 200 } },
    exit: { x: '100%', opacity: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const renderMainMenu = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Menu</h2>
        <button
          onClick={() => setShowMobileMenu(false)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar equipamentos..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {menuItems.map((item) => (
            <MenuLink
              key={item.to}
              item={item}
              variant="mobile"
              onClick={() => setShowMobileMenu(false)}
            />
          ))}
        </div>
      </div>

      {/* User Section */}
      {user && (
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
              <span className="text-lg font-medium">{user.name?.[0]?.toUpperCase()}</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 p-2 rounded-lg
                     text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <span className="font-medium">Sair</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {showMobileMenu && (
        <>
          {/* Backdrop */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Menu Panel */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={slideVariants}
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl z-50
                     overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {renderMainMenu()}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
