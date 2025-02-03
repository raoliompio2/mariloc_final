import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Upload, Plus } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { NewCategoryModal } from '../components/modals/NewCategoryModal';
import { supabase } from '../lib/supabase';
import type { Category, Machine, TechnicalData, MachineImage } from '../types/machine';

interface TechnicalDataInput {
  label: string;
  value: string;
}

interface CategoryModalState {
  show: boolean;
  type: 'primary' | 'secondary';
}

export function MachineEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [machine, setMachine] = useState<Machine | null>(null);
  const [machineName, setMachineName] = useState('');
  const [machineDescription, setMachineDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSecondaryCategory, setSelectedSecondaryCategory] = useState('');
  const [showNewCategoryModal, setShowNewCategoryModal] = useState<CategoryModalState>({
    show: false,
    type: 'primary'
  });
  const [highlightData, setHighlightData] = useState<TechnicalDataInput[]>([]);
  const [otherData, setOtherData] = useState<TechnicalDataInput[]>([]);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [currentMainImageUrl, setCurrentMainImageUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [currentGalleryUrls, setCurrentGalleryUrls] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      loadMachine();
      loadCategories();
    }
  }, [id]);

  const loadMachine = async () => {
    try {
      const { data: machineData, error: machineError } = await supabase
        .from('machines')
        .select(`
          *,
          technical_data (*)
        `)
        .eq('id', id)
        .single();

      if (machineError) throw machineError;
      if (!machineData) throw new Error('Máquina não encontrada');

      setMachine(machineData);
      setMachineName(machineData.name);
      setMachineDescription(machineData.description || '');
      setSelectedCategory(machineData.category_id);
      setSelectedSecondaryCategory(machineData.secondary_category_id || '');
      setCurrentMainImageUrl(machineData.main_image_url || '');

      // Load technical data
      const technicalData = machineData.technical_data || [];
      setHighlightData(
        technicalData
          .filter((data: TechnicalData) => data.is_highlight)
          .map((data: TechnicalData) => ({
            label: data.label,
            value: data.value,
          }))
      );
      setOtherData(
        technicalData
          .filter((data: TechnicalData) => !data.is_highlight)
          .map((data: TechnicalData) => ({
            label: data.label,
            value: data.value,
          }))
      );

      // Load gallery images
      const { data: galleryData } = await supabase
        .from('machine_images')
        .select('image_url')
        .eq('machine_id', id)
        .eq('is_main', false);

      setCurrentGalleryUrls((galleryData || []).map((img: MachineImage) => img.image_url));
    } catch (err) {
      console.error('Error loading machine:', err);
      setError('Erro ao carregar dados da máquina');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Erro ao carregar categorias');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!id) throw new Error('ID da máquina não encontrado');

      let mainImageUrl = currentMainImageUrl;
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

      // Update machine data
      const { error: updateError } = await supabase
        .from('machines')
        .update({
          name: machineName,
          description: machineDescription,
          main_image_url: mainImageUrl,
          category_id: selectedCategory,
          secondary_category_id: selectedSecondaryCategory || null,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Update technical data
      const technicalDataToUpsert = [
        ...highlightData.map(data => ({
          machine_id: id,
          label: data.label,
          value: data.value,
          is_highlight: true
        })),
        ...otherData.map(data => ({
          machine_id: id,
          label: data.label,
          value: data.value,
          is_highlight: false
        }))
      ];

      if (technicalDataToUpsert.length > 0) {
        // Primeiro, remove os dados técnicos antigos
        const { error: deleteOldDataError } = await supabase
          .from('technical_data')
          .delete()
          .eq('machine_id', id);

        if (deleteOldDataError) {
          console.error('Erro ao remover dados antigos:', deleteOldDataError);
          throw deleteOldDataError;
        }

        // Depois, insira os novos dados
        const { error: technicalDataError } = await supabase
          .from('technical_data')
          .insert(technicalDataToUpsert);

        if (technicalDataError) throw technicalDataError;
      }

      // Handle new gallery images
      for (const file of galleryImages) {
        const path = `${Date.now()}-${file.name}`;
        const fileBuffer = await file.arrayBuffer();
        const { error: uploadError } = await supabase.storage
          .from('machine-images')
          .upload(path, fileBuffer, {
            contentType: file.type
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('machine-images')
          .getPublicUrl(path);

        await supabase
          .from('machine_images')
          .insert([{
            machine_id: id,
            image_url: publicUrl,
            is_main: false
          }]);
      }

      navigate('/machines');
    } catch (err) {
      console.error('Error updating machine:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar máquina');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean) => {
    const files = e.target.files;
    if (!files) return;

    // Converter para PNG se for WebP
    const convertToPng = async (file: File): Promise<File> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".png", {
                type: 'image/png'
              });
              resolve(newFile);
            } else {
              reject(new Error('Failed to convert image'));
            }
          }, 'image/png');
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
      });
    };

    try {
      if (isMain) {
        const file = files[0];
        const processedFile = file.type === 'image/webp' ? await convertToPng(file) : file;
        setMainImage(processedFile);
      } else {
        const processedFiles = await Promise.all(
          Array.from(files).map(async (file) => 
            file.type === 'image/webp' ? await convertToPng(file) : file
          )
        );
        setGalleryImages(prev => [...prev, ...processedFiles]);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Erro ao processar imagem. Tente outro formato como PNG ou JPEG.');
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteGalleryImage = async (imageUrl: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta imagem?')) return;

    try {
      // Extract the file path from the URL
      const urlParts = imageUrl.split('/');
      const filePath = urlParts[urlParts.length - 1];

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('machine-images')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('machine_images')
        .delete()
        .eq('image_url', imageUrl);

      if (dbError) throw dbError;

      // Update UI
      setCurrentGalleryUrls(prev => prev.filter(url => url !== imageUrl));
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Erro ao excluir imagem');
    }
  };

  const handleTechnicalDataChange = (
    index: number,
    field: 'label' | 'value',
    value: string,
    isHighlight: boolean
  ) => {
    const dataArray = isHighlight ? highlightData : otherData;
    const setDataArray = isHighlight ? setHighlightData : setOtherData;
    
    const newData = [...dataArray];
    newData[index] = { ...newData[index], [field]: value };
    setDataArray(newData);
  };

  const addTechnicalData = (isHighlight: boolean) => {
    if (isHighlight) {
      setHighlightData(prev => [...prev, { label: '', value: '' }]);
    } else {
      setOtherData(prev => [...prev, { label: '', value: '' }]);
    }
  };

  const removeTechnicalData = (index: number, isHighlight: boolean) => {
    if (isHighlight) {
      setHighlightData(prev => prev.filter((_, i) => i !== index));
    } else {
      setOtherData(prev => prev.filter((_, i) => i !== index));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-text">
              Editar Máquina
            </h1>
            <button
              onClick={() => navigate('/machines')}
              className="px-4 py-2 text-text hover:text-primary transition-colors duration-200"
            >
              Voltar
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white dark:bg-secondary rounded-lg shadow-md p-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label htmlFor="machineName" className="block text-sm font-medium text-text mb-2">
                  Nome da Máquina
                </label>
                <input
                  id="machineName"
                  type="text"
                  value={machineName}
                  onChange={(e) => setMachineName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label htmlFor="machineDescription" className="block text-sm font-medium text-text mb-2">
                  Descrição
                </label>
                <textarea
                  id="machineDescription"
                  value={machineDescription}
                  onChange={(e) => setMachineDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  required
                />
              </div>
            </div>

            {/* Categories */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-text mb-4">
                Categorias
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-text mb-2">
                    Categoria Principal
                  </label>
                  <div className="flex gap-2">
                    <select
                      id="category"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories
                        .filter(cat => cat.type === 'primary')
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewCategoryModal({ show: true, type: 'primary' })}
                      className="flex items-center px-3 py-2 text-primary hover:bg-primary hover:bg-opacity-10 rounded-md"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="secondaryCategory" className="block text-sm font-medium text-text mb-2">
                    Categoria Secundária
                  </label>
                  <div className="flex gap-2">
                    <select
                      id="secondaryCategory"
                      value={selectedSecondaryCategory}
                      onChange={(e) => setSelectedSecondaryCategory(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories
                        .filter(cat => cat.type === 'secondary')
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewCategoryModal({ show: true, type: 'secondary' })}
                      className="flex items-center px-3 py-2 text-primary hover:bg-primary hover:bg-opacity-10 rounded-md"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Data */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-text mb-4">
                Dados Técnicos em Destaque
              </h3>
              {highlightData.map((data, index) => (
                <div key={index} className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Informação"
                      value={data.label}
                      onChange={(e) => handleTechnicalDataChange(index, 'label', e.target.value, true)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Valor"
                      value={data.value}
                      onChange={(e) => handleTechnicalDataChange(index, 'value', e.target.value, true)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTechnicalData(index, true)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addTechnicalData(true)}
                className="flex items-center text-primary hover:opacity-80"
              >
                <Plus className="h-5 w-5 mr-1" />
                Adicionar Dado Técnico
              </button>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium text-text mb-4">
                Outros Dados Técnicos
              </h3>
              {otherData.map((data, index) => (
                <div key={index} className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Informação"
                      value={data.label}
                      onChange={(e) => handleTechnicalDataChange(index, 'label', e.target.value, false)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Valor"
                      value={data.value}
                      onChange={(e) => handleTechnicalDataChange(index, 'value', e.target.value, false)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTechnicalData(index, false)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addTechnicalData(false)}
                className="flex items-center text-primary hover:opacity-80"
              >
                <Plus className="h-5 w-5 mr-1" />
                Adicionar Dado Técnico
              </button>
            </div>

            {/* Images */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-text mb-4">
                Imagens
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Imagem Principal
                  </label>
                  <div className="relative">
                    {currentMainImageUrl && !mainImage && (
                      <img
                        src={currentMainImageUrl}
                        alt="Current main"
                        className="w-full h-32 object-cover rounded-md mb-2"
                      />
                    )}
                    <label className="relative flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleImageChange(e, true)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {mainImage ? (
                        <img
                          src={URL.createObjectURL(mainImage)}
                          alt="Preview"
                          className="h-full object-contain"
                        />
                      ) : (
                        <span className="flex items-center space-x-2">
                          <Upload className="w-6 h-6 text-gray-600" />
                          <span className="font-medium text-gray-600">
                            {currentMainImageUrl ? 'Trocar imagem' : 'Selecionar imagem'}
                          </span>
                        </span>
                      )}
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Galeria de Imagens
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {currentGalleryUrls.map((url, index) => (
                      <div key={`current-${index}`} className="relative">
                        <img
                          src={url}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteGalleryImage(url)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          title="Excluir imagem"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {galleryImages.map((image, index) => (
                      <div key={`new-${index}`} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`New gallery ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          title="Remover imagem"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <label className="relative flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={(e) => handleImageChange(e, false)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="w-6 h-6 text-gray-600" />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/machines')}
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
                  'Salvar Alterações'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />

      <NewCategoryModal
        isOpen={showNewCategoryModal.show}
        type={showNewCategoryModal.type}
        onClose={() => setShowNewCategoryModal({ show: false, type: 'primary' })}
        onSuccess={() => {
          loadCategories();
          setShowNewCategoryModal({ show: false, type: 'primary' });
        }}
      />
    </div>
  );
}