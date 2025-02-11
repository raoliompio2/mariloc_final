<<<<<<< HEAD
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
=======
import { BrowserRouter } from 'react-router-dom';
>>>>>>> d8ec9daea160d7b61a92eea80aabbc97adf1aa76
import { ThemeProviderWrapper } from './components/ThemeProviderWrapper';
import { LoadingProvider, useLoading } from './contexts/LoadingContext';
import { Routes } from './routes';
import { Toaster } from './components/ui/toaster';
<<<<<<< HEAD
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChatProvider } from './contexts/ChatContext';
import { ChatBot } from './components/chat/ChatBot';
import { Provider } from 'react-redux';
import { store } from './store/store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});
=======
>>>>>>> d8ec9daea160d7b61a92eea80aabbc97adf1aa76

function AppContent() {
  const { loading } = useLoading();

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      )}
      <Routes />
    </div>
=======
    <>
      {loading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
        </div>
      )}
      <Routes />
    </>
>>>>>>> d8ec9daea160d7b61a92eea80aabbc97adf1aa76
  );
}

export function App() {
  return (
<<<<<<< HEAD
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SWRConfig 
          value={{
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            refreshInterval: 0,
          }}
        >
          <BrowserRouter>
            <ThemeProviderWrapper>
              <LoadingProvider>
                <ChatProvider>
                  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                    <AppContent />
                    <ChatBot />
                    <Toaster />
                  </div>
                </ChatProvider>
              </LoadingProvider>
            </ThemeProviderWrapper>
          </BrowserRouter>
        </SWRConfig>
      </QueryClientProvider>
    </Provider>
=======
    <BrowserRouter>
      <ThemeProviderWrapper>
        <LoadingProvider>
          <AppContent />
          <Toaster />
        </LoadingProvider>
      </ThemeProviderWrapper>
    </BrowserRouter>
>>>>>>> d8ec9daea160d7b61a92eea80aabbc97adf1aa76
  );
}