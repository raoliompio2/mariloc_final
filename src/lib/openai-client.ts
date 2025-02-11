const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  console.error('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your .env file');
}

interface ChatCompletionResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  usage: {
    total_tokens: number;
  };
}

export const openai = {
  apiKey,
  chat: {
    completions: {
      create: async (params: { model: string; messages: { role: string; content: string; }[] }) => {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: params.model,
            messages: params.messages,
            temperature: 0.7,
            max_tokens: 500
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
        }

        const data: ChatCompletionResponse = await response.json();
        return {
          choices: data.choices,
          usage: data.usage
        };
      }
    }
  }
};
