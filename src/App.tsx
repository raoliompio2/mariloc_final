import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { ThemeProviderWrapper } from './components/ThemeProviderWrapper';
import { LoadingProvider, useLoading } from './contexts/LoadingContext';
import { Routes } from './routes';
import { Toaster } from './components/ui/toaster';
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

function AppContent() {
  const { loading } = useLoading();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      )}
      <Routes />
    </div>
  );
}

export function App() {
  return (
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
  );
}