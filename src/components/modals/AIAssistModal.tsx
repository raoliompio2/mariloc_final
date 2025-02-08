import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AIFormData {
  machineName: string;
  brand: string;
  keyword1: string;
  keyword2: string;
}

interface AIAssistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: AIFormData) => Promise<void>;
  isLoading: boolean;
  error?: string;
}

export function AIAssistModal({ isOpen, onClose, onGenerate, isLoading, error }: AIAssistModalProps) {
  const [machineName, setMachineName] = useState('');
  const [brand, setBrand] = useState('');
  const [keyword1, setKeyword1] = useState('');
  const [keyword2, setKeyword2] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onGenerate({
        machineName,
        brand,
        keyword1,
        keyword2
      });
    } catch (error) {
      console.error('Error in AI generation:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-secondary rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-text">Cadastrar com IA</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="machineName" className="block text-sm font-medium text-text mb-1">
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
            <label htmlFor="brand" className="block text-sm font-medium text-text mb-1">
              Marca
            </label>
            <input
              id="brand"
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="keyword1" className="block text-sm font-medium text-text mb-1">
              Palavra-chave 1
            </label>
            <input
              id="keyword1"
              type="text"
              value={keyword1}
              onChange={(e) => setKeyword1(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
              placeholder="Ex: construção civil"
            />
            <p className="mt-1 text-sm text-gray-500">
              Principal área ou uso da máquina
            </p>
          </div>

          <div>
            <label htmlFor="keyword2" className="block text-sm font-medium text-text mb-1">
              Palavra-chave 2
            </label>
            <input
              id="keyword2"
              type="text"
              value={keyword2}
              onChange={(e) => setKeyword2(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
              placeholder="Ex: aluguel em São Paulo"
            />
            <p className="mt-1 text-sm text-gray-500">
              Localização ou característica específica
            </p>
          </div>

          {error && (
            <div className="text-red-500 text-sm mt-2">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`
                px-4 py-2 bg-primary text-white rounded-md
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
                flex items-center space-x-2
              `}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Gerando...</span>
                </>
              ) : (
                <span>Gerar com IA</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
