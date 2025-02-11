import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import type { Product } from '../../types/product';

interface ProductSEOProps {
  product: Product;
}

export function ProductSEO({ product }: ProductSEOProps) {
  const { pathname } = useLocation();
  const url = \`\${window.location.origin}\${pathname}\`;

  // Formatar preço se disponível
  const priceString = product.price
    ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(product.price)
    : undefined;

  // Estruturar dados do produto para rich snippets
  const structuredData = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: [product.mainImageUrl, ...(product.images || []).map(img => img.url)],
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Mariloc'
    },
    category: product.category?.name,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: product.price,
      availability: product.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Mariloc'
      }
    }
  };

  // Gerar keywords baseadas nos dados do produto
  const keywords = [
    product.name,
    product.brand,
    product.category?.name,
    'aluguel',
    'máquinas',
    'equipamentos',
    ...(product.technicalData || []).map(data => data.value),
  ].filter(Boolean);

  return (
    <Helmet>
      {/* Básico */}
      <title>{product.name} | Aluguel de Máquinas | Mariloc</title>
      <meta name="description" content={product.description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content="product" />
      <meta property="og:title" content={product.name} />
      <meta property="og:description" content={product.description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={product.mainImageUrl} />
      {priceString && <meta property="product:price:amount" content={product.price.toString()} />}
      <meta property="product:price:currency" content="BRL" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={product.name} />
      <meta name="twitter:description" content={product.description} />
      <meta name="twitter:image" content={product.mainImageUrl} />

      {/* Dados Estruturados */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Breadcrumbs Estruturados */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: window.location.origin
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: product.category?.name || 'Produtos',
              item: \`\${window.location.origin}/catalogo-de-produtos/\${product.category?.slug || ''}\`
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: product.name,
              item: url
            }
          ]
        })}
      </script>
    </Helmet>
  );
}
