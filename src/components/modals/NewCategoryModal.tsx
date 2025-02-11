import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface NewCategoryModalProps {
  show: boolean;
  type: 'primary' | 'secondary';
  onClose: () => void;
  onSuccess: () => void;
}

export function NewCategoryModal({ show, type, onClose, onSuccess }: NewCategoryModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [parentCategory, setParentCategory] = useState<string>('');
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);

  // Carrega categorias principais quando o modal é aberto e é do tipo secundário
  React.useEffect(() => {
    if (show && type === 'secondary') {
      loadPrimaryCategories();
    }
  }, [show, type]);

  const loadPrimaryCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .is('parent_id', null);

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível carregar as categorias principais'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Nome da categoria é obrigatório'
      });
      return;
    }

    if (type === 'secondary' && !parentCategory) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Selecione uma categoria principal'
      });
      return;
    }

    try {
      setLoading(true);

      // Verifica se já existe uma categoria com este nome
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', name.trim())
        .eq('parent_id', type === 'secondary' ? parentCategory : null)
        .maybeSingle();

      if (existing) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Já existe uma categoria com este nome'
        });
        return;
      }

      // Cria a nova categoria
      const { data, error } = await supabase
        .from('categories')
        .insert([{ 
          name: name.trim(),
          parent_id: type === 'secondary' ? parentCategory : null,
          type: type, // Adicionando o tipo da categoria
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        toast({
          variant: 'success',
          title: 'Categoria Criada',
          description: 'A categoria foi criada com sucesso!'
        });
        onSuccess();
        onClose();
        setName('');
        setParentCategory('');
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao criar categoria'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="relative">
          <DialogHeader className="sticky top-0 bg-white dark:bg-gray-800 z-10 pb-4 mb-4 border-b">
            <DialogTitle>Nova Categoria {type === 'secondary' ? 'Secundária' : 'Principal'}</DialogTitle>
            <DialogDescription>
              Adicione uma nova categoria {type === 'secondary' ? 'secundária' : 'principal'} para suas máquinas
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {type === 'secondary' && (
              <div className="space-y-2">
                <label 
                  htmlFor="parent" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Categoria Principal
                </label>
                <Select value={parentCategory} onValueChange={setParentCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria principal" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label 
                htmlFor="name" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Nome da Categoria
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={type === 'secondary' ? "Ex: Betoneira 400L" : "Ex: Betoneiras"}
                className="w-full"
              />
            </div>

            <DialogFooter className="sticky bottom-0 bg-white dark:bg-gray-800 z-10 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}