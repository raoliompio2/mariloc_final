import { openai } from '../lib/openai-client';
import { supabase } from '../lib/api-client';
import { handleError } from '../utils/error-handler';
import { openAIUsage } from './openai-usage';

interface SEOContent {
  title: string;
  description: string;
  keywords: string[];
  faq: Array<{ question: string; answer: string }>;
  relatedTerms: string[];
  snippetContent: string;
}

interface CategorySEO {
  title: string;
  description: string;
  keywords: string[];
  h1: string;
  intro: string;
  benefits: string[];
  applications: string[];
  tips: string[];
}

class AdvancedSEO {
  // Gera FAQ dinâmico usando IA
  async generateFAQ(product: any): Promise<Array<{ question: string; answer: string }>> {
    try {
      const prompt = `
        Produto: ${product.name}
        Descrição: ${product.description}
        Categoria: ${product.category?.name}
        
        Gere 5 perguntas e respostas frequentes sobre este produto específico para aluguel.
        Regras importantes:
        1. NUNCA mencionar preços específicos
        2. NUNCA mencionar prazos de entrega específicos
        3. Para preços, usar "Entre em contato para um orçamento personalizado"
        4. Para prazos, usar "Consulte disponibilidade para sua região"
        5. Focar em:
           - Especificações técnicas
           - Requisitos de uso
           - Documentação necessária
           - Condições gerais
           - Dicas de uso

        Retorne apenas o JSON no formato:
        { "faq": [{ "question": "...", "answer": "..." }] }
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
      });

      await openAIUsage.logUsage({
        tokens: response.usage?.total_tokens || 0,
        cost: (response.usage?.total_tokens || 0) * 0.00003, // $0.03 por 1K tokens
        model: 'gpt-4',
        purpose: 'faq_generation',
        timestamp: new Date().toISOString()
      });

      const faqData = JSON.parse(response.choices[0].message.content);
      return faqData.faq;
    } catch (error) {
      handleError(error);
      return [];
    }
  }

  // Gera meta descrição otimizada usando IA
  async generateMetaDescription(product: any): Promise<string> {
    try {
      const prompt = `
        Produto: ${product.name}
        Descrição: ${product.description}
        Categoria: ${product.category?.name}
        
        Gere uma meta description otimizada para SEO com no máximo 155 caracteres.
        Regras importantes:
        1. NUNCA mencionar preços específicos
        2. NUNCA mencionar prazos de entrega específicos
        3. Usar termos como "Solicite orçamento" ou "Consulte disponibilidade"
        4. Focar nas características do equipamento
        5. Mencionar a região mas sem promessas de entrega
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
      });

      await openAIUsage.logUsage({
        tokens: response.usage?.total_tokens || 0,
        cost: (response.usage?.total_tokens || 0) * 0.00003, // $0.03 por 1K tokens
        model: 'gpt-4',
        purpose: 'meta_description_generation',
        timestamp: new Date().toISOString()
      });

      return response.choices[0].message.content.slice(0, 155);
    } catch (error) {
      handleError(error);
      return product.description?.slice(0, 155) || '';
    }
  }

  // Encontra termos relacionados baseado em dados históricos
  async findRelatedTerms(product: any): Promise<string[]> {
    try {
      // Busca produtos similares
      const { data: similar } = await supabase
        .from('machines')
        .select(`
          name,
          category:categories(name),
          technical_data(name, value)
        `)
        .eq('category_id', product.category_id)
        .neq('id', product.id)
        .limit(5);

      // Extrai termos relevantes
      const terms = new Set<string>();
      similar?.forEach(item => {
        terms.add(item.name);
        terms.add(item.category?.name);
        item.technical_data?.forEach(td => {
          terms.add(td.value);
        });
      });

      return Array.from(terms);
    } catch (error) {
      handleError(error);
      return [];
    }
  }

  // Gera links internos relevantes
  async generateInternalLinks(product: any): Promise<Array<{ text: string; url: string }>> {
    try {
      const { data: related } = await supabase
        .from('machines')
        .select(`
          id,
          name,
          category:categories(name, slug)
        `)
        .eq('category_id', product.category_id)
        .neq('id', product.id)
        .limit(3);

      return (related || []).map(item => ({
        text: `${item.name} - ${item.category?.name}`,
        url: `/produto/${item.id}`,
      }));
    } catch (error) {
      handleError(error);
      return [];
    }
  }

  // Otimiza conteúdo para featured snippets
  async optimizeForSnippets(product: any): Promise<string> {
    try {
      const prompt = `
        Produto: ${product.name}
        Descrição: ${product.description}
        Especificações: ${JSON.stringify(product.technical_data)}
        
        Gere um parágrafo otimizado para Featured Snippets do Google.
        Foque em:
        1. Definição clara do produto
        2. Principais usos
        3. Benefícios chave
        4. Formato "O que é" ou "Como usar"
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
      });

      await openAIUsage.logUsage({
        tokens: response.usage?.total_tokens || 0,
        cost: (response.usage?.total_tokens || 0) * 0.00003, // $0.03 por 1K tokens
        model: 'gpt-4',
        purpose: 'snippet_optimization',
        timestamp: new Date().toISOString()
      });

      return response.choices[0].message.content;
    } catch (error) {
      handleError(error);
      return product.description || '';
    }
  }

  // Gera conteúdo SEO para categoria
  async generateCategorySEO(category: any, machines: any[]): Promise<CategorySEO> {
    try {
      const prompt = `
        Categoria: ${category.name}
        Descrição: ${category.description}
        Número de Máquinas: ${machines.length}
        Máquinas Populares: ${machines.slice(0, 3).map(m => m.name).join(', ')}
        
        Gere conteúdo SEO otimizado para esta categoria de máquinas para aluguel.
        
        Regras importantes:
        1. NUNCA mencionar preços específicos
        2. NUNCA mencionar prazos de entrega específicos
        3. Para preços, usar "Entre em contato para um orçamento personalizado"
        4. Para prazos, usar "Consulte disponibilidade para sua região"
        5. Focar em:
           - Benefícios do aluguel desta categoria
           - Aplicações comuns
           - Diferenciais do serviço
           - Requisitos gerais
           - Dicas de escolha

        Retorne apenas o JSON no formato:
        {
          "title": "Título SEO otimizado",
          "description": "Meta description otimizada (máx 155 caracteres)",
          "keywords": ["palavra-chave-1", "palavra-chave-2"],
          "h1": "Título principal da página",
          "intro": "Texto introdutório otimizado",
          "benefits": ["benefício 1", "benefício 2"],
          "applications": ["aplicação 1", "aplicação 2"],
          "tips": ["dica 1", "dica 2"]
        }
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }]
      });

      // Registra uso do GPT
      await openAIUsage.logUsage({
        tokens: response.usage?.total_tokens || 0,
        cost: (response.usage?.total_tokens || 0) * 0.00003, // $0.03 por 1K tokens
        model: 'gpt-4',
        purpose: 'category_seo',
        timestamp: new Date().toISOString()
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      handleError(error);
      // Fallback para SEO básico
      return {
        title: `Aluguel de ${category.name}`,
        description: category.description?.slice(0, 155) || '',
        keywords: [category.name],
        h1: category.name,
        intro: category.description,
        benefits: [],
        applications: [],
        tips: []
      };
    }
  }

  // Core de palavras-chave do negócio
  private readonly coreKeywords = {
    aluguel: [
      "aluguel",
      "alugar",
      "aluguel de equipamentos",
      "aluguel de máquinas",
      "locação",
      "locar"
    ],
    
    servicos: [
      "para obras",
      "para construção",
      "para reforma",
      "equipamentos",
      "máquinas"
    ],
    
    comercial: [
      "orçamento",
      "melhor preço",
      "entrega",
      "disponível",
      "profissional"
    ]
  };

  // Busca cidades do locatário
  private async getLandlordCities(landlordId: string): Promise<string[]> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('city, state')
      .eq('id', landlordId)
      .single();

    if (!profile) return ['Marília', 'SP'];

    // Gera variações da cidade
    const cityVariations = [
      profile.city,
      `${profile.city} ${profile.state}`,
      `região de ${profile.city}`,
      `${profile.city} e região`,
      `interior de ${profile.state}`
    ];

    // Busca cidades próximas
    const { data: nearbyRentals } = await supabase
      .from('rentals')
      .select('delivery_address')
      .eq('landlord_id', landlordId)
      .limit(50);

    const nearbyCities = new Set();
    nearbyRentals?.forEach(rental => {
      const city = this.extractCityFromAddress(rental.delivery_address);
      if (city) nearbyCities.add(city);
    });

    return [...cityVariations, ...Array.from(nearbyCities)];
  }

  // Extrai cidade de um endereço
  private extractCityFromAddress(address: string): string | null {
    if (!address) return null;
    // Exemplo: "Rua X, 123 - Bairro Y, Cidade - UF"
    const parts = address.split(',');
    if (parts.length >= 2) {
      const cityPart = parts[parts.length - 1].trim();
      return cityPart.split('-')[0].trim();
    }
    return null;
  }

  // Gera keywords combinando o core com dados do produto
  private async generateKeywords(product: any): Promise<string[]> {
    const productTerms = [
      product.name,
      product.category?.name,
      ...product.technical_data?.map(td => td.value) || []
    ];

    // Busca cidades do locatário
    const cities = await this.getLandlordCities(product.owner_id);
    
    const keywords = [];

    // Combina termos do produto com core keywords e cidades
    this.coreKeywords.aluguel.forEach(aluguel => {
      cities.forEach(city => {
        productTerms.forEach(term => {
          // Ex: "aluguel de betoneira em Marília"
          keywords.push(`${aluguel} de ${term} em ${city}`);
          
          // Ex: "locação de betoneira para obras em Marília"
          this.coreKeywords.servicos.forEach(servico => {
            keywords.push(`${aluguel} de ${term} ${servico} em ${city}`);
          });
        });
      });
    });

    // Adiciona variações comerciais com cidades
    this.coreKeywords.comercial.forEach(termo => {
      productTerms.forEach(product => {
        cities.forEach(city => {
          keywords.push(`${product} ${termo} em ${city}`);
        });
      });
    });

    // Adiciona termos específicos da região
    cities.forEach(city => {
      keywords.push(
        `onde alugar ${product.name} em ${city}`,
        `${product.name} para alugar ${city}`,
        `empresas de locação de ${product.name} ${city}`
      );
    });

    return [...new Set(keywords)]; // Remove duplicatas
  }

  async generateSEOContent(product: any): Promise<SEOContent> {
    try {
      const [description, faq] = await Promise.all([
        this.generateMetaDescription(product),
        this.generateFAQ(product)
      ]);

      // Gera keywords usando o core
      const keywords = await this.generateKeywords(product);

      // Gera título otimizado
      const title = this.generateTitle(product, keywords[0]);

      return {
        title,
        description,
        keywords,
        faq,
        relatedTerms: await this.findRelatedTerms(product),
        snippetContent: await this.optimizeForSnippets(product)
      };
    } catch (error) {
      handleError(error);
      return {
        title: product.name,
        description: product.description,
        keywords: [],
        faq: [],
        relatedTerms: [],
        snippetContent: ''
      };
    }
  }

  private generateTitle(product: any, mainKeyword: string): string {
    // Prioriza o termo principal de busca
    return `${product.name} | ${mainKeyword} | Mariloc`;
  }
}

export const advancedSEO = new AdvancedSEO();
