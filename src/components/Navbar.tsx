import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Menu, LogOut, Sun, Moon, Package, User, LayoutDashboard, X, ChevronDown, Grid, ChevronLeft, ChevronRight, Search, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setTheme, fetchSystemSettings } from '../store/themeSlice';
import { fetchCategories } from '../store/categorySlice';
import ProductSearchCard from './ProductSearchCard';
import { UserMenu } from './navbar/UserMenu';
import { MobileMenu } from './navbar/MobileMenu';
import { useAuth } from '../hooks/useAuth';
import cn from 'classnames';

const NavbarDropdown = lazy(() => import('./NavbarDropdown'));

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, loading: authLoading, signOut } = useAuth();
  const theme = useSelector((state: RootState) => state.theme.theme);
  const { categories, status: categoriesStatus } = useSelector((state: RootState) => state.categories);
  const systemSettings = useSelector((state: RootState) => state.theme.systemSettings) || {
    dark_header_color: '#1a1a1a',
    light_header_color: '#ffffff'
  };
  
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerSlide = 6;
  const menuRef = useRef<HTMLDivElement>(null);

  // Carregar categorias apenas se ainda não foram carregadas
  useEffect(() => {
    if (categoriesStatus === 'idle') {
      dispatch(fetchCategories() as any);
    }
  }, [categoriesStatus, dispatch]);

  useEffect(() => {
    dispatch(fetchSystemSettings());
  }, [dispatch]);

  // Fechar o menu quando a rota mudar
  useEffect(() => {
    setShowCategories(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCategories(false);
      }
    };

    if (showCategories) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategories]);

  useEffect(() => {
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
    setCurrentSlide(0);
  }, [searchTerm, categories]);

  useEffect(() => {
    const searchProducts = async () => {
      if (!searchTerm.trim()) {
        setFilteredProducts([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('machines')
          .select(`
            id,
            name,
            description,
            main_image_url,
            category:categories!machines_category_id_fkey(id, name, type),
            secondary_category:categories!machines_secondary_category_id_fkey(id, name, type)
          `)
          .ilike('name', `%${searchTerm}%`)
          .limit(6);

        if (error) throw error;

        const transformedData = (data || []).map(machine => ({
          id: machine.id,
          name: machine.name || 'Produto sem nome',
          main_image_url: machine.main_image_url || '',
          categories: machine.category || machine.secondary_category || { name: 'Sem categoria' }
        }));

        console.log('Transformed search results:', transformedData);
        setFilteredProducts(transformedData);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      }
    };

    const timer = setTimeout(searchProducts, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchPopularTags = async () => {
      try {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('tags')
          .not('tags', 'is', null)
          .limit(100); // Limitar a busca para melhor performance

        if (productsError) throw productsError;

        const tagCounts = new Map<string, number>();
        productsData?.forEach(product => {
          if (Array.isArray(product.tags)) {
            product.tags.forEach((tag: string) => {
              tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
            });
          }
        });

        const sortedTags = Array.from(tagCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([tag]) => tag);

        setPopularTags(sortedTags);
      } catch (error) {
        console.error('Error fetching popular tags:', error);
      }
    };

    fetchPopularTags();
  }, []); // Executar apenas uma vez na montagem do componente

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const renderAuthSection = () => {
    if (authLoading) {
      return (
        <div className="flex items-center justify-center w-10 h-10">
          <Loader2 className="h-5 w-5 animate-spin text-gray-500 dark:text-gray-400" />
        </div>
      );
    }

    return (
      <UserMenu 
        user={user}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        handleLogout={handleLogout}
      />
    );
  };

  const toggleTheme = () => {
    dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <nav className={cn("fixed top-0 left-0 right-0 z-50", className)}>
      <nav ref={menuRef} className="relative">
        {showCategories && (
          <Suspense fallback={<div>Carregando...</div>}>
            <NavbarDropdown
              showCategories={showCategories}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filteredProducts={filteredProducts}
              filteredCategories={filteredCategories}
              currentSlide={currentSlide}
              setCurrentSlide={setCurrentSlide}
              setShowCategories={setShowCategories}
              itemsPerSlide={itemsPerSlide}
              menuRef={menuRef}
              categoriesStatus={categoriesStatus}
              popularTags={popularTags}
              theme={theme}
              systemSettings={systemSettings}
            />
          </Suspense>
        )}
      </nav>

      {/* Menu Principal - Sempre visível por cima */}
      <div 
        className="absolute inset-0 transition-colors duration-200"
        style={{ 
          backgroundColor: theme === 'dark' 
            ? systemSettings.dark_header_color 
            : systemSettings.light_header_color,
          clipPath: `path('M 0 0 L 100% 0 L 100% calc(100% - 3rem) Q 50% 100%, 0 calc(100% - 3rem) L 0 0')`,
          borderBottomLeftRadius: '3rem',
          borderBottomRightRadius: '3rem'
        }} 
      />
      
      <div className="relative max-w-7xl mx-auto px-6 h-28">
        <div className="flex items-center justify-between h-full">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(true)}
            className="lg:hidden p-2 -mr-2 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg 
              transition-colors duration-200 hover:bg-white/10"
              style={{ 
                color: theme === 'dark' 
                  ? systemSettings.dark_header_text_color 
                  : systemSettings.light_header_text_color 
              }}
            >
              <Grid className="h-5 w-5" />
              <span className="text-base font-medium">Ver Equipamentos</span>
              <ChevronDown 
                className={`h-4 w-4 transition-transform duration-200 ${showCategories ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {/* Logo (Center) */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Link to="/" className="flex items-center">
              {theme === 'dark' && systemSettings.dark_header_logo_url ? (
                <img
                  src={systemSettings.dark_header_logo_url}
                  alt="Logo"
                  className="h-[110px] w-auto"
                />
              ) : systemSettings.light_header_logo_url ? (
                <img
                  src={systemSettings.light_header_logo_url}
                  alt="Logo"
                  className="h-[110px] w-auto"
                />
              ) : null}
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-6">
            <button
              onClick={toggleTheme}
              className="p-3 rounded-full hover:bg-opacity-10 hover:bg-white transition-colors"
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? (
                <Sun 
                  className="h-7 w-7" 
                  style={{ color: systemSettings.dark_header_text_color }} 
                />
              ) : (
                <Moon 
                  className="h-7 w-7" 
                  style={{ color: systemSettings.light_header_text_color }} 
                />
              )}
            </button>

            {renderAuthSection()}
          </div>
        </div>
      </div>

      <MobileMenu
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        user={user}
        theme={theme}
        categories={categories}
        onLogout={handleLogout}
      />

      <style className="navbar-styles">{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </nav>
  );
}