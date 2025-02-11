import { useState } from 'react';

interface DeepSeekResponse {
  context: string;
  searchTerms: string[];
}

export function useDeepSeek() {
  const [isProcessing, setIsProcessing] = useState(false);

  const searchWithDeepSeek = async (query: string): Promise<DeepSeekResponse | null> => {
    setIsProcessing(true);
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `Você é um especialista em equipamentos e máquinas para construção civil.
              Sua função é entender a necessidade do cliente e recomendar os equipamentos mais adequados.
              
              Analise a necessidade do usuário e retorne um JSON com:
              1. context: Uma descrição curta da situação
              2. searchTerms: 2-4 termos técnicos para busca de equipamentos
              
              Exemplos:
              Input: "Preciso quebrar uma parede"
              {
                "context": "Para demolição de parede, encontrei 3 equipamentos que podem te ajudar:",
                "searchTerms": ["martelo demolidor", "rompedor", "martelete"]
              }
              
              Input: "Vou fazer uma calçada"
              {
                "context": "Para construção de calçada, aqui estão as melhores opções:",
                "searchTerms": ["betoneira", "régua vibratória", "desempenadeira"]
              }
              
              Input: "Quero levantar materiais pesados"
              {
                "context": "Para movimentação de cargas pesadas, estas são as opções ideais:",
                "searchTerms": ["guindaste", "munck", "manipulador telescópico"]
              }
              
              Sempre retorne um objeto JSON válido.
              O context deve ser uma frase completa e amigável.
              searchTerms deve ter termos técnicos específicos.`
            },
            {
              role: "user",
              content: query
            }
          ],
          temperature: 0.7,
          max_tokens: 200
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao processar com DeepSeek');
      }

      const data = await response.json();
      
      try {
        const result = JSON.parse(data.choices[0].message.content);
        return {
          context: result.context,
          searchTerms: result.searchTerms
        };
      } catch (parseError) {
        console.error('Erro ao analisar resposta do DeepSeek:', parseError);
        // Tentar extrair usando regex se o JSON estiver malformado
        const content = data.choices[0].message.content;
        const contextMatch = content.match(/"context":\s*"([^"]+)"/);
        const termsMatch = content.match(/"searchTerms":\s*\[(.*?)\]/);
        
        if (contextMatch && termsMatch) {
          return {
            context: contextMatch[1],
            searchTerms: termsMatch[1].split(',').map(term => 
              term.trim().replace(/"/g, '')
            )
          };
        }
        return null;
      }
    } catch (error) {
      console.error('Erro ao processar com DeepSeek:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    searchWithDeepSeek,
    isProcessing
  };
}
