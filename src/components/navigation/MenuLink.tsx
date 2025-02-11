import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MenuItem } from '../../types/navigation';
import cn from 'classnames';

interface MenuLinkProps {
  item: MenuItem;
  onClick?: () => void;
  variant?: 'mobile' | 'desktop';
  className?: string;
}

export const MenuLink: React.FC<MenuLinkProps> = ({
  item,
  onClick,
  variant = 'desktop',
  className,
}) => {
  const location = useLocation();
  const isActive = location.pathname === item.path;

  const baseStyles = cn(
    'flex items-center transition-colors',
    {
      // Mobile styles
      'space-x-3 p-3 rounded-xl mb-1': variant === 'mobile',
      'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800': variant === 'mobile' && !isActive,
      'bg-primary text-white': variant === 'mobile' && isActive,
      
      // Desktop styles
      'space-x-2 px-4 py-2 text-sm font-medium rounded-lg': variant === 'desktop',
      'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800': variant === 'desktop' && !isActive,
      'bg-primary text-white hover:bg-primary-dark': variant === 'desktop' && isActive,
    },
    className
  );

  const iconStyles = cn(
    'h-5 w-5',
    {
      'text-white': isActive,
      'text-gray-500 dark:text-gray-400': !isActive,
    }
  );

  return (
    <Link
      to={item.path}
      className={baseStyles}
      onClick={onClick}
    >
      <item.icon className={iconStyles} />
      <span>{item.label}</span>
    </Link>
  );
};
