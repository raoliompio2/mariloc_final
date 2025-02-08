import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Upload, Plus } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { NewCategoryModal } from '../components/modals/NewCategoryModal';
import { supabase } from '../lib/supabase';
import { useUser } from '../hooks/useUser';
import { useToast } from '../hooks/use-toast';
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
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
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
    if (!userLoading) {
      if (!user) {
        navigate('/login');
        return;
      }

      // Verificar se o usuário é landlord
      const checkUserRole = async () => {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (profileError) throw profileError;
          
          if (profile?.role !== 'landlord') {
            toast({
              variant: 'destructive',
              title: 'Erro',
              description: 'Você não tem permissão para editar máquinas'
            });
            navigate('/');
            return;
          }

          // Se chegou aqui, o usuário está autenticado e é landlord
          if (id) {
            loadMachine();
            loadCategories();
          }
        } catch (err) {
          console.error('Erro ao verificar perfil:', err);
          toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Erro ao verificar permissões do usuário'
          });
          navigate('/');
        }
      };

      checkUserRole();
    }
  }, [id, user, userLoading, navigate]);

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
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao carregar dados da máquina'
      });
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
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao carregar categorias'
      });
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

      console.log('Dados técnicos para inserir:', technicalDataToUpsert);

      if (technicalDataToUpsert.length > 0) {
        // Primeiro, remove os dados técnicos antigos
        console.log('Removendo dados técnicos antigos...');
        const { error: deleteOldDataError } = await supabase
          .from('technical_data')
          .delete()
          .eq('machine_id', id);

        if (deleteOldDataError) {
          console.error('Erro ao remover dados antigos:', deleteOldDataError);
          throw deleteOldDataError;
        }

        console.log('Dados antigos removidos com sucesso');

        // Não precisamos verificar o usuário novamente aqui pois já verificamos no início
        // Depois, insira os novos dados
        console.log('Inserindo novos dados técnicos...');
        const { error: technicalDataError } = await supabase
          .from('technical_data')
          .insert(technicalDataToUpsert);

        if (technicalDataError) {
          console.error('Erro ao inserir dados técnicos:', technicalDataError);
          throw technicalDataError;
        }

        console.log('Dados técnicos inseridos com sucesso');
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

      toast({
        variant: 'success',
        title: 'Máquina Atualizada',
        description: 'As alterações foram salvas com sucesso!'
      });

      navigate('/machine/list');
    } catch (err) {
      console.error('Error updating machine:', err);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Erro ao atualizar máquina'
      });
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
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao processar imagem. Tente outro formato como PNG ou JPEG.'
      });
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
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao excluir imagem'
      });
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
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Editar Máquina</h1>
          <button
            onClick={() => navigate('/machine/list')}
            className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            Voltar
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Informações Básicas</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Máquina
                </label>
                <input
                  type="text"
                  value={machineName}
                  onChange={(e) => setMachineName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={machineDescription}
                  onChange={(e) => setMachineDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Categorias</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria Principal
                </label>
                <div className="flex gap-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria Secundária
                </label>
                <div className="flex gap-3">
                  <select
                    value={selectedSecondaryCategory}
                    onChange={(e) => setSelectedSecondaryCategory(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Data */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Dados Técnicos em Destaque</h2>
            <div className="space-y-4">
              {highlightData.map((data, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Rótulo"
                    value={data.label}
                    onChange={(e) => handleTechnicalDataChange(index, 'label', e.target.value, true)}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <input
                    type="text"
                    placeholder="Valor"
                    value={data.value}
                    onChange={(e) => handleTechnicalDataChange(index, 'value', e.target.value, true)}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeTechnicalData(index, true)}
                    className="p-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addTechnicalData(true)}
                className="mt-4 w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>Adicionar Dado em Destaque</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Outros Dados Técnicos</h2>
            <div className="space-y-4">
              {otherData.map((data, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Rótulo"
                    value={data.label}
                    onChange={(e) => handleTechnicalDataChange(index, 'label', e.target.value, false)}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <input
                    type="text"
                    placeholder="Valor"
                    value={data.value}
                    onChange={(e) => handleTechnicalDataChange(index, 'value', e.target.value, false)}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeTechnicalData(index, false)}
                    className="p-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addTechnicalData(false)}
                className="mt-4 w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>Adicionar Outro Dado</span>
              </button>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Imagens</h2>
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Imagem Principal
                </label>
                <div className="flex items-center gap-6">
                  {(currentMainImageUrl || mainImage) && (
                    <div className="relative group">
                      <img
                        src={mainImage ? URL.createObjectURL(mainImage) : currentMainImageUrl}
                        alt="Preview"
                        className="w-40 h-40 object-cover rounded-xl shadow-md"
                      />
                    </div>
                  )}
                  <label className="cursor-pointer group">
                    <div className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-colors duration-200 bg-gray-50 group-hover:bg-gray-100">
                      <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                      <span className="mt-2 text-sm text-gray-500 group-hover:text-blue-500 transition-colors duration-200">
                        {currentMainImageUrl || mainImage ? 'Trocar imagem' : 'Selecionar imagem'}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleImageChange(e, true)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Galeria de Imagens
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {currentGalleryUrls.map((url, index) => (
                    <div key={`current-${index}`} className="relative group">
                      <img
                        src={url}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-40 object-cover rounded-xl shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteGalleryImage(url)}
                        className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {galleryImages.map((image, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`New gallery ${index + 1}`}
                        className="w-full h-40 object-cover rounded-xl shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <label className="cursor-pointer group">
                    <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-colors duration-200 bg-gray-50 group-hover:bg-gray-100">
                      <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                      <span className="mt-2 text-sm text-gray-500 group-hover:text-blue-500 transition-colors duration-200">
                        Adicionar imagens
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={(e) => handleImageChange(e, false)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 sticky bottom-0 bg-white p-4 rounded-xl shadow-lg">
            <button
              type="button"
              onClick={() => navigate('/machine/list')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
              disabled={loading}
            >
              {loading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              )}
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
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