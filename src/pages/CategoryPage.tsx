import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '../components/Navbar';
import { supabase } from '../lib/supabase';
import { CategoryHero } from '../components/product/CategoryHero';
import { CatalogProductCard } from '../components/product/CatalogProductCard';
import type { Machine, Category } from '../types/machine';

export function CategoryPage() {
  const { categorySlug } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategoryAndMachines();
  }, [categorySlug]);

  const loadCategoryAndMachines = async () => {
    try {
      // Carregar categoria
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', categorySlug)
        .single();

      if (categoryError) throw categoryError;
      if (!categoryData) throw new Error('Categoria não encontrada');

      const category: Category = {
        ...categoryData,
        id: categoryData.id,
        name: categoryData.name,
        description: categoryData.description || '',
        bannerUrl: categoryData.banner_url || '',
        iconUrl: categoryData.icon_url || '',
        type: categoryData.type,
        createdAt: categoryData.created_at
      };

      setCategory(category);

      // Carregar máquinas da categoria
      const { data: machinesData, error: machinesError } = await supabase
        .from('machines')
        .select(`
          *,
          technical_data(*)
        `)
        .or(`category_id.eq.${category.id},secondary_category_id.eq.${category.id}`);

      if (machinesError) throw machinesError;

      const machines = (machinesData || []).map(machine => ({
        ...machine,
        id: machine.id,
        name: machine.name,
        description: machine.description,
        mainImageUrl: machine.main_image_url,
        categoryId: machine.category_id,
        secondaryCategoryId: machine.secondary_category_id,
        ownerId: machine.owner_id,
        createdAt: machine.created_at
      }));

      setMachines(machines);
    } catch (err) {
      console.error('Error loading category and machines:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text mb-4">Categoria não encontrada</h1>
            <Link to="/catalogo-de-produtos" className="text-primary hover:underline">
              Voltar para o catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Schema.org markup para a categoria
  const categorySchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category.name,
    "description": category.description,
    "image": category.bannerUrl,
    "url": window.location.href,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": machines.map((machine, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": machine.name,
          "description": machine.description,
          "image": machine.mainImageUrl,
          "@id": `${window.location.origin}/catalogo-de-produtos/produto/${machine.id}`,
          "url": `${window.location.origin}/catalogo-de-produtos/produto/${machine.id}`
        }
      }))
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{`${category.name} - Catálogo de Máquinas`}</title>
        <meta name="description" content={category.description} />
        <meta property="og:title" content={`${category.name} - Catálogo de Máquinas`} />
        <meta property="og:description" content={category.description} />
        {category.bannerUrl && <meta property="og:image" content={category.bannerUrl} />}
        <link rel="canonical" href={window.location.href} />
        <script type="application/ld+json">
          {JSON.stringify(categorySchema)}
        </script>
      </Helmet>

      <Navbar />

      <div className="flex-1">
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex text-sm">
            <ol className="flex items-center space-x-2" itemScope itemType="https://schema.org/BreadcrumbList">
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <Link to="/" className="text-gray-500 hover:text-primary" itemProp="item">
                  <span itemProp="name">Início</span>
                </Link>
                <meta itemProp="position" content="1" />
              </li>
              <li className="text-gray-400">/</li>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <Link to="/aluguel-de-equipamentos" className="text-gray-500 hover:text-primary" itemProp="item">
                  <span itemProp="name">Aluguel de Equipamentos</span>
                </Link>
                <meta itemProp="position" content="2" />
              </li>
              <li className="text-gray-400">/</li>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <span className="text-primary" itemProp="name">{category.name}</span>
                <meta itemProp="position" content="3" />
              </li>
            </ol>
          </nav>
        </div>

        {/* Hero Section */}
        <CategoryHero category={category} />

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {machines.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-text">Nenhuma máquina encontrada nesta categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {machines.map((machine) => (
                <CatalogProductCard key={machine.id} product={machine} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}