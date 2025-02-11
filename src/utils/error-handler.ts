import { toast } from 'react-toastify';

export interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

export const handleError = (error: any): ErrorResponse => {
  console.error('Error occurred:', error);
  
  const defaultError = {
    message: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
    code: 'UNKNOWN_ERROR'
  };

  if (!error) return defaultError;

  // Handle Supabase errors
  if (error.code && error.message) {
    toast.error(error.message);
    return {
      message: error.message,
      code: error.code,
      details: error.details
    };
  }

  // Handle network errors
  if (error.name === 'NetworkError') {
    const message = 'Erro de conexão. Verifique sua internet e tente novamente.';
    toast.error(message);
    return {
      message,
      code: 'NETWORK_ERROR'
    };
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    toast.error(error.message);
    return {
      message: error.message,
      code: 'VALIDATION_ERROR',
      details: error.details
    };
  }

  // Default error handling
  toast.error(defaultError.message);
  return defaultError;
};

export const showSuccess = (message: string) => {
  toast.success(message);
};

export const showInfo = (message: string) => {
  toast.info(message);
};

export const showWarning = (message: string) => {
  toast.warning(message);
};
