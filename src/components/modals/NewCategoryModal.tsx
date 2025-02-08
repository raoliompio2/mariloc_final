import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface NewCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (categoryId: string) => void;
}

export function NewCategoryModal({ isOpen, onClose, onSuccess }: NewCategoryModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

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

    try {
      setLoading(true);

      // Verifica se já existe uma categoria com este nome
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', name.trim())
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
        onSuccess(data.id);
        onClose();
        setName('');
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="relative">
          <DialogHeader className="sticky top-0 bg-white dark:bg-gray-800 z-10 pb-4 mb-4 border-b">
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Adicione uma nova categoria para suas máquinas
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
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
                placeholder="Ex: Betoneiras"
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