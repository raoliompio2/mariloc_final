import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { RootState } from '../store/store';
import { updateSettings } from '../store/themeSlice';
import { SystemSettings } from '../services/systemSettings';
import { toast } from 'react-hot-toast';
import { ThemeSection } from '../components/settings/ThemeSection';
import { ContactInfo } from '../components/settings/ContactInfo';
import { QuickLinks } from '../components/settings/QuickLinks';
import { FeaturedLogos } from '../components/settings/FeaturedLogos';
import { UnsavedChangesBar } from '../components/settings/UnsavedChangesBar';
import { supabase } from '../lib/supabase';

export function Settings() {
  const dispatch = useDispatch();
  const systemSettings = useSelector((state: RootState) => state.theme.systemSettings);
  const status = useSelector((state: RootState) => state.theme.status);
  const [isUploading, setIsUploading] = useState(false);
  const [localSettings, setLocalSettings] = useState<SystemSettings>(systemSettings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (systemSettings) {
      setLocalSettings({
        ...systemSettings,
        address: systemSettings.address || '',
        phone: systemSettings.phone || '',
        email: systemSettings.email || ''
      });
    }
  }, [systemSettings]);

  const handleLocalChange = (key: string, value: any) => {
    console.log('Atualizando configuração:', key, value);
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    try {
      console.log('Salvando configurações:', localSettings);
      await dispatch(updateSettings(localSettings)).unwrap();
      setHasChanges(false);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configurações. Tente novamente.');
    }
  };

  const handleFileUpload = async (file: File, bucket: string) => {
    try {
      setIsUploading(true);
      const fileName = `${Date.now()}-${file.name}`;
      const fileBuffer = await file.arrayBuffer();
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, fileBuffer, {
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload da imagem');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleHeaderLogoUpload = async (file: File, theme: 'light' | 'dark') => {
    const url = await handleFileUpload(file, 'logos');
    if (url) {
      handleLocalChange(`${theme}_header_logo_url`, url);
    }
  };

  const handleFooterLogoUpload = async (file: File, theme: 'light' | 'dark') => {
    const url = await handleFileUpload(file, 'logos');
    if (url) {
      handleLocalChange(`${theme}_footer_logo_url`, url);
    }
  };

  const breadcrumbs = [
    { label: 'Painel', path: '/landlord-dashboard' },
    { label: 'Configurações' }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <AdminPageHeader
        title="Configurações do Sistema"
        breadcrumbs={breadcrumbs}
      />
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-secondary rounded-xl shadow-lg p-8">
            {status === 'loading' || isUploading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {hasChanges && (
                  <UnsavedChangesBar
                    onSave={handleSaveChanges}
                    onCancel={() => {
                      setLocalSettings(systemSettings);
                      setHasChanges(false);
                    }}
                  />
                )}

                <div className="space-y-12">
                  <ThemeSection
                    title="Tema Claro"
                    header_color={localSettings.light_header_color}
                    header_text_color={localSettings.light_header_text_color}
                    footer_color={localSettings.light_footer_color}
                    footer_text_color={localSettings.light_footer_text_color}
                    header_logo_url={localSettings.light_header_logo_url}
                    footer_logo_url={localSettings.light_footer_logo_url}
                    theme_prefix="light"
                    onColorChange={handleLocalChange}
                    onHeaderLogoUpload={(file) => handleHeaderLogoUpload(file, 'light')}
                    onFooterLogoUpload={(file) => handleFooterLogoUpload(file, 'light')}
                  />

                  <ThemeSection
                    title="Tema Escuro"
                    header_color={localSettings.dark_header_color}
                    header_text_color={localSettings.dark_header_text_color}
                    footer_color={localSettings.dark_footer_color}
                    footer_text_color={localSettings.dark_footer_text_color}
                    header_logo_url={localSettings.dark_header_logo_url}
                    footer_logo_url={localSettings.dark_footer_logo_url}
                    theme_prefix="dark"
                    onColorChange={handleLocalChange}
                    onHeaderLogoUpload={(file) => handleHeaderLogoUpload(file, 'dark')}
                    onFooterLogoUpload={(file) => handleFooterLogoUpload(file, 'dark')}
                  />

                  <ContactInfo
                    address={localSettings.address}
                    phone={localSettings.phone}
                    email={localSettings.email}
                    onChange={handleLocalChange}
                  />

                  <QuickLinks
                    enabled={localSettings.quick_links_enabled}
                    links={localSettings.quick_links || []}
                    onToggle={(enabled) => handleLocalChange('quick_links_enabled', enabled)}
                    onChange={(links) => handleLocalChange('quick_links', links)}
                  />

                  <FeaturedLogos
                    enabled={localSettings.featured_logos_enabled}
                    logos={localSettings.featured_logos || []}
                    onToggle={(enabled) => handleLocalChange('featured_logos_enabled', enabled)}
                    onChange={(logos) => handleLocalChange('featured_logos', logos)}
                    onUpload={handleFileUpload}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}