import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setTheme, fetchSystemSettings } from '../store/themeSlice';
import { useSystemSettings } from '../hooks/useSystemSettings';

const defaultSettings = {
  light_header_color: '#ffffff',
  light_header_text_color: '#1e293b',
  light_footer_color: '#f8fafc',
  light_footer_text_color: '#1e293b',
  dark_header_color: '#001a41',
  dark_header_text_color: '#e2e8f0',
  dark_footer_color: '#001a41',
  dark_footer_text_color: '#e2e8f0'
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.theme);
  const { settings, status } = useSystemSettings();
  const [isInitialized, setIsInitialized] = useState(false);

  // Carregar configurações ao montar
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        if (status === 'idle') {
          console.log('ThemeProvider: Carregando configurações iniciais');
          const result = await dispatch(fetchSystemSettings()).unwrap();
          console.log('ThemeProvider: Configurações carregadas:', result);
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('Erro ao inicializar tema:', error);
        setIsInitialized(true); // Continuar mesmo com erro
      }
    };

    initializeTheme();
  }, [dispatch, status]);

  // Debug
  useEffect(() => {
    console.log('ThemeProvider State:', { 
      theme, 
      settings, 
      status, 
      isInitialized,
      featured_logos: settings?.featured_logos,
      featured_logos_enabled: settings?.featured_logos_enabled
    });
  }, [theme, settings, status, isInitialized]);

  // Aplicar variáveis CSS
  useEffect(() => {
    if (!isInitialized) return;

    try {
      const root = document.documentElement;
      const currentSettings = settings || {};

      const config = theme === 'light' ? {
        '--header-bg': currentSettings.light_header_color || defaultSettings.light_header_color,
        '--header-text': currentSettings.light_header_text_color || defaultSettings.light_header_text_color,
        '--footer-bg': currentSettings.light_footer_color || defaultSettings.light_footer_color,
        '--footer-text': currentSettings.light_footer_text_color || defaultSettings.light_footer_text_color
      } : {
        '--header-bg': currentSettings.dark_header_color || defaultSettings.dark_header_color,
        '--header-text': currentSettings.dark_header_text_color || defaultSettings.dark_header_text_color,
        '--footer-bg': currentSettings.dark_footer_color || defaultSettings.dark_footer_color,
        '--footer-text': currentSettings.dark_footer_text_color || defaultSettings.dark_footer_text_color
      };

      Object.entries(config).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(key, value);
        }
      });
    } catch (error) {
      console.error('Erro ao aplicar configurações:', error);
    }
  }, [theme, settings, isInitialized]);

  // Salvar tema no localStorage
  useEffect(() => {
    if (!isInitialized) return;

    try {
      localStorage.setItem('theme', theme);
      const root = document.documentElement;
      
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  }, [theme, isInitialized]);

  // Não renderizar nada até estar inicializado
  if (!isInitialized) {
    return null;
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
  };

  return <>{children}</>;
}