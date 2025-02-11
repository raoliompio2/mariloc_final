import React from 'react';
import { motion } from 'framer-motion';

interface VoiceWaveProps {
  isRecording: boolean;
}

export function VoiceWave({ isRecording }: VoiceWaveProps) {
  return (
    <div className="flex items-center justify-center gap-1">
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-0.5 h-4 bg-red-600"
          animate={{
            height: isRecording ? ['16px', '24px', '16px'] : '16px',
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
