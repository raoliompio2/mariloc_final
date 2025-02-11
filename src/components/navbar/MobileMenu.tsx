<<<<<<< HEAD
import React from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronRight, Search, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuLink } from '../navigation/MenuLink';
import { useNavigation } from '../../hooks/useNavigation';
import { MenuUser } from '../../types/navigation';
=======
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, ChevronRight, Grid, Package, User, LogOut, Settings, Home, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
>>>>>>> d8ec9daea160d7b61a92eea80aabbc97adf1aa76

interface MobileMenuProps {
  showMobileMenu: boolean;
  setShowMobileMenu: (show: boolean) => void;
<<<<<<< HEAD
  user: MenuUser | null;
=======
  user: any;
>>>>>>> d8ec9daea160d7b61a92eea80aabbc97adf1aa76
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
<<<<<<< HEAD
  const { getMenuItems } = useNavigation(user?.role);
  const menuItems = [
    { to: '/', label: 'Início', icon: <Package className="h-5 w-5" /> },
    { to: '/empresa', label: 'Empresa', icon: <Package className="h-5 w-5" /> },
    { to: '/contato', label: 'Contato', icon: <Package className="h-5 w-5" /> },
    { to: '/sac', label: 'SAC', icon: <Package className="h-5 w-5" /> },
=======
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Reset active section when menu closes
  useEffect(() => {
    if (!showMobileMenu) {
      setActiveSection(null);
      setSearchTerm('');
    }
  }, [showMobileMenu]);

  // Search functionality
  useEffect(() => {
    const searchProducts = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const { data } = await supabase
          .from('machines')
          .select('id, name, main_image_url')
          .ilike('name', `%${searchTerm}%`)
          .limit(5);

        setSearchResults(data || []);
      } catch (error) {
        console.error('Error searching products:', error);
      }
    };

    const timer = setTimeout(searchProducts, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const menuItems = [
    { id: 'home', label: 'Início', icon: Home, path: '/' },
    ...(user ? [
      { id: 'client_dashboard', label: 'Meu Dashboard', icon: Grid, path: '/client-dashboard' },
      { id: 'quotes', label: 'Meus Orçamentos', icon: Package, path: '/client/quotes' },
      { id: 'rentals', label: 'Meus Aluguéis', icon: Package, path: '/client/rentals' },
      { id: 'returns', label: 'Minhas Devoluções', icon: Package, path: '/client/returns' },
      { id: 'profile', label: 'Meu Perfil', icon: User, path: '/profile' },
      { id: 'settings', label: 'Configurações', icon: Settings, path: '/settings' },
    ] : [
      { id: 'login', label: 'Entrar', icon: User, path: '/login' },
      { id: 'register', label: 'Cadastrar', icon: User, path: '/register' },
    ]),
>>>>>>> d8ec9daea160d7b61a92eea80aabbc97adf1aa76
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
<<<<<<< HEAD
=======
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
>>>>>>> d8ec9daea160d7b61a92eea80aabbc97adf1aa76
            className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
<<<<<<< HEAD
=======
        
        {/* Search Results */}
        <AnimatePresence>
          {searchTerm && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg z-50
                       border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto"
            >
              {searchResults.map((result) => (
                <Link
                  key={result.id}
                  to={`/produto/${result.id}`}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setShowMobileMenu(false)}
                >
                  {result.main_image_url && (
                    <img
                      src={result.main_image_url}
                      alt={result.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  )}
                  <span className="text-gray-900 dark:text-gray-100">{result.name}</span>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
>>>>>>> d8ec9daea160d7b61a92eea80aabbc97adf1aa76
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {menuItems.map((item) => (
<<<<<<< HEAD
            <MenuLink
              key={item.to}
              item={item}
              variant="mobile"
              onClick={() => setShowMobileMenu(false)}
            />
=======
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-xl mb-1
                       ${location.pathname === item.path 
                         ? 'bg-primary text-white' 
                         : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                       } transition-all duration-200`}
              onClick={() => {
                if (item.id === 'categories') {
                  setActiveSection('categories');
                } else {
                  setShowMobileMenu(false);
                }
              }}
            >
              <item.icon className={`h-5 w-5 ${location.pathname === item.path ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
              <span className="font-medium">{item.label}</span>
              {item.id === 'categories' && (
                <ChevronRight className="ml-auto h-5 w-5 text-gray-400" />
              )}
            </Link>
>>>>>>> d8ec9daea160d7b61a92eea80aabbc97adf1aa76
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
<<<<<<< HEAD
=======
            <LogOut className="h-5 w-5" />
>>>>>>> d8ec9daea160d7b61a92eea80aabbc97adf1aa76
            <span className="font-medium">Sair</span>
          </button>
        </div>
      )}
    </div>
  );

<<<<<<< HEAD
=======
  const renderCategories = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-3 p-4 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveSection(null)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronRight className="h-6 w-6 text-gray-500 dark:text-gray-400 transform rotate-180" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Categorias</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/categoria/${category.slug}`}
            className="flex items-center space-x-3 p-3 rounded-xl mb-1
                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            onClick={() => setShowMobileMenu(false)}
          >
            {category.icon_url && (
              <img
                src={category.icon_url}
                alt={category.name}
                className="w-8 h-8 object-contain"
              />
            )}
            <span className="font-medium text-gray-900 dark:text-gray-100">{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );

>>>>>>> d8ec9daea160d7b61a92eea80aabbc97adf1aa76
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
<<<<<<< HEAD
            {renderMainMenu()}
=======
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection || 'main'}
                initial={{ opacity: 0, x: activeSection ? 50 : -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeSection ? -50 : 50 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeSection === 'categories' ? renderCategories() : renderMainMenu()}
              </motion.div>
            </AnimatePresence>
>>>>>>> d8ec9daea160d7b61a92eea80aabbc97adf1aa76
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
