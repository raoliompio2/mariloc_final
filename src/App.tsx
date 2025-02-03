import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProviderWrapper } from './components/ThemeProviderWrapper';
import { LoadingProvider, useLoading } from './contexts/LoadingContext';
import { Routes } from './routes';
import { ToastContainer } from 'react-toastify';
import { Toaster } from 'react-hot-toast';
import { Footer } from './components/Footer';
import 'react-toastify/dist/ReactToastify.css';

function AppContent() {
  const { stopLoading } = useLoading();

  useEffect(() => {
    // Simula o tempo de carregamento inicial
    const timer = setTimeout(() => {
      stopLoading();
    }, 1500); // 1.5 segundos

    return () => clearTimeout(timer);
  }, [stopLoading]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster position="top-right" />
      <Routes />
      <Footer />
    </div>
  );
}

export function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProviderWrapper>
          <LoadingProvider>
            <AppContent />
            <ToastContainer position="bottom-right" />
          </LoadingProvider>
        </ThemeProviderWrapper>
      </BrowserRouter>
    </HelmetProvider>
  );
}