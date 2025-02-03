import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { RootState } from '../store/store';
import { fetchSystemSettings } from '../store/themeSlice';
import Cookies from 'js-cookie';

interface SystemSettings {
  // Cores do tema (modo claro)
  light_header_color: string;
  light_header_text_color: string;
  light_footer_color: string;
  light_footer_text_color: string;
  
  // Cores do tema (modo escuro)
  dark_header_color: string;
  dark_header_text_color: string;
  dark_footer_color: string;
  dark_footer_text_color: string;
  
  // Logos
  light_header_logo_url: string;
  dark_header_logo_url: string;
  light_footer_logo_url: string;
  dark_footer_logo_url: string;
}

const defaultSettings: SystemSettings = {
  // Cores do tema (modo claro)
  light_header_color: '#ffffff',
  light_header_text_color: '#1e293b',
  light_footer_color: '#f8fafc',
  light_footer_text_color: '#1e293b',
  
  // Cores do tema (modo escuro)
  dark_header_color: '#001a41',
  dark_header_text_color: '#e2e8f0',
  dark_footer_color: '#001a41',
  dark_footer_text_color: '#e2e8f0',
  
  // Logos
  light_header_logo_url: '',
  dark_header_logo_url: '',
  light_footer_logo_url: '',
  dark_footer_logo_url: '',
};

const loadSettingsFromStorage = (): SystemSettings => {
  try {
    // Primeiro tenta ler do localStorage
    const localSettings = localStorage.getItem('system-settings');
    if (localSettings) {
      return { ...defaultSettings, ...JSON.parse(localSettings) };
    }
    
    // Se não encontrar no localStorage, tenta cookies
    const cookieSettings = Cookies.get('system-settings');
    if (cookieSettings) {
      return { ...defaultSettings, ...JSON.parse(cookieSettings) };
    }
  } catch {
    // Ignore parsing errors
  }
  return defaultSettings;
};

export function useSystemSettings() {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.theme.systemSettings);
  const status = useSelector((state: RootState) => state.theme.status);
  const error = useSelector((state: RootState) => state.theme.error);

  useEffect(() => {
    // Carregar configurações apenas se ainda não foram carregadas
    if (status === 'idle') {
      dispatch(fetchSystemSettings());
    }
  }, [dispatch, status]);

  // Forçar uma atualização das configurações
  const refreshSettings = () => {
    dispatch(fetchSystemSettings());
  };

  return { settings: settings || defaultSettings, status, error, refreshSettings };
}