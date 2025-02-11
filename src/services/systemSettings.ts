import axios from 'axios';
import { supabase } from '../lib/supabase';

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface FeaturedLogo {
  id: string;
  title: string;
  image_url: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface SystemSettings {
  id: string;
  light_header_color: string;
  light_header_text_color: string;
  light_footer_color: string;
  light_footer_text_color: string;
  dark_header_color: string;
  dark_header_text_color: string;
  dark_footer_color: string;
  dark_footer_text_color: string;
  light_header_logo_url: string;
  light_footer_logo_url: string;
  dark_header_logo_url: string;
  dark_footer_logo_url: string;
  address: string;
  phone: string;
  email: string;
  quick_links_enabled: boolean;
  featured_logos_enabled: boolean;
  created_at?: string;
  updated_at?: string;
  quick_links?: QuickLink[];
  featured_logos?: FeaturedLogo[];
}

export const defaultSettings: SystemSettings = {
  id: '',
  light_header_color: '#001a41',
  light_header_text_color: '#ffffff',
  light_footer_color: '#001a41',
  light_footer_text_color: '#ffffff',
  dark_header_color: '#001a41',
  dark_header_text_color: '#ffffff',
  dark_footer_color: '#001a41',
  dark_footer_text_color: '#ffffff',
  light_header_logo_url: '',
  light_footer_logo_url: '',
  dark_header_logo_url: '',
  dark_footer_logo_url: '',
  address: '',
  phone: '',
  email: '',
  quick_links_enabled: true,
  featured_logos_enabled: true,
  quick_links: [],
  featured_logos: []
};

// Função para garantir que os arrays existam
export const ensureArrays = (settings: SystemSettings): SystemSettings => {
  return {
    ...settings,
    quick_links: settings.quick_links || [],
    featured_logos: settings.featured_logos || []
  };
};

const API_URL = import.meta.env.VITE_API_URL || '';

// Mock da API para desenvolvimento
export const getSystemSettings = async (): Promise<SystemSettings> => {
  try {
    console.log('Buscando configurações do Supabase...');
    
    // First try to get existing settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('system_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (settingsError) {
      if (settingsError.code === 'PGRST116') {
        console.log('Nenhuma configuração encontrada, usando padrão:', defaultSettings);
        return defaultSettings;
      }
      throw new Error('Erro ao buscar configurações');
    }

    // If we found settings, get the related data
    if (settingsData) {
      // Get quick links
      const { data: quickLinksData, error: quickLinksError } = await supabase
        .from('quick_links')
        .select('*')
        .eq('system_settings_id', settingsData.id)
        .order('order_index');

      if (quickLinksError) {
        throw new Error('Erro ao buscar quick links');
      }

      // Get featured logos
      const { data: featuredLogosData, error: featuredLogosError } = await supabase
        .from('featured_logos')
        .select('*')
        .eq('system_settings_id', settingsData.id)
        .order('order_index');

      if (featuredLogosError) {
        throw new Error('Erro ao buscar featured logos');
      }

      // Combine all data
      const completeSettings: SystemSettings = {
        ...settingsData,
        quick_links: quickLinksData || [],
        featured_logos: featuredLogosData || []
      };

      console.log('Configurações encontradas:', completeSettings);
      return completeSettings;
    }

    console.log('Nenhuma configuração encontrada, usando padrão:', defaultSettings);
    return defaultSettings;
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    throw error;
  }
};

export const updateSystemSettings = async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
  try {
    console.log('Atualizando configurações:', settings);
    
    // Remover propriedades de relacionamento antes de atualizar
    const { quick_links, featured_logos, ...settingsToSave } = settings;

    // Primeiro, buscar ou criar configurações
    let { data: existingSettings, error: getError } = await supabase
      .from('system_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (getError) {
      throw new Error('Erro ao buscar configurações');
    }

    let settingsId: string;

    if (!existingSettings) {
      // Criar novas configurações
      const { data: newSettings, error: createError } = await supabase
        .from('system_settings')
        .insert([{
          ...defaultSettings,
          ...settingsToSave
        }])
        .select()
        .single();

      if (createError) {
        throw new Error('Erro ao criar configurações');
      }

      settingsId = newSettings.id;
    } else {
      // Atualizar configurações existentes
      const { data: updatedSettings, error: updateError } = await supabase
        .from('system_settings')
        .update(settingsToSave)
        .eq('id', existingSettings.id)
        .select()
        .single();

      if (updateError) {
        throw new Error('Erro ao atualizar configurações');
      }

      settingsId = existingSettings.id;
    }

    // Atualizar quick links se fornecidos
    if (quick_links) {
      // Deletar links existentes
      const { error: deleteLinksError } = await supabase
        .from('quick_links')
        .delete()
        .eq('system_settings_id', settingsId);

      if (deleteLinksError) {
        throw new Error('Erro ao deletar quick links existentes');
      }

      // Inserir novos links
      if (quick_links.length > 0) {
        const { error: insertLinksError } = await supabase
          .from('quick_links')
          .insert(
            quick_links.map((link, index) => ({
              ...link,
              system_settings_id: settingsId,
              order_index: index
            }))
          );

        if (insertLinksError) {
          throw new Error('Erro ao inserir novos quick links');
        }
      }
    }

    // Atualizar featured logos se fornecidos
    if (featured_logos) {
      // Deletar logos existentes
      const { error: deleteLogosError } = await supabase
        .from('featured_logos')
        .delete()
        .eq('system_settings_id', settingsId);

      if (deleteLogosError) {
        throw new Error('Erro ao deletar featured logos existentes');
      }

      // Inserir novos logos
      if (featured_logos.length > 0) {
<<<<<<< HEAD
        // Remover campos que não devem ser inseridos e adicionar system_settings_id
        const logosToInsert = featured_logos.map((logo, index) => {
          const { id, created_at, updated_at, ...rest } = logo;
          return {
            ...rest,
            system_settings_id: settingsId,
            order_index: index
          };
        });

        const { error: insertLogosError } = await supabase
          .from('featured_logos')
          .insert(logosToInsert);

        if (insertLogosError) {
          console.error('Erro ao inserir logos:', insertLogosError);
=======
        const { error: insertLogosError } = await supabase
          .from('featured_logos')
          .insert(
            featured_logos.map((logo, index) => ({
              ...logo,
              system_settings_id: settingsId,
              order_index: index
            }))
          );

        if (insertLogosError) {
>>>>>>> d8ec9daea160d7b61a92eea80aabbc97adf1aa76
          throw new Error('Erro ao inserir novos featured logos');
        }
      }
    }

    // Buscar configurações atualizadas
    return await getSystemSettings();
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    throw error;
  }
};

export const saveSystemSettings = async (settings: Partial<SystemSettings>) => {
  try {
    // Primeiro, buscar o registro existente
    const { data: existingSettings, error: fetchError } = await supabase
      .from('system_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error('Erro ao buscar configurações');
    }

    // Remover campos undefined/null
    const cleanSettings = Object.fromEntries(
      Object.entries(settings).filter(([_, value]) => value !== undefined && value !== null)
    );

    if (existingSettings?.id) {
      // Se existe, atualiza
      const { data, error } = await supabase
        .from('system_settings')
        .update(cleanSettings)
        .eq('id', existingSettings.id)
        .select()
        .single();

      if (error) {
        throw new Error('Erro ao atualizar configurações');
      }

      return ensureArrays(data);
    } else {
      // Se não existe, insere com valores padrão
      const defaultSettings: SystemSettings = {
        light_header_color: '#001a41',
        light_header_text_color: '#ffffff',
        light_footer_color: '#001a41',
        light_footer_text_color: '#ffffff',
        dark_header_color: '#001a41',
        dark_header_text_color: '#ffffff',
        dark_footer_color: '#001a41',
        dark_footer_text_color: '#ffffff',
        light_header_logo_url: '',
        light_footer_logo_url: '',
        dark_header_logo_url: '',
        dark_footer_logo_url: '',
        address: '',
        phone: '',
        email: '',
        quick_links_enabled: true,
        featured_logos_enabled: true,
        quick_links: [],
        featured_logos: []
      };

      const { data, error } = await supabase
        .from('system_settings')
        .insert({ ...defaultSettings, ...cleanSettings })
        .select()
        .single();

      if (error) {
        throw new Error('Erro ao inserir configurações');
      }

      return ensureArrays(data);
    }
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    throw error;
  }
};

export const loadSystemSettings = async (): Promise<SystemSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Nenhum registro encontrado, retornar configurações padrão
        const defaultSettings: SystemSettings = {
          light_header_color: '#001a41',
          light_header_text_color: '#ffffff',
          light_footer_color: '#001a41',
          light_footer_text_color: '#ffffff',
          dark_header_color: '#001a41',
          dark_header_text_color: '#ffffff',
          dark_footer_color: '#001a41',
          dark_footer_text_color: '#ffffff',
          light_header_logo_url: '',
          light_footer_logo_url: '',
          dark_header_logo_url: '',
          dark_footer_logo_url: '',
          address: '',
          phone: '',
          email: '',
          quick_links_enabled: true,
          featured_logos_enabled: true,
          quick_links: [],
          featured_logos: []
        };

        return defaultSettings;
      }

      throw new Error('Erro ao carregar configurações');
    }

    return ensureArrays(data);
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    throw error;
  }
};

// Upload de logos
export const uploadLogo = async (file: File, type: string): Promise<string> => {
  try {
    console.log('Iniciando upload do logo:', { type, fileName: file.name });
    const fileExt = file.name.split('.').pop();
    const fileName = `${type}_${Date.now()}.${fileExt}`;

    // Primeiro, verificar se o bucket existe e é público
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();

    console.log('Buckets:', buckets);

    const logosBucket = buckets?.find(b => b.id === 'logos');
    if (!logosBucket) {
      throw new Error('Bucket logos não encontrado');
    }

    if (!logosBucket.public) {
      throw new Error('Bucket logos não está público');
    }

    // Fazer o upload
    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type // Importante: definir o tipo do conteúdo
      });

    if (uploadError) {
      throw new Error('Erro ao fazer upload do logo');
    }

    // Obter a URL pública do arquivo
    const { data } = supabase.storage
      .from('logos')
      .getPublicUrl(fileName);

    if (!data?.publicUrl) {
      throw new Error('URL pública não gerada');
    }

    // Verificar se o arquivo está acessível
    try {
      const response = await fetch(data.publicUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Arquivo não está acessível: ${response.status}`);
      }
    } catch (error) {
      throw new Error('Erro ao verificar acesso ao arquivo');
    }

    console.log('Logo enviado com sucesso:', { fileName, url: data.publicUrl });
    return data.publicUrl;
  } catch (error) {
    console.error('Erro ao fazer upload do logo:', error);
    throw error;
  }
};

export const updateLogo = async (file: File, type: string) => {
  const formData = new FormData();
  formData.append('logo', file);
  const response = await axios.post(`${API_URL}/api/system-settings/logo`, formData);
  return response.data;
};

export const patchSystemSettings = async (currentSettings: SystemSettings, settings: Partial<SystemSettings>) => {
  try {
    // Primeiro, buscar o registro existente
    const { data: existingSettings } = await supabase
      .from('system_settings')
      .select('*')
      .limit(1)
      .single();

    if (existingSettings) {
      // Se existe, atualiza
      const { error } = await supabase
        .from('system_settings')
        .update(settings)
        .eq('id', existingSettings.id);

      if (error) {
        throw new Error('Erro ao atualizar configurações');
      }
    } else {
      // Se não existe, insere
      const { error } = await supabase
        .from('system_settings')
        .insert({ ...currentSettings, ...settings });

      if (error) {
        throw new Error('Erro ao inserir configurações');
      }
    }
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    throw error;
  }
};

// Função para testar a inserção de dados
export const testSystemSettings = async () => {
  try {
    const settings: Partial<SystemSettings> = {
      company_name: "Empresa Teste",
      address: "Endereço Teste",
      phone: "(11) 1234-5678",
      email: "teste@empresa.com",
      quick_links: [
        { title: "Link 1", url: "https://exemplo1.com" },
        { title: "Link 2", url: "https://exemplo2.com" }
      ],
      featured_logos: [
        { title: "Logo 1", image_url: "https://exemplo1.com/logo.png" },
        { title: "Logo 2", image_url: "https://exemplo2.com/logo.png" }
      ]
    };

    const result = await updateSystemSettings(settings);
    console.log('Configurações de teste inseridas com sucesso:', result);
    return result;
  } catch (error) {
    console.error('Erro ao inserir configurações de teste:', error);
    throw error;
  }
};
