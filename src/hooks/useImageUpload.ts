import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function useImageUpload() {
  const uploadImage = async (file: File, path: string): Promise<string> => {
    try {
      // Verificar tamanho do arquivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Imagem muito grande. O tamanho máximo é 5MB.');
      }

      // Verificar tipo do arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Arquivo inválido. Apenas imagens são permitidas.');
      }

      const { error: uploadError } = await supabase.storage
        .from('machine-images')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('machine-images')
        .getPublicUrl(path);

      return publicUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      throw new Error('Falha ao fazer upload da imagem. Por favor, tente novamente.');
    }
  };

  return { uploadImage };
}