import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

export function PageLoading() {
  const { theme, systemSettings } = useSelector((state: RootState) => state.theme);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      style={{ 
        backgroundColor: theme === 'dark' 
          ? systemSettings.dark_header_color 
          : systemSettings.light_header_color,
        color: theme === 'dark'
          ? systemSettings.dark_header_text_color
          : systemSettings.light_header_text_color
      }}
    >
      <div className="relative">
        {/* Logo animation */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-8"
        >
          {theme === 'dark' && systemSettings.dark_header_logo_url ? (
            <img
              src={systemSettings.dark_header_logo_url}
              alt="Logo"
              className="h-[120px] w-auto"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                console.error('Erro ao carregar logo escura:', e);
                const target = e.target as HTMLImageElement;
                target.src = systemSettings.light_header_logo_url || '';
              }}
            />
          ) : systemSettings.light_header_logo_url ? (
            <img
              src={systemSettings.light_header_logo_url}
              alt="Logo"
              className="h-[120px] w-auto"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                console.error('Erro ao carregar logo clara:', e);
              }}
            />
          ) : null}
        </motion.div>

        {/* Loading circles */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut"
              }}
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: theme === 'dark'
                  ? systemSettings.dark_header_text_color
                  : systemSettings.light_header_text_color
              }}
            />
          ))}
        </div>

        {/* Loading text */}
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mt-4 text-center"
          style={{
            color: theme === 'dark'
              ? systemSettings.dark_header_text_color
              : systemSettings.light_header_text_color
          }}
        >
          Carregando...
        </motion.div>
      </div>
    </motion.div>
  );
}
