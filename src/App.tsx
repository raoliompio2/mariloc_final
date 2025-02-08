import { BrowserRouter } from 'react-router-dom';
import { ThemeProviderWrapper } from './components/ThemeProviderWrapper';
import { LoadingProvider, useLoading } from './contexts/LoadingContext';
import { Routes } from './routes';
import { Toaster } from './components/ui/toaster';

function AppContent() {
  const { loading } = useLoading();

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
        </div>
      )}
      <Routes />
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ThemeProviderWrapper>
        <LoadingProvider>
          <AppContent />
          <Toaster />
        </LoadingProvider>
      </ThemeProviderWrapper>
    </BrowserRouter>
  );
}