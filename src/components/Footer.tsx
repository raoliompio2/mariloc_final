import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
  const { theme, systemSettings } = useSelector((state: RootState) => state.theme);
  const status = useSelector((state: RootState) => state.theme.status);

  // Se ainda está carregando, não mostrar nada
  if (status === 'loading') {
    return null;
  }

  return (
    <footer 
      className="w-full mt-auto rounded-t-3xl shadow-lg transition-colors duration-200"
      style={{ 
        backgroundColor: theme === 'dark' 
          ? systemSettings.dark_header_color 
          : systemSettings.light_header_color,
        color: theme === 'dark'
          ? systemSettings.dark_header_text_color
          : systemSettings.light_header_text_color
      }}
    >
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Coluna 1: Logo */}
          <div>
            <Link to="/" className="flex items-center mb-4">
              {theme === 'dark' && systemSettings.dark_header_logo_url ? (
                <img
                  src={systemSettings.dark_header_logo_url}
                  alt="Logo"
                  className="h-[120px] w-auto"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    console.error('Erro ao carregar logo escura:', e);
                    const target = e.target as HTMLImageElement;
                    target.src = systemSettings.light_header_logo_url || '';
                  }}
                />
              ) : systemSettings.light_header_logo_url ? (
                <img
                  src={systemSettings.light_header_logo_url}
                  alt="Logo"
                  className="h-[120px] w-auto"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    console.error('Erro ao carregar logo clara:', e);
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : null}
            </Link>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              {(systemSettings.quick_links || []).map((link) => (
                <li key={link.id}>
                  <Link
                    to={link.url}
                    className="hover:opacity-75 transition-opacity"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <ul className="space-y-3">
              <li className="text-sm">
                <p className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 opacity-75" />
                  <span>{systemSettings.address || 'Endereço não configurado'}</span>
                </p>
              </li>
              <li className="text-sm">
                <p className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 opacity-75" />
                  <span>{systemSettings.phone || 'Telefone não configurado'}</span>
                </p>
              </li>
              <li className="text-sm">
                <p className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 opacity-75" />
                  <span>{systemSettings.email || 'Email não configurado'}</span>
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-opacity-10 pt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().getFullYear()} Locadora. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}