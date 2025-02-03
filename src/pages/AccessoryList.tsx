import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Accessory } from '../types/accessory';

export function AccessoryList() {
  const navigate = useNavigate();
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAccessories();
  }, []);

  const loadAccessories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('accessories')
        .select(`
          *,
          accessory_machines!inner(
            machine:machines(
              id,
              name
            )
          )
        `)
        .eq('owner_id', user.id);

      if (error) throw error;

      const transformedData = (data || []).map(accessory => ({
        ...accessory,
        id: accessory.id,
        name: accessory.name,
        description: accessory.description,
        mainImageUrl: accessory.main_image_url,
        price: accessory.price,
        stock: accessory.stock,
        createdAt: accessory.created_at,
        machines: accessory.accessory_machines?.map((relation: any) => ({
          id: relation.machine.id,
          name: relation.machine.name
        }))
      }));

      setAccessories(transformedData);
    } catch (err) {
      console.error('Error loading accessories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este acessório?')) return;

    try {
      const { error } = await supabase
        .from('accessories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadAccessories();
    } catch (err) {
      console.error('Error deleting accessory:', err);
    }
  };

  const filteredAccessories = accessories.filter(accessory =>
    accessory.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const breadcrumbs = [
    { label: 'Painel', path: '/landlord-dashboard' },
    { label: 'Acessórios' }
  ];

  const actionButton = (
    <button
      onClick={() => navigate('/accessory/register')}
      className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 active:bg-primary/95 transform hover:-translate-y-0.5 transition-all duration-200"
    >
      <Plus className="h-5 w-5" />
      <span>Novo Acessório</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <AdminPageHeader
        title="Acessórios"
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
                  placeholder="Buscar acessórios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto"></div>
                <p className="mt-4 text-text">Carregando acessórios...</p>
              </div>
            ) : filteredAccessories.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-text">Nenhum acessório encontrado.</p>
                <p className="text-gray-500 mt-2">
                  {searchTerm ? 'Tente ajustar sua busca.' : 'Comece adicionando um novo acessório.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAccessories.map((accessory) => (
                  <div
                    key={accessory.id}
                    className="bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="relative h-48 bg-white dark:bg-gray-700 p-4">
                      {accessory.mainImageUrl ? (
                        <img
                          src={accessory.mainImageUrl}
                          alt={accessory.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-text mb-2">
                        {accessory.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                        {accessory.description || 'Sem descrição'}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white dark:bg-gray-700/50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Preço
                          </div>
                          <div className="text-lg font-semibold text-text">
                            R$ {accessory.price.toFixed(2)}
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-700/50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Estoque
                          </div>
                          <div className="text-lg font-semibold text-text">
                            {accessory.stock} un
                          </div>
                        </div>
                      </div>

                      {accessory.machines && accessory.machines.length > 0 && (
                        <div className="mb-6 flex flex-wrap gap-2">
                          {accessory.machines.map(machine => (
                            <span key={machine.id} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                              {machine.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => navigate(`/accessory/edit/${accessory.id}`)}
                          className="flex items-center px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors duration-200"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(accessory.id)}
                          className="flex items-center px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}