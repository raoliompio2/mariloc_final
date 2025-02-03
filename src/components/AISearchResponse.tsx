import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Loader2 } from 'lucide-react';

interface AISearchResponseProps {
  query: string;
  isProcessing: boolean;
  interpretation: string;
  context: {
    context: string;
    suggestion: string;
  } | null;
}

export function AISearchResponse({ query, isProcessing, interpretation, context }: AISearchResponseProps) {
  if (!query || (!isProcessing && !interpretation)) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 max-w-2xl mx-auto"
    >
      {/* Mensagem do Usuário */}
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
          <p className="text-sm">{query}</p>
        </div>
      </div>

      {/* Resposta da IA */}
      <div className="flex gap-2 items-start">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          {isProcessing ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Analisando sua solicitação...</span>
            </div>
          ) : (
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 space-y-2">
              {interpretation && (
                <p className="text-sm text-foreground">{interpretation}</p>
              )}
              {context && (
                <div className="space-y-2 mt-2 text-sm">
                  <p className="text-muted-foreground">{context.suggestion}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
