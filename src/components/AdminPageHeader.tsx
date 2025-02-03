import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ChevronLeft, Home, ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useSystemSettings } from '../hooks/useSystemSettings';
import { ThemeToggle } from './ThemeToggle';

interface BreadcrumbItem {
  label: string;
  path?: string;
  href?: string;
}

interface AdminPageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
  subtitle?: string;
}

export function AdminPageHeader({ title, breadcrumbs = [], action, subtitle }: AdminPageHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useSelector((state: RootState) => state.theme.theme);
  const { settings } = useSystemSettings();

  const handleBack = () => {
    if (breadcrumbs.length > 1) {
      const previousPath = breadcrumbs[breadcrumbs.length - 2].path;
      if (previousPath) {
        navigate(previousPath);
        return;
      }
    }
    navigate(-1);
  };

  return (
    <div className={`bg-${theme}-header text-${theme}-header-text shadow-sm mt-20`}>
      <div className="max-w-7xl mx-auto">
        <div className="py-4 px-4">
          {/* Breadcrumbs */}
          <nav className="flex items-center text-sm mb-2">
            <button
              onClick={handleBack}
              className={`p-2 -ml-2 text-${theme}-gray-500 hover:text-${theme}-primary rounded-lg hover:bg-${theme}-gray-100 dark:hover:bg-${theme}-gray-700 transition-colors duration-200`}
              title="Voltar"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <ol className="flex items-center space-x-2">
              <li>
                <button
                  onClick={() => navigate('/landlord-dashboard')}
                  className={`flex items-center text-${theme}-gray-500 hover:text-${theme}-primary`}
                >
                  <Home className="h-4 w-4" />
                </button>
              </li>
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                  <li className={`text-${theme}-gray-400`}>/</li>
                  <li>
                    {item.path || item.href ? (
                      <Link
                        to={item.path || item.href}
                        className={`hover:text-${theme}-primary transition-colors duration-200 ${
                          location.pathname === (item.path || item.href)
                            ? `text-${theme}-primary font-medium`
                            : `text-${theme}-gray-500`
                        }`}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className={`text-${theme}-gray-500`}>{item.label}</span>
                    )}
                  </li>
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight className="w-4 h-4" style={{ color: 'var(--header-text)' }} />
                  )}
                </React.Fragment>
              ))}
            </ol>
          </nav>

          {/* Title and Action */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold text-${theme}-text`}>{title}</h1>
              {subtitle && (
                <p className={`mt-2 text-sm opacity-80 text-${theme}-text`}>{subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {action}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}