import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SystemSettings, getSystemSettings, updateSystemSettings } from '../services/systemSettings';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  systemSettings: SystemSettings;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const defaultSettings: SystemSettings = {
  id: '',
  light_header_color: '#ffffff',
  light_header_text_color: '#1e293b',
  light_footer_color: '#f8fafc',
  light_footer_text_color: '#1e293b',
  dark_header_color: '#001a41',
  dark_header_text_color: '#e2e8f0',
  dark_footer_color: '#001a41',
  dark_footer_text_color: '#e2e8f0',
  light_header_logo_url: '',
  dark_header_logo_url: '',
  light_footer_logo_url: '',
  dark_footer_logo_url: '',
  address: '',
  phone: '',
  email: '',
  quick_links_enabled: true,
  featured_logos_enabled: true,
  quick_links: [],
  featured_logos: []
};

// Thunks
export const fetchSystemSettings = createAsyncThunk(
  'theme/fetchSystemSettings',
  async () => {
    const response = await getSystemSettings();
    return response;
  }
);

export const updateSettings = createAsyncThunk(
  'theme/updateSettings',
  async (settings: Partial<SystemSettings>, { rejectWithValue }) => {
    try {
      const updatedSettings = await updateSystemSettings(settings);
      return updatedSettings;
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      return rejectWithValue(error);
    }
  }
);

const getInitialTheme = (): Theme => {
  try {
    const savedTheme = window.localStorage.getItem('theme') as Theme;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
  } catch {
    // Ignore errors
  }
  
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
};

const initialState: ThemeState = {
  theme: getInitialTheme(),
  systemSettings: defaultSettings,
  status: 'idle',
  error: null
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      console.log('setTheme:', action.payload);
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystemSettings.pending, (state) => {
        console.log('fetchSystemSettings.pending');
        state.status = 'loading';
      })
      .addCase(fetchSystemSettings.fulfilled, (state, action) => {
        console.log('fetchSystemSettings.fulfilled:', action.payload);
        state.status = 'succeeded';
        state.systemSettings = action.payload;
      })
      .addCase(fetchSystemSettings.rejected, (state, action) => {
        console.log('fetchSystemSettings.rejected:', action.error);
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(updateSettings.pending, (state) => {
        console.log('updateSettings.pending');
        state.status = 'loading';
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        console.log('updateSettings.fulfilled:', action.payload);
        state.status = 'succeeded';
        state.systemSettings = action.payload;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        console.log('updateSettings.rejected:', action.error);
        state.status = 'failed';
        state.error = action.error.message || null;
      });
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
