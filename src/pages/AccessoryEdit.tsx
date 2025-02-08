import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Upload } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { supabase } from '../lib/supabase';
import type { Accessory, AccessoryImage } from '../types/accessory';
import type { Machine } from '../types/machine';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { MachineSelector } from '../components/forms/MachineSelector';

export function AccessoryEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessory, setAccessory] = useState<Accessory | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [currentMainImageUrl, setCurrentMainImageUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [currentGalleryUrls, setCurrentGalleryUrls] = useState<string[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      loadAccessory();
      loadMachines();
    }
  }, [id]);

  const loadAccessory = async () => {
    try {
      const { data: accessoryData, error: accessoryError } = await supabase
        .from('accessories')
        .select(`
          *,
          accessory_machines!inner(
            machine:machines(
              id,
              name
            )
          )
        `)
        .eq('id', id)
        .single();

      if (accessoryError) throw accessoryError;
      if (!accessoryData) throw new Error('Acessório não encontrado');

      const accessory: Accessory = {
        ...accessoryData,
        id: accessoryData.id,
        name: accessoryData.name,
        description: accessoryData.description,
        mainImageUrl: accessoryData.main_image_url,
        price: accessoryData.price,
        stock: accessoryData.stock,
        createdAt: accessoryData.created_at,
        machines: accessoryData.accessory_machines?.map((relation: any) => ({
          id: relation.machine.id,
          name: relation.machine.name
        }))
      };

      setAccessory(accessory);
      setName(accessory.name);
      setDescription(accessory.description);
      setPrice(accessory.price.toString());
      setStock(accessory.stock.toString());
      setCurrentMainImageUrl(accessory.mainImageUrl);
      setSelectedMachines(accessory.machines?.map(m => m.id) || []);

      // Load gallery images
      const { data: galleryData } = await supabase
        .from('accessory_images')
        .select('image_url')
        .eq('accessory_id', id)
        .eq('is_main', false);

      setCurrentGalleryUrls((galleryData || []).map((img: AccessoryImage) => img.image_url));
    } catch (err) {
      console.error('Error loading accessory:', err);
      setError('Erro ao carregar dados do acessório');
    } finally {
      setLoading(false);
    }
  };

  const loadMachines = async () => {
    try {
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .order('name');

      if (error) throw error;

      const transformedData = (data || []).map(machine => ({
        ...machine,
        id: machine.id,
        name: machine.name,
        description: machine.description,
        mainImageUrl: machine.main_image_url,
        categoryId: machine.category_id,
        secondaryCategoryId: machine.secondary_category_id,
        ownerId: machine.owner_id,
        createdAt: machine.created_at
      }));

      setMachines(transformedData);
    } catch (err) {
      console.error('Error loading machines:', err);
      setError('Erro ao carregar máquinas');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean) => {
    const files = e.target.files;
    if (!files) return;

    if (isMain) {
      setMainImage(files[0]);
    } else {
      setGalleryImages([...galleryImages, ...Array.from(files)]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  const handleDeleteGalleryImage = async (imageUrl: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta imagem?')) return;

    try {
      // Extract the file path from the URL
      const urlParts = imageUrl.split('/');
      const filePath = urlParts[urlParts.length - 1];

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('accessory-images')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('accessory_images')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!id) throw new Error('ID do acessório não encontrado');

      let mainImageUrl = currentMainImageUrl;
      if (mainImage) {
        const sanitizedFileName = mainImage.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const buffer = await mainImage.arrayBuffer();
        const path = `${Date.now()}-${sanitizedFileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('accessory-images')
          .upload(path, buffer, {
            contentType: mainImage.type
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('accessory-images')
          .getPublicUrl(path);

        mainImageUrl = publicUrl;
      }

      // Update accessory data
      const { error: updateError } = await supabase
        .from('accessories')
        .update({
          name,
          description,
          main_image_url: mainImageUrl,
          price: parseFloat(price),
          stock: parseInt(stock)
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Update machine relations
      await supabase
        .from('accessory_machines')
        .delete()
        .eq('accessory_id', id);

      if (selectedMachines.length > 0) {
        const machineRelations = selectedMachines.map(machineId => ({
          accessory_id: id,
          machine_id: machineId
        }));

        const { error: relationError } = await supabase
          .from('accessory_machines')
          .insert(machineRelations);

        if (relationError) throw relationError;
      }

      // Handle new gallery images
      for (const file of galleryImages) {
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const buffer = await file.arrayBuffer();
        const path = `${Date.now()}-${sanitizedFileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('accessory-images')
          .upload(path, buffer, {
            contentType: file.type
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('accessory-images')
          .getPublicUrl(path);

        await supabase
          .from('accessory_images')
          .insert([{
            accessory_id: id,
            image_url: publicUrl,
            is_main: false
          }]);
      }

      navigate('/accessory/list');
    } catch (err) {
      console.error('Error updating accessory:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar acessório');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = [
    { label: 'Painel', path: '/landlord/dashboard' },
    { label: 'Acessórios', path: '/accessory/list' },
    { label: 'Editar Acessório' }
  ];

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
      <AdminPageHeader
        title="Editar Acessório"
        breadcrumbs={breadcrumbs}
      />
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white dark:bg-secondary rounded-lg shadow-md p-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text mb-2">
                  Nome do Acessório
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-text mb-2">
                  Descrição
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-text mb-2">
                  Preço
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-text mb-2">
                  Estoque
                </label>
                <input
                  id="stock"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            {/* Machine Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-text mb-2">
                Máquinas Relacionadas
              </label>
              <MachineSelector
                machines={machines}
                selectedMachines={selectedMachines}
                onSelectionChange={setSelectedMachines}
              />
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
                        accept="image/*"
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
                        accept="image/*"
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
                onClick={() => navigate('/accessory/list')}
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
                  </> ) : (
                  'Salvar Alterações'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}