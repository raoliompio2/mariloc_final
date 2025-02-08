import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './use-toast';
import type { Category } from '../types/machine';

interface TechnicalDataInput {
  label: string;
  value: string;
}

interface UseMachineFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useMachineForm({ onSuccess, onError }: UseMachineFormProps = {}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [machineName, setMachineName] = useState('');
  const [machineDescription, setMachineDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSecondaryCategory, setSelectedSecondaryCategory] = useState('');
  const [highlightData, setHighlightData] = useState<TechnicalDataInput[]>([
    { label: '', value: '' },
    { label: '', value: '' },
    { label: '', value: '' },
    { label: '', value: '' },
    { label: '', value: '' }
  ]);
  const [otherData, setOtherData] = useState<TechnicalDataInput[]>([
    { label: '', value: '' }
  ]);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryImageUrls, setGalleryImageUrls] = useState<string[]>([]);

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImage(file);
      setMainImageUrl(URL.createObjectURL(file));
    }
  };

  const handleGalleryImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newGalleryImages = [...galleryImages, ...files];
    const newGalleryUrls = [
      ...galleryImageUrls,
      ...files.map(file => URL.createObjectURL(file))
    ];
    
    setGalleryImages(newGalleryImages);
    setGalleryImageUrls(newGalleryUrls);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
    setGalleryImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const addHighlightData = () => {
    if (highlightData.length < 5) {
      setHighlightData([...highlightData, { label: '', value: '' }]);
    }
  };

  const addOtherData = () => {
    setOtherData([...otherData, { label: '', value: '' }]);
  };

  const removeHighlightData = (index: number) => {
    setHighlightData(highlightData.filter((_, i) => i !== index));
  };

  const removeOtherData = (index: number) => {
    setOtherData(otherData.filter((_, i) => i !== index));
  };

  const handleSubmit = async (userId: string) => {
    setLoading(true);
    setError('');

    try {
      if (!machineName) throw new Error('Nome da máquina é obrigatório');
      if (!selectedCategory) throw new Error('Categoria principal é obrigatória');

      // Upload main image
      let mainImageUrl = '';
      if (mainImage) {
        const path = `${Date.now()}-${mainImage.name}`;
        const fileBuffer = await mainImage.arrayBuffer();
        const { error: uploadError } = await supabase.storage
          .from('machine-images')
          .upload(path, fileBuffer, {
            contentType: mainImage.type
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('machine-images')
          .getPublicUrl(path);

        mainImageUrl = publicUrl;
      }

      // Create machine
      const { data: machineData, error: machineError } = await supabase
        .from('machines')
        .insert({
          name: machineName,
          description: machineDescription,
          main_image_url: mainImageUrl,
          category_id: selectedCategory,
          secondary_category_id: selectedSecondaryCategory || null,
          owner_id: userId,
        })
        .select()
        .single();

      if (machineError) throw machineError;
      if (!machineData) throw new Error('Erro ao criar máquina');

      // Insert technical data
      const technicalDataToInsert = [
        ...highlightData
          .filter(data => data.label && data.value)
          .map(data => ({
            machine_id: machineData.id,
            label: data.label,
            value: data.value,
            is_highlight: true,
          })),
        ...otherData
          .filter(data => data.label && data.value)
          .map(data => ({
            machine_id: machineData.id,
            label: data.label,
            value: data.value,
            is_highlight: false,
          }))
      ];

      if (technicalDataToInsert.length > 0) {
        const { error: technicalDataError } = await supabase
          .from('technical_data')
          .insert(technicalDataToInsert);

        if (technicalDataError) throw technicalDataError;
      }

      // Upload gallery images
      if (galleryImages.length > 0) {
        const galleryUploads = galleryImages.map(async (file) => {
          const path = `${Date.now()}-${file.name}`;
          const fileBuffer = await file.arrayBuffer();
          await supabase.storage
            .from('machine-images')
            .upload(path, fileBuffer, {
              contentType: file.type
            });

          const { data: { publicUrl } } = supabase.storage
            .from('machine-images')
            .getPublicUrl(path);

          return {
            machine_id: machineData.id,
            image_url: publicUrl,
            is_main: false,
          };
        });

        const galleryUrls = await Promise.all(galleryUploads);
        const { error: galleryError } = await supabase
          .from('machine_images')
          .insert(galleryUrls);

        if (galleryError) throw galleryError;
      }

      toast({
        variant: 'success',
        title: 'Máquina Cadastrada',
        description: 'A máquina foi cadastrada com sucesso!'
      });

      onSuccess?.();
    } catch (err: any) {
      console.error('Error creating machine:', err);
      const errorMessage = err.message || 'Erro ao cadastrar máquina';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Erro ao cadastrar máquina. Por favor, tente novamente.'
      });
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    machineName,
    setMachineName,
    machineDescription,
    setMachineDescription,
    selectedCategory,
    setSelectedCategory,
    selectedSecondaryCategory,
    setSelectedSecondaryCategory,
    highlightData,
    setHighlightData,
    otherData,
    setOtherData,
    mainImage,
    mainImageUrl,
    galleryImages,
    galleryImageUrls,
    handleMainImageChange,
    handleGalleryImageChange,
    removeGalleryImage,
    addHighlightData,
    addOtherData,
    removeHighlightData,
    removeOtherData,
    handleSubmit,
  };
}
