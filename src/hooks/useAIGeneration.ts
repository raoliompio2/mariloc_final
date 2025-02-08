import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import { supabase } from '../lib/supabase';

interface AIFormData {
  machineName: string;
  brand?: string;
  keywords: string[];
}

interface GeneratedContent {
  description: string;
  mainSpecs: Array<{ label: string; value: string }>;
  otherSpecs: Array<{ label: string; value: string }>;
  category?: {
    main: string;
    sub?: string;
  };
  images?: string[];
}

interface UseAIGenerationProps {
  onSuccess?: (content: GeneratedContent) => void;
  onError?: (error: Error) => void;
}

export function useAIGeneration({ onSuccess, onError }: UseAIGenerationProps = {}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const retryWithDelay = async <T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 2000
  ): Promise<T> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        if (error?.status === 429) {
          console.log(`Attempt ${attempt} failed due to rate limit, waiting before retry...`);
          if (attempt === maxAttempts) throw error;
          // Exponential backoff
          const delay = baseDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retry attempts reached');
  };

  const fetchGoogleResults = useCallback(async (query: string) => {
    try {
      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${import.meta.env.VITE_GOOGLE_API_KEY}&cx=${import.meta.env.VITE_GOOGLE_CX}&q=${encodeURIComponent(query)}`;
      const searchData = await retryWithDelay(async () => {
        const response = await fetch(searchUrl, {});
        if (!response.ok) {
          const error = new Error(`HTTP error! status: ${response.status}`);
          (error as any).status = response.status;
          throw error;
        }
        return response.json();
      });

      return searchData.items?.slice(0, 5).map((item: any) => ({
        title: item.title,
        snippet: item.snippet,
        link: item.link
      })) || [];
    } catch (error) {
      console.error('Error fetching Google results:', error);
      return [];
    }
  }, [retryWithDelay]);

  const generateWithAI = async (prompt: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await retryWithDelay(async () => {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'Você é um assistente especializado em gerar descrições técnicas e detalhadas de máquinas e equipamentos.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        });

        if (!res.ok) {
          const error = new Error(`HTTP error! status: ${res.status}`);
          (error as any).status = res.status;
          throw error;
        }

        return res.json();
      });

      if (!response.choices?.[0]?.message?.content) {
        throw new Error('Resposta inválida da API');
      }

      return response.choices[0].message.content;
    } catch (err) {
      const error = err as Error;
      console.error('Error generating content:', error);
      setError(error.message);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const searchImages = async (query: string): Promise<string[]> => {
    // Por enquanto, vamos retornar um array vazio para não bloquear o fluxo
    return [];
  };

  const generateContent = async ({
    machineName,
    keywords
  }: {
    machineName: string;
    keywords: string[];
  }) => {
    try {
      const response = await generateWithAI(`
        Gere uma descrição detalhada e especificações técnicas para a máquina "${machineName}".
        Palavras-chave adicionais: ${keywords.join(', ')}
        
        Retorne um JSON com:
        - description: descrição detalhada da máquina (500-700 caracteres)
        - mainSpecs: array com até 5 especificações técnicas principais no formato { name: string, value: string }
        - category: { main: string, sub?: string } - categoria principal e subcategoria (opcional)
        
        Mantenha o JSON válido e evite quebras de linha nos valores.
      `);

      if (!response) {
        throw new Error('Não foi possível gerar o conteúdo');
      }

      try {
        const data = JSON.parse(response);
        
        // Validação básica do formato
        if (!data.description || !data.mainSpecs || !data.category) {
          throw new Error('Resposta da IA em formato inválido');
        }

        return {
          description: data.description as string,
          mainSpecs: data.mainSpecs as Array<{ name: string; value: string }>,
          category: data.category as { main: string; sub?: string }
        };
      } catch (error) {
        console.error('Erro ao processar resposta da IA:', error);
        throw new Error('Erro ao processar resposta da IA');
      }
    } catch (error) {
      console.error('Erro na geração de conteúdo:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message
      });
      throw error;
    }
  };

  return {
    generateContent,
    loading,
    error
  };
}
