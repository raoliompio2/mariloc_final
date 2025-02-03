import React, { useState, useCallback } from 'react';
import { Mic } from 'lucide-react';
import { motion } from 'framer-motion';

interface VoiceSearchProps {
  onSearch: (text: string) => void;
  onProcessingStateChange?: (isProcessing: boolean) => void;
}

export function VoiceSearch({ onSearch, onProcessingStateChange }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);

  const startListening = useCallback(async () => {
    try {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        onSearch(text);
      };

      recognition.onerror = (event: any) => {
        console.error('Erro no reconhecimento de voz:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Erro ao iniciar reconhecimento de voz:', err);
      setIsListening(false);
    }
  }, [onSearch]);

  return (
    <button
      type="button"
      onClick={startListening}
      className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors relative"
      title="Buscar por voz"
    >
      <Mic className="w-4 h-4 text-foreground" />
      {isListening && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 rounded-full"
        >
          <svg className="absolute inset-0 animate-ping" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-primary/20"
            />
          </svg>
        </motion.div>
      )}
    </button>
  );
}