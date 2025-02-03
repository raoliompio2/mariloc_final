import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import type { Machine } from '../../types/machine';

interface MachineSelectorProps {
  machines: Machine[];
  selectedMachines: string[];
  onSelectionChange: (machines: string[]) => void;
}

export function MachineSelector({ machines, selectedMachines, onSelectionChange }: MachineSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [showSelector, setShowSelector] = useState(false);
  const itemsPerPage = 6;

  const filteredMachines = machines.filter(machine =>
    machine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMachines.length / itemsPerPage);
  const paginatedMachines = filteredMachines.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const selectedMachineDetails = machines.filter(machine => 
    selectedMachines.includes(machine.id)
  );

  const handleToggleMachine = (machineId: string) => {
    if (selectedMachines.includes(machineId)) {
      onSelectionChange(selectedMachines.filter(id => id !== machineId));
    } else {
      onSelectionChange([...selectedMachines, machineId]);
    }
  };

  const handleRemoveSelection = (machineId: string) => {
    onSelectionChange(selectedMachines.filter(id => id !== machineId));
  };

  return (
    <div className="space-y-4">
      {/* Selected Machines Display */}
      <div className="flex flex-wrap gap-2">
        {selectedMachineDetails.map(machine => (
          <div
            key={machine.id}
            className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
          >
            <span>{machine.name}</span>
            <button
              onClick={() => handleRemoveSelection(machine.id)}
              className="hover:text-red-500 transition-colors"
              title="Remover"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Machine Selector Button */}
      <button
        type="button"
        onClick={() => setShowSelector(!showSelector)}
        className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary/10 transition-colors"
      >
        {showSelector ? 'Fechar Seletor' : 'Selecionar Máquinas'}
      </button>

      {/* Machine Selector Panel */}
      {showSelector && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar máquinas..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
            />
          </div>

          {/* Machines Grid */}
          <div className="grid grid-cols-2 gap-3">
            {paginatedMachines.map(machine => (
              <label
                key={machine.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                  selectedMachines.includes(machine.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedMachines.includes(machine.id)}
                  onChange={() => handleToggleMachine(machine.id)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-text">{machine.name}</span>
              </label>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="px-3 py-1">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}