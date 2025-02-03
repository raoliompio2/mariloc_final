import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Edit, Trash2, Plus, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Category } from '../types/machine';
import { CategoryEditModal } from '../components/modals/CategoryEditModal';
import { AdminPageHeader } from '../components/AdminPageHeader';

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('type', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      
      const transformedData = (data || []).map(category => ({
        ...category,
        bannerUrl: category.banner_url,
        iconUrl: category.icon_url,
        createdAt: category.created_at
      }));
      
      setCategories(transformedData);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Erro ao excluir categoria');
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const renderCategoryList = (type: 'primary' | 'secondary') => {
    const filteredCategories = categories.filter(cat => cat.type === type);
    const title = type === 'primary' ? 'Categorias Principais' : 'Categorias Secundárias';

    return (
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <Tag className={`h-6 w-6 ${type === 'primary' ? 'text-blue-500' : 'text-purple-500'}`} />
          <h2 className="text-2xl font-bold text-text">{title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="group bg-white dark:bg-secondary rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="relative h-48 overflow-hidden">
                {category.bannerUrl ? (
                  <img
                    src={category.bannerUrl}
                    alt={category.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400">Sem banner</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden mr-4 flex-shrink-0 border-2 border-white dark:border-gray-700 shadow-md">
                    {category.iconUrl ? (
                      <img
                        src={category.iconUrl}
                        alt="Ícone"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400 text-xs">Sem ícone</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors duration-200">
                      {category.name}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {type === 'primary' ? 'Categoria Principal' : 'Categoria Secundária'}
                    </span>
                  </div>
                </div>
                <p className="text-text opacity-75 mb-6 line-clamp-2 min-h-[3em]">
                  {category.description || 'Sem descrição'}
                </p>
                <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors duration-200"
                    title="Editar categoria"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                    title="Excluir categoria"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const breadcrumbs = [
    { label: 'Painel', path: '/landlord-dashboard' },
    { label: 'Categorias' }
  ];

  const actionButton = (
    <button
      onClick={() => {
        setSelectedCategory(null);
        setShowEditModal(true);
      }}
      className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 active:bg-primary/95 transform hover:-translate-y-0.5 transition-all duration-200"
    >
      <Plus className="h-5 w-5" />
      <span>Nova Categoria</span>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <AdminPageHeader
          title="Gerenciar Categorias"
          breadcrumbs={breadcrumbs}
          action={actionButton}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <AdminPageHeader
        title="Gerenciar Categorias"
        breadcrumbs={breadcrumbs}
        action={actionButton}
      />
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          {renderCategoryList('primary')}
          {renderCategoryList('secondary')}
        </div>
      </div>
      <Footer />

      <CategoryEditModal
        isOpen={showEditModal}
        category={selectedCategory}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCategory(null);
        }}
        onSuccess={() => {
          loadCategories();
          setShowEditModal(false);
          setSelectedCategory(null);
        }}
      />
    </div>
  );
}