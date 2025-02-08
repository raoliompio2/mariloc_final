import React, { useState } from 'react';
import { FeaturedLogo } from '../../services/systemSettings';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/use-toast';

interface FeaturedLogosProps {
  enabled: boolean;
  logos: FeaturedLogo[];
  onToggle: (enabled: boolean) => void;
  onChange: (logos: FeaturedLogo[]) => void;
}

export function FeaturedLogos({ enabled = true, logos = [], onToggle, onChange }: FeaturedLogosProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleAddLogo = () => {
    const newLogo = {
      id: crypto.randomUUID(),
      title: '',
      image_url: '',
      order_index: logos.length
    };
    onChange([...logos, newLogo]);
  };

  const handleUpdateLogo = (index: number, updatedLogo: FeaturedLogo) => {
    const updatedLogos = [...logos];
    updatedLogos[index] = updatedLogo;
    onChange(updatedLogos);
  };

  const handleMoveLogo = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= logos.length) return;

    const updatedLogos = [...logos];
    [updatedLogos[index], updatedLogos[newIndex]] = [updatedLogos[newIndex], updatedLogos[index]];
    
    // Atualizar order_index
    updatedLogos.forEach((logo, i) => {
      logo.order_index = i;
    });
    
    onChange(updatedLogos);
  };

  const handleRemoveLogo = (index: number) => {
    const updatedLogos = logos.filter((_, i) => i !== index);
    // Atualizar order_index
    updatedLogos.forEach((logo, i) => {
      logo.order_index = i;
    });
    onChange(updatedLogos);
    toast({
      title: 'Logo Removido',
      description: 'O logo foi removido com sucesso!'
    });
  };

  const handleFileUpload = async (index: number, file: File) => {
    try {
      setIsUploading(true);
      const fileName = `${Date.now()}-${file.name}`;
      const fileBuffer = await file.arrayBuffer();
      
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, fileBuffer, {
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      const updatedLogos = [...logos];
      updatedLogos[index] = { ...logos[index], image_url: publicUrl };
      onChange(updatedLogos);
      toast({
        variant: 'success',
        title: 'Logo Adicionado',
        description: 'O logo foi adicionado com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao fazer upload do logo'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text">Logos em Destaque</h2>
          <div className="mt-2">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => onToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                {enabled ? 'Ativo' : 'Inativo'}
              </span>
            </label>
          </div>
        </div>
        <button
          onClick={handleAddLogo}
          disabled={!enabled || isUploading}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <span>+ Adicionar Logo</span>
          )}
        </button>
      </div>
      <div className="space-y-4">
        {logos.map((logo, index) => (
          <div key={logo.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-gray-400 text-sm font-medium">{index + 1}</span>
            <div className="flex-1 space-y-4">
              <input
                type="text"
                value={logo.title}
                onChange={(e) => handleUpdateLogo(index, { ...logo, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="Nome da Empresa/Marca"
                disabled={!enabled || isUploading}
              />
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id={`logo-upload-${logo.id}`}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(index, file);
                    }}
                    disabled={!enabled || isUploading}
                  />
                  <label
                    htmlFor={`logo-upload-${logo.id}`}
                    className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${
                      enabled ? 'hover:border-primary' : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {logo.image_url ? (
                      <img src={logo.image_url} alt={logo.title} className="max-h-full" />
                    ) : (
                      <div className="text-center">
                        <span className="block text-gray-400">Clique para fazer upload</span>
                        <span className="block text-sm text-gray-400">PNG, JPG até 5MB</span>
                      </div>
                    )}
                  </label>
                </div>
                <div className="flex flex-col justify-center gap-2">
                  <button
                    onClick={() => handleMoveLogo(index, 'up')}
                    disabled={index === 0 || !enabled || isUploading}
                    className="p-2 text-gray-400 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMoveLogo(index, 'down')}
                    disabled={index === logos.length - 1 || !enabled || isUploading}
                    className="p-2 text-gray-400 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => handleRemoveLogo(index)}
                    disabled={!enabled || isUploading}
                    className="p-2 text-red-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
