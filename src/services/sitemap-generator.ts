import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { supabase } from '../lib/api-client';
import { handleError } from '../utils/error-handler';

interface SitemapURL {
  url: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  lastmod?: string;
}

class SitemapGenerator {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_PUBLIC_URL || 'https://mariloc.com.br';
  }

  private async getStaticURLs(): Promise<SitemapURL[]> {
    return [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/sobre', changefreq: 'monthly', priority: 0.3 },
      { url: '/contato', changefreq: 'monthly', priority: 0.3 },
      { url: '/como-funciona', changefreq: 'monthly', priority: 0.5 },
      { url: '/termos-de-uso', changefreq: 'yearly', priority: 0.1 },
      { url: '/politica-de-privacidade', changefreq: 'yearly', priority: 0.1 },
    ];
  }

  private async getCategoryURLs(): Promise<SitemapURL[]> {
    try {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('slug, updated_at');

      if (error) throw error;

      return categories.map(category => ({
        url: \`/catalogo-de-produtos/\${category.slug}\`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: category.updated_at,
      }));
    } catch (error) {
      handleError(error);
      return [];
    }
  }

  private async getProductURLs(): Promise<SitemapURL[]> {
    try {
      const { data: machines, error } = await supabase
        .from('machines')
        .select('id, name, updated_at')
        .eq('status', 'active');

      if (error) throw error;

      return machines.map(machine => ({
        url: \`/produto/\${machine.id}\`,
        changefreq: 'daily',
        priority: 0.9,
        lastmod: machine.updated_at,
      }));
    } catch (error) {
      handleError(error);
      return [];
    }
  }

  async generate(): Promise<string> {
    try {
      // Coletar todas as URLs
      const [staticURLs, categoryURLs, productURLs] = await Promise.all([
        this.getStaticURLs(),
        this.getCategoryURLs(),
        this.getProductURLs(),
      ]);

      const allURLs = [...staticURLs, ...categoryURLs, ...productURLs];

      // Criar stream do sitemap
      const stream = new SitemapStream({
        hostname: this.baseUrl,
      });

      // Adicionar URLs ao stream
      return streamToPromise(
        Readable.from(allURLs).pipe(stream)
      ).then(data => data.toString());
    } catch (error) {
      handleError(error);
      throw new Error('Falha ao gerar sitemap');
    }
  }

  async generateRobotsTxt(): Promise<string> {
    return \`
      User-agent: *
      Allow: /

      # Proteger rotas privadas
      Disallow: /admin/
      Disallow: /api/
      Disallow: /landlord/
      Disallow: /client/

      # Sitemap
      Sitemap: \${this.baseUrl}/sitemap.xml
    \`.trim();
  }
}

export const sitemapGenerator = new SitemapGenerator();
