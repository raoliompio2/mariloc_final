import React from 'react';

interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
  blur?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  loading,
  children,
  blur = true,
}) => {
  if (!loading) return <>{children}</>;

  return (
    <div className="relative">
      <div className={blur ? 'blur-sm' : ''}>
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-600 dark:text-gray-300">Carregando...</span>
        </div>
      </div>
    </div>
  );
};

// Componente para botões com estado de loading
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  loadingText = 'Carregando...',
  children,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`
        relative inline-flex items-center justify-center
        px-4 py-2 border border-transparent
        text-sm font-medium rounded-md
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${loading ? 'cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {loading && (
        <span className="absolute left-4">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </span>
      )}
      <span className={loading ? 'opacity-0' : ''}>
        {children}
      </span>
      {loading && (
        <span className="absolute">{loadingText}</span>
      )}
    </button>
  );
};
