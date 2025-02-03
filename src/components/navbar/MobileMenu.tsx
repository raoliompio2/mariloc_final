import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

interface MobileMenuProps {
  showMobileMenu: boolean;
  setShowMobileMenu: (show: boolean) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  showMobileMenu,
  setShowMobileMenu,
}) => {
  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-50 
      ${showMobileMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={() => setShowMobileMenu(false)}
    >
      <div
        className={`absolute top-0 right-0 w-full max-w-sm h-full bg-white dark:bg-gray-900 transform transition-transform duration-300 
        ${showMobileMenu ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Menu</h2>
          <button
            onClick={() => setShowMobileMenu(false)}
            className="p-2 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4">
          <div className="space-y-1">
            <Link
              to="/"
              className="block px-4 py-2 text-base font-medium text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setShowMobileMenu(false)}
            >
              Início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
