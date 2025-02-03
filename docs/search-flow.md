# Fluxo de Busca Inteligente com IA

Este documento descreve o fluxo de busca inteligente implementado no arquivo `Home.tsx`. O sistema combina GPT-4 para processamento de linguagem natural com Supabase para busca de produtos.

## Visão Geral do Fluxo

### 1. Interface do Usuário
- Usuário digita sua necessidade em linguagem natural
- Exemplos:
  - "Preciso quebrar uma parede"
  - "Quero fazer uma calçada"
  - "Preciso misturar concreto"

### 2. Processamento com GPT-4
- A busca do usuário é enviada para a API do GPT-4
- O GPT-4 analisa e retorna um JSON estruturado:
```json
{
  "context": "descrição do contexto",
  "searchTerms": ["termo1", "termo2"]
}
```
- Exemplo de resposta:
```json
{
  "context": "demolição de parede",
  "searchTerms": ["martelo demolidor", "rompedor", "martelete"]
}
```

### 3. Busca no Banco (Supabase)
- Processo de busca:
  1. Busca todas as máquinas com seus relacionamentos
  2. Filtra localmente usando os termos do GPT
  3. Campos usados na busca:
     - Nome do produto
     - Descrição
     - Nome da categoria
- Logs de debug são gerados em cada etapa para facilitar o troubleshooting

### 4. Exibição dos Resultados
- Componentes envolvidos:
  1. Mensagem contextualizada da IA
  2. Lista de produtos (ProductCard)
  3. Links para páginas detalhadas

## Código Importante

### Função de Busca Principal
```typescript
const searchMachines = async (searchTerms: string[]): Promise<Product[]> => {
  try {
    console.log('Iniciando busca com termos:', searchTerms);
    
    // 1. Busca todas as máquinas com relacionamentos
    const { data: machines, error } = await supabase
      .from('machines')
      .select(`
        *,
        category:category_id (
          id,
          name,
          type
        )
      `);

    if (!machines) {
      console.log('Nenhuma máquina encontrada no banco');
      return [];
    }

    console.log('Máquinas encontradas:', machines.length);

    // 2. Filtra localmente usando os termos de busca
    const filteredMachines = machines.filter(machine => {
      return searchTerms.some(term => {
        const searchTerm = term.toLowerCase();
        const nameMatch = machine.name?.toLowerCase().includes(searchTerm);
        const descMatch = machine.description?.toLowerCase().includes(searchTerm);
        const catMatch = machine.category?.name?.toLowerCase().includes(searchTerm);
        
        return nameMatch || descMatch || catMatch;
      });
    });

    // 3. Mapeia para o formato do ProductCard
    return filteredMachines.map(machine => ({
      id: machine.id,
      name: machine.name,
      description: machine.description,
      mainImageUrl: machine.main_image_url,
      categoryId: machine.category_id,
      category: machine.category
    }));
  } catch (error) {
    console.error('Erro ao buscar máquinas:', error);
    return [];
  }
};
```

### Processamento com GPT-4
```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
  },
  body: JSON.stringify({
    model: "gpt-4",
    messages: [{
      role: "system",
      content: "Você é um especialista em equipamentos para construção..."
    }, {
      role: "user",
      content: searchTerm
    }]
  })
});
```

## Requisitos do Sistema

### Variáveis de Ambiente
- `VITE_OPENAI_API_KEY`: API key do GPT-4 (obrigatória)
- `VITE_SUPABASE_URL`: URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase

### Banco de Dados (Supabase)
- Tabela `machines`:
  - `id`: Identificador único
  - `name`: Nome do produto
  - `description`: Descrição detalhada
  - `main_image_url`: URL da imagem principal
  - `category_id`: Referência à categoria

- Tabela `categories`:
  - `id`: Identificador único
  - `name`: Nome da categoria
  - `type`: Tipo da categoria

## Debug e Troubleshooting

### Logs Disponíveis
O sistema gera logs detalhados no console do navegador:
1. Termos de busca recebidos do GPT
2. Quantidade de máquinas no banco
3. Dados da primeira máquina encontrada
4. Processo de filtragem para cada máquina
5. Quantidade de máquinas após filtragem

### Problemas Comuns
1. Chave da API OpenAI não configurada
2. Banco de dados vazio
3. Campos null ou undefined nas máquinas
4. Termos de busca não correspondentes

Para debugar, abra o console do navegador (F12) e verifique os logs durante a busca.
