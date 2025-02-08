import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileQuoteBlockProps {
  slug: string;
  isVisible: boolean;
}

export const MobileQuoteBlock: React.FC<MobileQuoteBlockProps> = ({ slug, isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-800 p-4 z-50 lg:hidden"
        >
          <Link
            to={`/quote/request/${slug}`}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-green-600 text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 shadow-sm"
          >
            <MessageSquare className="h-5 w-5" />
            Orçamento pelo WhatsApp
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
