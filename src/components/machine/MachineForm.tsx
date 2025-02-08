import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Category, Subcategory, TechnicalData } from '../../types/machine';

interface MachineFormProps {
  categories: Category[];
  subcategories: Subcategory[];
  selectedCategory: string;
  selectedSubcategory: string;
  onCategorySelect: (id: string) => void;
  onSubcategorySelect: (id: string) => void;
  onAddCategory: () => void;
  onAddSubcategory: () => void;
  technicalData: TechnicalData[];
  onTechnicalDataChange: (index: number, field: 'label' | 'value', value: string) => void;
  onAddTechnicalData: () => void;
  onRemoveTechnicalData: (index: number) => void;
  machineName: string;
  onMachineNameChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  mainImageUrl: File | string | null;
  onMainImageUrlChange: (file: File | null) => void;
  galleryImages: File[];
  onGalleryImagesChange: (files: File[]) => void;
  isLoading?: boolean;
}

export function MachineForm({
  categories,
  subcategories,
  selectedCategory,
  selectedSubcategory,
  onCategorySelect,
  onSubcategorySelect,
  onAddCategory,
  onAddSubcategory,
  technicalData,
  onTechnicalDataChange,
  onAddTechnicalData,
  onRemoveTechnicalData,
  machineName,
  onMachineNameChange,
  description,
  onDescriptionChange,
  mainImageUrl,
  onMainImageUrlChange,
  galleryImages,
  onGalleryImagesChange,
  isLoading = false
}: MachineFormProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent, isMain: boolean) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    if (isMain) {
      onMainImageUrlChange(files[0]);
    } else {
      onGalleryImagesChange([...galleryImages, ...files]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean) => {
    const files = e.target.files;
    if (!files?.length) return;

    if (isMain) {
      onMainImageUrlChange(files[0]);
    } else {
      onGalleryImagesChange([...galleryImages, ...Array.from(files)]);
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm">
      <div className="space-y-6">
        {/* Informações Básicas */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="machineName" className="block text-sm font-medium text-text mb-2">
                Nome da Máquina *
              </label>
              <input
                type="text"
                id="machineName"
                value={machineName}
                onChange={(e) => onMachineNameChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Categorias */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Categorias</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-text mb-2">
                Categoria Principal *
              </label>
              <div className="flex items-center gap-2">
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => onCategorySelect(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  required
                  disabled={isLoading}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  onClick={onAddCategory}
                  className="flex items-center px-3 py-2"
                  disabled={isLoading}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div>
              <label htmlFor="subcategory" className="block text-sm font-medium text-text mb-2">
                Subcategoria
              </label>
              <div className="flex items-center gap-2">
                <select
                  id="subcategory"
                  value={selectedSubcategory}
                  onChange={(e) => onSubcategorySelect(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  disabled={isLoading}
                >
                  <option value="">Selecione uma subcategoria</option>
                  {subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  onClick={onAddSubcategory}
                  className="flex items-center px-3 py-2"
                  disabled={isLoading}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text mb-2">
            Descrição *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={4}
            required
            disabled={isLoading}
          />
        </div>

        {/* Imagens */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Imagens</h3>
          
          {/* Imagem Principal */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-text mb-2">
              Imagem Principal *
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center ${
                dragOver ? 'border-primary bg-primary/5' : 'border-gray-300'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, true)}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, true)}
                className="hidden"
                id="mainImage"
                disabled={isLoading}
              />
              <label
                htmlFor="mainImage"
                className="cursor-pointer block p-4 text-center"
              >
                {mainImageUrl ? (
                  typeof mainImageUrl === 'string' ? (
                    <img
                      src={mainImageUrl}
                      alt="Preview"
                      className="max-h-40 mx-auto"
                    />
                  ) : (
                    <img
                      src={URL.createObjectURL(mainImageUrl)}
                      alt="Preview"
                      className="max-h-40 mx-auto"
                    />
                  )
                ) : (
                  <div className="text-gray-500">
                    Arraste uma imagem ou clique para selecionar
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Galeria */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Galeria de Imagens
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-4 ${
                dragOver ? 'border-primary bg-primary/5' : 'border-gray-300'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, false)}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileChange(e, false)}
                className="hidden"
                id="galleryImages"
                disabled={isLoading}
              />
              <label
                htmlFor="galleryImages"
                className="cursor-pointer block p-4 text-center"
              >
                <div className="text-gray-500">
                  Arraste imagens ou clique para selecionar
                </div>
              </label>
            </div>
            {galleryImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {galleryImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => onGalleryImagesChange(galleryImages.filter((_, i) => i !== index))}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      disabled={isLoading}
                    >
                      <Plus className="h-4 w-4 transform rotate-45" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dados Técnicos */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Dados Técnicos</h3>
          <div className="space-y-4">
            {technicalData.map((data, index) => (
              <div key={index} className="flex gap-4 mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Nome da Especificação"
                    value={data.label}
                    onChange={(e) => onTechnicalDataChange(index, 'label', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Valor"
                    value={data.value}
                    onChange={(e) => onTechnicalDataChange(index, 'value', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveTechnicalData(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Plus className="h-5 w-5 transform rotate-45" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              onClick={onAddTechnicalData}
              className="w-full"
              disabled={isLoading}
            >
              Adicionar Especificação
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
