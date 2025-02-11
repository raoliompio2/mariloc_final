import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from '../pages/Home';
import { ProductDetail } from '../pages/ProductDetail';
import { CategoryList } from '../pages/CategoryList';
import { useLocation } from '../hooks/useLocation';

export function AppRoutes() {
  const { currentCity } = useLocation();

  return (
    <Routes>
      {/* Rota Principal */}
      <Route path="/" element={<Home />} />

      {/* Rotas de Produto com Localização */}
      <Route 
        path="/aluguel-:category/:product/:city" 
        element={<ProductDetail />} 
      />
      <Route 
        path="/aluguel-:category/:product" 
        element={<ProductDetail />} 
      />
      
      {/* Rota de Categoria */}
      <Route 
        path="/aluguel-:category/:city" 
        element={<CategoryList />} 
      />
      <Route 
        path="/aluguel-:category" 
        element={<CategoryList />} 
      />

      {/* Redirecionamentos SEO */}
      <Route 
        path="/produto/:slug" 
        element={<ProductRedirect />} 
      />
    </Routes>
  );
}

// Componente para redirecionar URLs antigas
function ProductRedirect() {
  const { slug } = useParams();
  const { currentCity } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Converter slug para novo formato
    const [category, ...productParts] = slug.split('-');
    const product = productParts.join('-');
    
    // Redirecionar para nova URL
    navigate(
      \`/aluguel-\${category}/\${product}/\${currentCity}\`,
      { replace: true }
    );
  }, [slug, currentCity]);

  return null;
}
