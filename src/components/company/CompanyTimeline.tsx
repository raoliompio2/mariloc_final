import { motion } from 'framer-motion'
import { CompanyTimeline as CompanyTimelineType } from '../../types/company'

interface CompanyTimelineProps {
  items: CompanyTimelineType[]
}

export function CompanyTimeline({ items }: CompanyTimelineProps) {
  return (
    <div className="relative overflow-hidden bg-surface-50 dark:bg-surface-900 py-24">
      {/* Background decorativo */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-primary-500/20 dark:via-primary-400/20 to-transparent" />
      </div>

      <div className="container mx-auto px-4">
        {/* Título com badge */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mb-4 inline-block rounded-full bg-primary-500/10 px-6 py-2 text-sm font-semibold text-primary-500 dark:text-primary-400"
          >
            Nossa Trajetória
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-surface-900 dark:text-surface-50"
          >
            Nossa História
          </motion.h2>
        </div>
        
        <div className="relative">
          {/* Linha central com gradiente */}
          <div className="absolute left-1/2 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-surface-200 via-primary-500/30 to-surface-200 dark:from-surface-700 dark:via-primary-400/30 dark:to-surface-700" />
          
          <div className="space-y-24">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`group relative flex ${
                  index % 2 === 0 ? 'justify-start' : 'justify-end'
                }`}
              >
                {/* Ponto na linha do tempo com animação */}
                <div className="absolute left-1/2 -translate-x-1/2">
                  <div className="relative">
                    <div className="absolute -inset-2 rounded-full bg-primary-500/20 dark:bg-primary-400/20 transition-transform duration-300 group-hover:scale-150" />
                    <div className="relative h-4 w-4 rounded-full bg-primary-500 dark:bg-primary-400 shadow-lg shadow-primary-500/30 dark:shadow-primary-400/30 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>
                
                {/* Conteúdo com card moderno */}
                <div className={`w-5/12 ${index % 2 === 0 ? 'pr-16' : 'pl-16'}`}>
                  <div className="group/card relative rounded-2xl bg-white/80 dark:bg-surface-800/80 p-8 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    {/* Ano com efeito de gradiente */}
                    <div className="mb-4">
                      <span className="inline-block rounded-full bg-primary-500/10 dark:bg-primary-400/10 px-4 py-1 text-sm font-semibold text-primary-500 dark:text-primary-400">
                        {item.year}
                      </span>
                    </div>

                    {/* Título com underline animado */}
                    <h3 className="relative mb-4 text-xl font-bold text-surface-900 dark:text-surface-50">
                      {item.title}
                      <div className="absolute -bottom-1 left-0 h-0.5 w-full bg-gradient-to-r from-primary-500/0 via-primary-500 to-primary-500/0 dark:from-primary-400/0 dark:via-primary-400 dark:to-primary-400/0 transform scale-x-0 transition-transform duration-300 group-hover/card:scale-x-100" />
                    </h3>

                    {/* Descrição com fade in */}
                    <p className="text-surface-600 dark:text-surface-400">
                      {item.description}
                    </p>

                    {/* Decorative corner */}
                    <div className="absolute -right-1 -top-1 h-12 w-12 overflow-hidden">
                      <div className="absolute -right-2 -top-2 h-8 w-8 rotate-45 bg-primary-500/10 dark:bg-primary-400/10" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
