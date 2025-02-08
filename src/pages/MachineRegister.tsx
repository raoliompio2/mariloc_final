import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Upload, Plus } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { NewCategoryModal } from '../components/modals/NewCategoryModal';
import { supabase } from '../lib/supabase';
import { useUser } from '../hooks/useUser';
import { useMachineForm } from '../hooks/useMachineForm';
import { useToast } from '../hooks/use-toast';
import type { Category } from '../types/machine';

interface CategoryModalState {
  show: boolean;
  type: 'primary' | 'secondary';
}

// Components
const BasicInformation: React.FC<{
  machineName: string;
  setMachineName: (value: string) => void;
  machineDescription: string;
  setMachineDescription: (value: string) => void;
}> = ({ machineName, setMachineName, machineDescription, setMachineDescription }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
    <h2 className="text-2xl font-bold text-gray-800 mb-6">Informações Básicas</h2>
    
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Máquina</label>
        <input
          type="text"
          value={machineName}
          onChange={(e) => setMachineName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          required
          placeholder="Digite o nome da máquina"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
        <textarea
          value={machineDescription}
          onChange={(e) => setMachineDescription(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="Descreva as características principais da máquina"
        />
      </div>
    </div>
  </div>
);

const CategorySelection: React.FC<{
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedSecondaryCategory: string;
  setSelectedSecondaryCategory: (value: string) => void;
  onNewCategory: (type: 'primary' | 'secondary') => void;
}> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedSecondaryCategory,
  setSelectedSecondaryCategory,
  onNewCategory
}) => (
  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
    <h2 className="text-2xl font-bold text-gray-800 mb-6">Categorias</h2>
    
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Categoria Principal</label>
        <div className="flex gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onNewCategory('primary')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Categoria Secundária</label>
        <div className="flex gap-3">
          <select
            value={selectedSecondaryCategory}
            onChange={(e) => setSelectedSecondaryCategory(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onNewCategory('secondary')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const TechnicalDataSection: React.FC<{
  title: string;
  data: Array<{ label: string; value: string }>;
  onDataChange: (index: number, field: 'label' | 'value', value: string) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
  maxItems?: number;
}> = ({ title, data, onDataChange, onRemove, onAdd, maxItems }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
    <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="Rótulo"
            value={item.label}
            onChange={(e) => onDataChange(index, 'label', e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <input
            type="text"
            placeholder="Valor"
            value={item.value}
            onChange={(e) => onDataChange(index, 'value', e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
      {(!maxItems || data.length < maxItems) && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-4 w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Adicionar {title}</span>
        </button>
      )}
    </div>
  </div>
);

const ImageUpload: React.FC<{
  mainImageUrl: string;
  handleMainImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  galleryImageUrls: string[];
  handleGalleryImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeGalleryImage: (index: number) => void;
  onMainImageRemove: () => void;
}> = ({
  mainImageUrl,
  handleMainImageChange,
  galleryImageUrls,
  handleGalleryImageChange,
  removeGalleryImage,
  onMainImageRemove
}) => (
  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
    <h2 className="text-2xl font-bold text-gray-800 mb-6">Imagens</h2>
    
    <div className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">Imagem Principal</label>
        <div className="flex items-center gap-6">
          {mainImageUrl && (
            <div className="relative group">
              <img
                src={mainImageUrl}
                alt="Preview"
                className="w-40 h-40 object-cover rounded-xl shadow-md"
              />
              <button
                type="button"
                onClick={onMainImageRemove}
                className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <label className="cursor-pointer group">
            <div className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-colors duration-200 bg-gray-50 group-hover:bg-gray-100">
              <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
              <span className="mt-2 text-sm text-gray-500 group-hover:text-blue-500 transition-colors duration-200">
                Clique para upload
              </span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleMainImageChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">Galeria de Imagens</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {galleryImageUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Gallery ${index + 1}`}
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
              accept="image/*"
              onChange={handleGalleryImageChange}
              multiple
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  </div>
);

export function MachineRegister() {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState<CategoryModalState>({
    show: false,
    type: 'primary'
  });

  const {
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
    mainImageUrl,
    handleMainImageChange,
    galleryImageUrls,
    handleGalleryImageChange,
    removeGalleryImage,
    addHighlightData,
    addOtherData,
    removeHighlightData,
    removeOtherData,
    handleSubmit
  } = useMachineForm({
    onSuccess: () => {
      navigate('/machine/list');
      toast({
        variant: 'success',
        title: 'Máquina Cadastrada',
        description: 'A máquina foi cadastrada com sucesso!'
      });
    }
  });

  useEffect(() => {
    if (!userLoading) {
      if (!user) {
        navigate('/login');
        return;
      }

      const checkUserRole = async () => {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (profileError) throw profileError;
          
          if (profile?.role !== 'landlord') {
            navigate('/');
            return;
          }

          loadCategories();
        } catch (err) {
          console.error('Erro ao verificar perfil:', err);
          navigate('/');
        }
      };

      checkUserRole();
    }
  }, [user, userLoading, navigate]);

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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      try {
        await handleSubmit(user.id);
      } catch (err) {
        console.error('Error:', err);
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: err instanceof Error ? err.message : 'Erro ao cadastrar máquina'
        });
      }
    }
  };

  if (userLoading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cadastrar Nova Máquina</h1>
        
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <BasicInformation
            machineName={machineName}
            setMachineName={setMachineName}
            machineDescription={machineDescription}
            setMachineDescription={setMachineDescription}
          />

          <CategorySelection
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedSecondaryCategory={selectedSecondaryCategory}
            setSelectedSecondaryCategory={setSelectedSecondaryCategory}
            onNewCategory={(type) => setShowNewCategoryModal({ show: true, type })}
          />

          <TechnicalDataSection
            title="Dados Técnicos em Destaque"
            data={highlightData}
            onDataChange={(index, field, value) => {
              const newData = [...highlightData];
              newData[index] = { ...newData[index], [field]: value };
              setHighlightData(newData);
            }}
            onRemove={removeHighlightData}
            onAdd={addHighlightData}
            maxItems={5}
          />

          <TechnicalDataSection
            title="Outros Dados Técnicos"
            data={otherData}
            onDataChange={(index, field, value) => {
              const newData = [...otherData];
              newData[index] = { ...newData[index], [field]: value };
              setOtherData(newData);
            }}
            onRemove={removeOtherData}
            onAdd={addOtherData}
          />

          <ImageUpload
            mainImageUrl={mainImageUrl}
            handleMainImageChange={handleMainImageChange}
            galleryImageUrls={galleryImageUrls}
            handleGalleryImageChange={handleGalleryImageChange}
            removeGalleryImage={removeGalleryImage}
            onMainImageRemove={() => {
              setMachineName('');
              setMainImageUrl('');
            }}
          />

          <div className="flex justify-end gap-4 sticky bottom-0 bg-white p-4 rounded-xl shadow-lg">
            <button
              type="button"
              onClick={() => navigate('/machine/list')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
      
      {showNewCategoryModal.show && (
        <NewCategoryModal
          type={showNewCategoryModal.type}
          onClose={() => setShowNewCategoryModal({ show: false, type: 'primary' })}
          onSuccess={() => {
            setShowNewCategoryModal({ show: false, type: 'primary' });
            loadCategories();
          }}
        />
      )}
      
      <Footer />
    </div>
  );
}