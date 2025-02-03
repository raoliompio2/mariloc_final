import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Upload } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { supabase } from '../lib/supabase';
import type { Machine } from '../types/machine';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { MachineSelector } from '../components/forms/MachineSelector';

export function AccessoryRegister() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMachines();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!mainImage) {
        throw new Error('Imagem principal é obrigatória');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Sanitizar nome do arquivo e converter para arrayBuffer
      const sanitizedMainImageName = mainImage.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const mainImageBuffer = await mainImage.arrayBuffer();
      const mainImagePath = `${Date.now()}-${sanitizedMainImageName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('accessory-images')
        .upload(mainImagePath, mainImageBuffer, {
          contentType: mainImage.type
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl: mainImageUrl } } = supabase.storage
        .from('accessory-images')
        .getPublicUrl(mainImagePath);

      // Criar o acessório
      const { data: accessoryData, error: accessoryError } = await supabase
        .from('accessories')
        .insert([
          {
            name,
            description,
            main_image_url: mainImageUrl,
            price: parseFloat(price),
            stock: parseInt(stock),
            owner_id: user.id
          }
        ])
        .select()
        .single();

      if (accessoryError) throw accessoryError;
      if (!accessoryData) throw new Error('Erro ao criar acessório');

      // Relacionar com as máquinas selecionadas
      if (selectedMachines.length > 0) {
        const machineRelations = selectedMachines.map(machineId => ({
          accessory_id: accessoryData.id,
          machine_id: machineId
        }));

        const { error: relationError } = await supabase
          .from('accessory_machines')
          .insert(machineRelations);

        if (relationError) throw relationError;
      }

      // Upload e registro das imagens da galeria
      const galleryPromises = galleryImages.map(async (file) => {
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const buffer = await file.arrayBuffer();
        const path = `${Date.now()}-${sanitizedFileName}`;
        
        const { error: galleryUploadError } = await supabase.storage
          .from('accessory-images')
          .upload(path, buffer, {
            contentType: file.type
          });

        if (galleryUploadError) throw galleryUploadError;

        const { data: { publicUrl: galleryUrl } } = supabase.storage
          .from('accessory-images')
          .getPublicUrl(path);
        
        return supabase
          .from('accessory_images')
          .insert([
            {
              accessory_id: accessoryData.id,
              image_url: galleryUrl,
              is_main: false
            }
          ]);
      });

      await Promise.all(galleryPromises);

      navigate('/accessories');
    } catch (err) {
      console.error('Error saving accessory:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar acessório');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = [
    { label: 'Painel', path: '/landlord-dashboard' },
    { label: 'Acessórios', path: '/accessories' },
    { label: 'Novo Acessório' }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <AdminPageHeader
        title="Novo Acessório"
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
                  <label className="relative flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, true)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
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
                          Selecionar imagem
                        </span>
                      </span>
                    )}
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Galeria de Imagens
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {galleryImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
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
                onClick={() => navigate('/client/accessories')}
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
                  'Salvar Acessório'
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