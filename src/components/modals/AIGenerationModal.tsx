import React, { useState } from 'react';
import { useAIGeneration } from '../../hooks/useAIGeneration';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Plus, X } from 'lucide-react';

interface AIGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (content: {
    description: string;
    mainSpecs: Array<{ label: string; value: string }>;
    otherSpecs: Array<{ label: string; value: string }>;
    category?: {
      main: string;
      sub?: string;
    };
  }) => void;
}

export function AIGenerationModal({ isOpen, onClose, onSuccess }: AIGenerationModalProps) {
  // Estados do formulário
  const [machineName, setMachineName] = useState('');
  const [brand, setBrand] = useState('');
  const [keywords, setKeywords] = useState<string[]>(['']);

  // Hook de geração
  const { loading, error, generateContent } = useAIGeneration({
    onSuccess: (content) => {
      onSuccess(content);
      handleClose();
    }
  });

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filtrar keywords vazias
    const filteredKeywords = keywords.filter(k => k.trim());
    
    await generateContent({
      machineName: machineName.trim(),
      brand: brand.trim(),
      keywords: filteredKeywords
    });
  };

  const handleAddKeyword = () => {
    setKeywords([...keywords, '']);
  };

  const handleRemoveKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleKeywordChange = (index: number, value: string) => {
    const newKeywords = [...keywords];
    newKeywords[index] = value;
    setKeywords(newKeywords);
  };

  const handleClose = () => {
    setMachineName('');
    setBrand('');
    setKeywords(['']);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Gerar Conteúdo com IA
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome da Máquina */}
          <div>
            <label htmlFor="machineName" className="block text-sm font-medium text-text mb-2">
              Nome da Máquina *
            </label>
            <input
              type="text"
              id="machineName"
              value={machineName}
              onChange={(e) => setMachineName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Ex: Escavadeira Hidráulica"
              required
              disabled={loading}
            />
          </div>

          {/* Marca */}
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-text mb-2">
              Marca
            </label>
            <input
              type="text"
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Ex: Caterpillar"
              disabled={loading}
            />
          </div>

          {/* Palavras-chave */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Palavras-chave
            </label>
            <div className="space-y-2">
              {keywords.map((keyword, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => handleKeywordChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Ex: construção pesada"
                    disabled={loading}
                  />
                  {keywords.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => handleRemoveKeyword(index)}
                      className="px-3 py-2"
                      disabled={loading}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                onClick={handleAddKeyword}
                className="w-full"
                disabled={loading}
              >
                <Plus className="h-5 w-5 mr-2" />
                Adicionar Palavra-chave
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !machineName.trim()}
            >
              {loading ? 'Gerando...' : 'Gerar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
