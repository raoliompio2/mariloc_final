import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Category } from '../../types/machine';

interface CategoryEditModalProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CategoryEditModal({ isOpen, category, onClose, onSuccess }: CategoryEditModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'primary' | 'secondary'>('primary');
  const [banner, setBanner] = useState<File | null>(null);
  const [icon, setIcon] = useState<File | null>(null);
  const [currentBannerUrl, setCurrentBannerUrl] = useState('');
  const [currentIconUrl, setCurrentIconUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || '');
      setType(category.type);
      setCurrentBannerUrl(category.bannerUrl || '');
      setCurrentIconUrl(category.iconUrl || '');
    } else {
      setName('');
      setDescription('');
      setType('primary');
      setCurrentBannerUrl('');
      setCurrentIconUrl('');
    }
    setBanner(null);
    setIcon(null);
  }, [category]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isBanner: boolean) => {
    const files = e.target.files;
    if (!files) return;

    if (isBanner) {
      setBanner(files[0]);
    } else {
      setIcon(files[0]);
    }
  };

  const sanitizeFileName = (fileName: string): string => {
    return fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[×]/g, 'x') // Substituir × por x
      .replace(/[^a-zA-Z0-9.-]/g, '-') // Substituir caracteres especiais por hífen
      .toLowerCase();
  };

  const uploadImage = async (file: File, path: string): Promise<string> => {
    try {
      const sanitizedPath = sanitizeFileName(path);
      const fileBuffer = await file.arrayBuffer();
      
      const { error: uploadError } = await supabase.storage
        .from('category-images')
        .upload(sanitizedPath, fileBuffer, {
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('category-images')
        .getPublicUrl(sanitizedPath);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let bannerUrl = currentBannerUrl;
      let iconUrl = currentIconUrl;

      if (banner) {
        const bannerPath = `${Date.now()}-banner-${sanitizeFileName(banner.name)}`;
        bannerUrl = await uploadImage(banner, bannerPath);
      }

      if (icon) {
        const iconPath = `${Date.now()}-icon-${sanitizeFileName(icon.name)}`;
        iconUrl = await uploadImage(icon, iconPath);
      }

      const categoryData = {
        name,
        description,
        type,
        banner_url: bannerUrl,
        icon_url: iconUrl,
      };

      if (category) {
        const { error: updateError } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', category.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('categories')
          .insert([categoryData]);

        if (insertError) throw insertError;
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving category:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar categoria');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-text">
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Tipo de Categoria
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'primary' | 'secondary')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                required
              >
                <option value="primary">Principal</option>
                <option value="secondary">Secundária</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Nome da Categoria
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Banner
              </label>
              <div className="relative">
                {(currentBannerUrl || banner) && (
                  <img
                    src={banner ? URL.createObjectURL(banner) : currentBannerUrl}
                    alt="Banner preview"
                    className="w-full h-48 object-cover rounded-md mb-2"
                  />
                )}
                <label className="relative flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, true)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center space-x-2">
                    <Upload className="w-6 h-6 text-gray-600" />
                    <span className="font-medium text-gray-600">
                      {currentBannerUrl || banner ? 'Trocar banner' : 'Upload do banner'}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Ícone
              </label>
              <div className="relative">
                {(currentIconUrl || icon) && (
                  <img
                    src={icon ? URL.createObjectURL(icon) : currentIconUrl}
                    alt="Icon preview"
                    className="w-20 h-20 object-cover rounded-full mb-2"
                  />
                )}
                <label className="relative flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, false)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center space-x-2">
                    <Upload className="w-6 h-6 text-gray-600" />
                    <span className="font-medium text-gray-600">
                      {currentIconUrl || icon ? 'Trocar ícone' : 'Upload do ícone'}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 disabled:opacity-50 flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}