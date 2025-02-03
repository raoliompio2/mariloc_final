import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Machine, TechnicalData } from '../types/machine';
import { AdminPageHeader } from '../components/AdminPageHeader';

interface MachineWithTechnicalData extends Machine {
  technical_data?: TechnicalData[];
}

export function MachineList() {
  const navigate = useNavigate();
  const [machines, setMachines] = useState<MachineWithTechnicalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMachines();
  }, []);

  const loadMachines = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('machines')
        .select(`
          *,
          category:categories!machines_category_id_fkey(name),
          secondary_category:categories!machines_secondary_category_id_fkey(name),
          technical_data(*)
        `);

      if (error) {
        console.error('Error loading machines:', error);
      } else {
        const transformedData = (data || []).map(machine => ({
          ...machine,
          id: machine.id,
          name: machine.name,
          description: machine.description,
          mainImageUrl: machine.main_image_url,
          categoryId: machine.category_id,
          secondaryCategoryId: machine.secondary_category_id,
          ownerId: machine.owner_id,
          createdAt: machine.created_at,
          technical_data: machine.technical_data?.map(data => ({
            id: data.id,
            machineId: data.machine_id,
            label: data.label,
            value: data.value,
            isHighlight: data.is_highlight,
            createdAt: data.created_at
          }))
        }));
        setMachines(transformedData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta máquina?')) {
      const { error } = await supabase
        .from('machines')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting machine:', error);
      } else {
        loadMachines();
      }
    }
  };

  const filteredMachines = machines.filter(machine =>
    machine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const breadcrumbs = [
    { label: 'Painel', path: '/landlord-dashboard' },
    { label: 'Máquinas' }
  ];

  const actionButton = (
    <button
      onClick={() => navigate('/machine/register')}
      className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 active:bg-primary/95 transform hover:-translate-y-0.5 transition-all duration-200"
    >
      <Plus className="h-5 w-5" />
      <span>Nova Máquina</span>
    </button>
  );

  const renderTechnicalData = (technicalData?: TechnicalData[]) => {
    if (!technicalData || technicalData.length === 0) {
      return (
        <div className="h-[60px] flex items-center justify-center text-gray-400 text-sm">
          Sem dados técnicos
        </div>
      );
    }

    const highlightData = technicalData
      .filter(data => data.isHighlight)
      .slice(0, 4);

    if (highlightData.length === 0) {
      return (
        <div className="h-[60px] flex items-center justify-center text-gray-400 text-sm">
          Sem dados técnicos em destaque
        </div>
      );
    }

    return (
      <div className="h-[60px] bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 overflow-hidden">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {highlightData.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center text-sm whitespace-nowrap"
            >
              <span className="text-gray-500 dark:text-gray-400">
                {item.label}:
              </span>
              <span className="ml-1 font-medium text-text">
                {item.value}
              </span>
              {index < highlightData.length - 1 && (
                <span className="ml-4 text-gray-300 dark:text-gray-600">•</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <AdminPageHeader
        title="Máquinas Cadastradas"
        breadcrumbs={breadcrumbs}
        action={actionButton}
      />
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-secondary rounded-xl shadow-lg p-8">
            <div className="mb-8">
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar máquinas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto"></div>
                <p className="mt-4 text-text">Carregando máquinas...</p>
              </div>
            ) : filteredMachines.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-text">Nenhuma máquina encontrada.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMachines.map((machine) => (
                  <div
                    key={machine.id}
                    className="group bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-[500px]"
                  >
                    <div className="relative h-48 flex-shrink-0 p-4">
                      <div className="w-full h-full rounded-lg overflow-hidden">
                        {machine.mainImageUrl ? (
                          <img
                            src={machine.mainImageUrl}
                            alt={machine.name}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                            <Package className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-semibold text-text group-hover:text-primary transition-colors duration-200 mb-2">
                        {machine.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 min-h-[3em]">
                        {machine.description || 'Sem descrição'}
                      </p>
                      
                      <div className="flex-1 flex flex-col justify-end">
                        {renderTechnicalData(machine.technical_data)}

                        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => navigate(`/machine/edit/${machine.id}`)}
                            className="flex items-center px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors duration-200"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(machine.id)}
                            className="flex items-center px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}