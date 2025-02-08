import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Category } from '../../types/machine';
import { supabase } from '../../lib/supabase';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onCategoryAdded: (category: Category) => void;
}

export function CategoryModal({ isOpen, onClose, categories, onCategoryAdded }: CategoryModalProps) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedParentCategory, setSelectedParentCategory] = useState<string>('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const handleAddCategory = async () => {
    try {
      setIsAddingCategory(true);

      if (!newCategoryName.trim()) {
        throw new Error('Nome da categoria é obrigatório');
      }

      const { data: newCategory, error: categoryError } = await supabase
        .from('categories')
        .insert([
          {
            name: newCategoryName.trim(),
            parent_id: selectedParentCategory || null
          }
        ])
        .select('*')
        .single();

      if (categoryError) {
        throw categoryError;
      }

      onCategoryAdded(newCategory);
      setNewCategoryName('');
      setSelectedParentCategory('');
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      throw error;
    } finally {
      setIsAddingCategory(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Categoria</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={selectedParentCategory}
                onChange={(e) => setSelectedParentCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Categoria Principal</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    Subcategoria de {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da {selectedParentCategory ? 'Subcategoria' : 'Categoria'}
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder={`Digite o nome da ${selectedParentCategory ? 'subcategoria' : 'categoria'}`}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddCategory}
              disabled={isAddingCategory || !newCategoryName.trim()}
              className={`
                ${isAddingCategory || !newCategoryName.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
                flex items-center space-x-2
              `}
            >
              {isAddingCategory ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Salvando...</span>
                </>
              ) : (
                <span>Salvar</span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
