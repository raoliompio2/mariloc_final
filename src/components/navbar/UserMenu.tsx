<<<<<<< HEAD
import React, { useState, useRef, useEffect } from 'react';
import { User, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserMenuProps {
  user: {
    id: string;
    role?: string;
    name?: string;
    email?: string;
    avatar_url?: string;
  } | null;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  handleLogout: () => void;
}

export function UserMenu({ user, showDropdown, setShowDropdown, handleLogout }: UserMenuProps) {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowDropdown]);
=======
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Package, User, LayoutDashboard, ChevronDown, Loader2 } from 'lucide-react';

interface UserMenuProps {
  user: any;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  handleLogout: () => Promise<void>;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  showDropdown,
  setShowDropdown,
  handleLogout,
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Se não houver usuário, mostra apenas o botão de login
  if (!user) {
    return (
      <Link
        to="/login"
        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white dark:text-gray-900 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg transition-colors"
      >
        <User className="h-5 w-5" />
        <span>Entrar</span>
      </Link>
    );
  }

  // Determina os links do painel com base no tipo de usuário
  const getDashboardLinks = () => {
    const links = [];

    // Link do perfil (comum a todos os usuários)
    links.push({
      to: '/profile',
      icon: <User className="h-4 w-4 mr-3" />,
      label: 'Meu Perfil'
    });

    // Link do painel específico para o tipo de usuário
    if (user.role === 'landlord') {
      links.push({
        to: '/landlord/dashboard',
        icon: <LayoutDashboard className="h-4 w-4 mr-3" />,
        label: 'Painel do Proprietário'
      });
    } else if (user.role === 'admin') {
      links.push({
        to: '/admin/dashboard',
        icon: <LayoutDashboard className="h-4 w-4 mr-3" />,
        label: 'Painel Administrativo'
      });
    } else {
      links.push({
        to: '/client/dashboard',
        icon: <LayoutDashboard className="h-4 w-4 mr-3" />,
        label: 'Meu Painel'
      });
    }

    // Configurações (comum a todos os usuários)
    links.push({
      to: '/settings',
      icon: <Package className="h-4 w-4 mr-3" />,
      label: 'Configurações'
    });

    return links;
  };
>>>>>>> d8ec9daea160d7b61a92eea80aabbc97adf1aa76

  const handleLogoutClick = async () => {
    try {
      setIsLoggingOut(true);
      await handleLogout();
<<<<<<< HEAD
      setShowDropdown(false);
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
=======
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
>>>>>>> d8ec9daea160d7b61a92eea80aabbc97adf1aa76
      setIsLoggingOut(false);
    }
  };

<<<<<<< HEAD
  if (!user) {
    return (
      <button
        onClick={() => navigate('/login')}
        className="flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        <User className="h-5 w-5" />
        <span>Login</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 rounded-full p-1 transition-colors hover:bg-white/10"
      >
        <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary">
          <img 
            src={user.avatar_url || '/default-avatar.png'} 
            alt={user.name || 'User avatar'} 
            className="h-full w-full object-cover"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = '/default-avatar.png';
            }}
          />
        </div>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800">
          <div className="py-1">
            {/* User Info */}
            <div className="px-4 py-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Navigation Links */}
            {user.role === 'landlord' && (
              <button
                onClick={() => {
                  navigate('/landlord/dashboard');
                  setShowDropdown(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Dashboard
              </button>
            )}

            {user.role === 'admin' && (
              <button
                onClick={() => {
                  navigate('/admin/dashboard');
                  setShowDropdown(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Dashboard
              </button>
            )}

            {user.role === 'client' && (
              <button
                onClick={() => {
                  navigate('/client/dashboard');
                  setShowDropdown(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Dashboard
              </button>
            )}

            <button
              onClick={() => {
                navigate('/profile');
                setShowDropdown(false);
              }}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Perfil
            </button>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Logout */}
            <button
              onClick={handleLogoutClick}
              disabled={isLoggingOut}
              className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
            >
              {isLoggingOut ? 'Saindo...' : 'Sair'}
=======
  const dashboardLinks = getDashboardLinks();

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        disabled={isLoggingOut}
      >
        <img
          src={user.avatar_url || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXIiPjxwYXRoIGQ9Ik0xOSAyMXYtMmE0IDQgMCAwIDAtNC00SDlhNCA0IDAgMCAwLTQgNHYyIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ii8+PC9zdmc+'}
          alt=""
          className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
        />
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700">
          {/* Informações do usuário */}
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name || 'Usuário'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>

          {/* Links de navegação */}
          <div className="py-1">
            {dashboardLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                onClick={() => setShowDropdown(false)}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Botão de logout */}
          <div className="py-1">
            <button
              onClick={handleLogoutClick}
              disabled={isLoggingOut}
              className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 mr-3 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4 mr-3" />
              )}
              <span>{isLoggingOut ? 'Saindo...' : 'Sair'}</span>
>>>>>>> d8ec9daea160d7b61a92eea80aabbc97adf1aa76
            </button>
          </div>
        </div>
      )}
    </div>
  );
<<<<<<< HEAD
}
=======
};
>>>>>>> d8ec9daea160d7b61a92eea80aabbc97adf1aa76
