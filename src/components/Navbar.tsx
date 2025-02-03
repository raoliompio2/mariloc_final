import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Menu, LogOut, Sun, Moon, Package, User, LayoutDashboard, X, ChevronDown, Grid, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setTheme, fetchSystemSettings } from '../store/themeSlice';
import { fetchCategories } from '../store/categorySlice';
import ProductSearchCard from './ProductSearchCard';
import { UserMenu } from './navbar/UserMenu';
import cn from 'classnames';

const NavbarDropdown = lazy(() => import('./NavbarDropdown'));

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.theme);
  const { categories, status: categoriesStatus } = useSelector((state: RootState) => state.categories);
  const systemSettings = useSelector((state: RootState) => state.theme.systemSettings) || {
    dark_header_color: '#1a1a1a',
    light_header_color: '#ffffff'
  };
  
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerSlide = 6;
  const menuRef = useRef<HTMLDivElement>(null);

  console.log('Current searchTerm:', searchTerm); // Debug
  console.log('Current filteredProducts:', filteredProducts); // Debug

  // Carregar categorias apenas se ainda não foram carregadas
  useEffect(() => {
    if (categoriesStatus === 'idle') {
      dispatch(fetchCategories() as any);
    }
  }, [categoriesStatus, dispatch]);

  useEffect(() => {
    loadUserProfile();
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

  const loadUserProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        setUser(profile);
        setStatus('authenticated');
      } else {
        setStatus('unauthenticated');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setStatus('unauthenticated');
    }
  };

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

  // Atualizar categorias filtradas quando mudar a busca
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

        console.log('Transformed search results:', transformedData); // Debug
        setFilteredProducts(transformedData);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      }
    };

    const timer = setTimeout(searchProducts, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleLogout = async () => {
    try {
      // Faz logout no Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Limpa o estado do usuário
      setUser(null);
      setStatus('unauthenticated');
      setShowDropdown(false);

      // Redireciona para a home
      navigate('/', { replace: true });

      // Recarrega a página para limpar qualquer estado persistente
      window.location.reload();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // TODO: Adicionar toast/notificação de erro
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    dispatch(setTheme(newTheme));
  };

  if (status === 'loading') {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="h-16 bg-white dark:bg-gray-900 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
            <div className="flex items-center gap-8">
              {/* Logo placeholder */}
              <div className="w-32 h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              {/* Menu items placeholder */}
              <div className="hidden md:flex items-center gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-24 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                ))}
              </div>
            </div>
            {/* Right side placeholder */}
            <div className="flex items-center gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={cn("fixed top-0 left-0 right-0 z-50", className)}>
      <Suspense fallback={null}>
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
        />
      </Suspense>

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
          {/* Menu Button (Mobile) */}
          <button
            onClick={() => setShowMobileMenu(true)}
            className="p-3 rounded-full hover:bg-opacity-10 hover:bg-white transition-colors md:hidden"
          >
            <Menu 
              className="h-8 w-8" 
              style={{ 
                color: theme === 'dark' 
                  ? systemSettings.dark_header_text_color 
                  : systemSettings.light_header_text_color 
              }} 
            />
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
              ) : (
                <span 
                  className="text-4xl font-bold"
                  style={{ 
                    color: theme === 'dark' 
                      ? systemSettings.dark_header_text_color 
                      : systemSettings.light_header_text_color 
                  }}
                >
                  Nortec
                </span>
              )}
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

            {user && (
              <span 
                className="hidden md:block text-lg font-medium"
                style={{ 
                  color: theme === 'dark' 
                    ? systemSettings.dark_header_text_color 
                    : systemSettings.light_header_text_color 
                }}
              >
                Bem vindo, {user.name?.split(' ')[0]}
              </span>
            )}

            {/* Substituindo o menu antigo pelo UserMenu */}
            <UserMenu 
              user={user}
              showDropdown={showDropdown}
              setShowDropdown={setShowDropdown}
              handleLogout={handleLogout}
            />
          </div>
        </div>
      </div>

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

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-50 
        ${showMobileMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div 
          className={`fixed inset-y-0 left-0 w-[280px] shadow-xl 
          transition-transform duration-300 transform ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ 
            backgroundColor: theme === 'dark' 
              ? systemSettings.dark_header_color 
              : systemSettings.light_header_color 
          }}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <span 
                className="text-lg font-medium"
                style={{ 
                  color: theme === 'dark' 
                    ? systemSettings.dark_header_text_color 
                    : systemSettings.light_header_text_color 
                }}
              >
                Menu
              </span>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X 
                  className="h-6 w-6" 
                  style={{ 
                    color: theme === 'dark' 
                      ? systemSettings.dark_header_text_color 
                      : systemSettings.light_header_text_color 
                  }} 
                />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <button
                  onClick={() => setShowCategories(!showCategories)}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-lg 
                  transition-colors duration-200 hover:bg-white/10 mb-4"
                  style={{ 
                    color: theme === 'dark' 
                      ? systemSettings.dark_header_text_color 
                      : systemSettings.light_header_text_color 
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <Grid className="h-5 w-5" />
                    <span className="text-base font-medium">Ver Equipamentos</span>
                  </div>
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform duration-200 ${showCategories ? 'rotate-180' : ''}`}
                  />
                </button>

                {showCategories && (
                  <div className="space-y-2 pl-4">
                    {filteredCategories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/catalogo-de-produtos/${category.slug}`}
                        className="flex items-center space-x-3 p-3 rounded-lg
                        transition-colors duration-200 hover:bg-white/10"
                        onClick={() => {
                          setShowCategories(false);
                          setShowMobileMenu(false);
                        }}
                      >
                        <div className="w-8 h-8 flex items-center justify-center">
                          <img 
                            src={category.icon_url} 
                            alt={category.name}
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                        <span 
                          className="text-sm font-medium"
                          style={{ 
                            color: theme === 'dark' 
                              ? systemSettings.dark_header_text_color 
                              : systemSettings.light_header_text_color 
                          }}
                        >
                          {category.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

                {user && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="px-4 mb-4">
                      <p 
                        className="text-base font-medium"
                        style={{ 
                          color: theme === 'dark' 
                            ? systemSettings.dark_header_text_color 
                            : systemSettings.light_header_text_color 
                        }}
                      >
                        {user.name}
                      </p>
                      <p 
                        className="text-sm opacity-80"
                        style={{ 
                          color: theme === 'dark' 
                            ? systemSettings.dark_header_text_color 
                            : systemSettings.light_header_text_color 
                        }}
                      >
                        {user.email}
                      </p>
                    </div>
                    
                    <Link
                      to={user.role === 'landlord' ? '/landlord-dashboard' : '/client-dashboard'}
                      className="block px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <LayoutDashboard 
                        className="h-5 w-5"
                        style={{ 
                          color: theme === 'dark' 
                            ? systemSettings.dark_header_text_color 
                            : systemSettings.light_header_text_color 
                        }}
                      />
                      <span 
                        className="text-sm font-medium"
                        style={{ 
                          color: theme === 'dark' 
                            ? systemSettings.dark_header_text_color 
                            : systemSettings.light_header_text_color 
                        }}
                      >
                        {user.role === 'landlord' ? 'Painel do Proprietário' : 'Meu Painel'}
                      </span>
                    </Link>
                    
                    <Link
                      to="/settings"
                      className="block px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Package 
                        className="h-5 w-5"
                        style={{ 
                          color: theme === 'dark' 
                            ? systemSettings.dark_header_text_color 
                            : systemSettings.light_header_text_color 
                        }}
                      />
                      <span 
                        className="text-sm font-medium"
                        style={{ 
                          color: theme === 'dark' 
                            ? systemSettings.dark_header_text_color 
                            : systemSettings.light_header_text_color 
                        }}
                      >
                        Configurações
                      </span>
                    </Link>

                    <button
                      onClick={() => {
                        handleLogout();
                        setShowMobileMenu(false);
                      }}
                      className="block w-full text-left text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="text-sm font-medium">Sair</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}