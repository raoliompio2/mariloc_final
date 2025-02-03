import React from 'react';

interface UnsavedChangesBarProps {
  onSave: () => void;
  onCancel: () => void;
}

export function UnsavedChangesBar({ onSave, onCancel }: UnsavedChangesBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-secondary border-t border-gray-200 dark:border-gray-700 p-4 z-50">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Você tem alterações não salvas
        </p>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
