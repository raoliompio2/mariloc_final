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

  const handleLogoutClick = async () => {
    try {
      setIsLoggingOut(true);
      await handleLogout();
      setShowDropdown(false);
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

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
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
