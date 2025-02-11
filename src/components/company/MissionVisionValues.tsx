import { motion } from 'framer-motion'
import { CompanyMissionVisionValue } from '../../types/company'
import { DynamicIcon } from './DynamicIcon'

interface MissionVisionValuesProps {
  items: CompanyMissionVisionValue[]
}

export function MissionVisionValues({ items }: MissionVisionValuesProps) {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-surface-800 py-24">
      {/* Decorative background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-primary-500/5 dark:bg-primary-400/5" />
        <div className="absolute -left-1/4 top-0 h-96 w-96 rounded-full bg-primary-500/10 dark:bg-primary-400/10 blur-3xl" />
        <div className="absolute -right-1/4 bottom-0 h-96 w-96 rounded-full bg-primary-500/10 dark:bg-primary-400/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid gap-16 md:grid-cols-3">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="group relative"
            >
              {/* Card sem fundo */}
              <div className="relative rounded-2xl border border-surface-200/50 dark:border-surface-700/50 p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                {/* Ícone com círculo de fundo */}
                <div className="mb-6">
                  <div className="relative mx-auto h-16 w-16">
                    <div className="absolute inset-0 rounded-full bg-primary-500/10 dark:bg-primary-400/10 transform transition-transform duration-300 group-hover:scale-110" />
                    {item.icon && (
                      <div className="relative flex h-full items-center justify-center">
                        <DynamicIcon 
                          name={item.icon} 
                          className="h-8 w-8 text-primary-500 dark:text-primary-400 transform transition-transform duration-300 group-hover:scale-110" 
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Título com linha decorativa */}
                <div className="mb-4 text-center">
                  <h3 className="relative inline-block text-2xl font-bold text-surface-900 dark:text-surface-50">
                    {item.title}
                    <div className="absolute -bottom-2 left-0 h-0.5 w-full bg-gradient-to-r from-transparent via-primary-500/20 dark:via-primary-400/20 to-transparent transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                  </h3>
                </div>

                {/* Descrição com fade in */}
                <motion.p 
                  className="text-center text-surface-600 dark:text-surface-400"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {item.description}
                </motion.p>

                {/* Decorative corner */}
                <div className="absolute -right-1 -top-1 h-12 w-12 overflow-hidden opacity-50">
                  <div className="absolute -right-2 -top-2 h-8 w-8 rotate-45 bg-primary-500/10 dark:bg-primary-400/10" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
