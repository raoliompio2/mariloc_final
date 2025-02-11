import { motion } from 'framer-motion'
import { useCompanyContent } from '../hooks/useCompanyContent'
import { CompanyHero } from '../components/company/CompanyHero'
import { MissionVisionValues } from '../components/company/MissionVisionValues'
import { CompanyTimeline } from '../components/company/CompanyTimeline'
import { Loader2 } from 'lucide-react'
import { DynamicIcon } from '../components/company/DynamicIcon'

export default function Company() {
  const { hero, missionVisionValues, timeline, values, sectors, certifications, isLoading } = useCompanyContent()

  // Debug
  console.log('Company page data:', { hero, missionVisionValues, timeline, values, sectors, certifications })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden bg-surface-50 dark:bg-surface-900">
      {/* Hero Section */}
      {hero && hero.length > 0 && <CompanyHero data={hero[0]} />}

      {/* Mission, Vision, Values Section */}
      {missionVisionValues && <MissionVisionValues items={missionVisionValues} />}

      {/* Timeline Section */}
      {timeline && <CompanyTimeline items={timeline} />}

      {/* Nossos Valores em Detalhes */}
      <div className="bg-gradient-to-b from-surface-50 to-white dark:from-surface-900 dark:to-surface-800 py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-surface-900 dark:text-surface-50">
              Nossos Valores em Prática
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-surface-600 dark:text-surface-400">
              Princípios que norteiam nossa atuação e relacionamento com clientes e parceiros
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values?.map((value, index) => (
              <motion.div
                key={value.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-surface-200/50 dark:border-surface-700/50 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                {/* Imagem com efeito sutil */}
                <div className="relative aspect-[16/9] overflow-hidden bg-surface-100 dark:bg-surface-800">
                  <motion.img
                    src={value.image_url}
                    alt={value.title}
                    className="absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-110"
                  />
                </div>

                {/* Conteúdo */}
                <div className="relative p-6">
                  <motion.h3
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl font-bold mb-3 text-surface-900 dark:text-surface-50 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300"
                  >
                    {value.title}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-surface-600 dark:text-surface-400 line-clamp-3 group-hover:line-clamp-none transition-all duration-300"
                  >
                    {value.description}
                  </motion.p>

                  {/* Linha decorativa */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/20 dark:via-primary-400/20 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </div>

                {/* Decorative dot */}
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary-500/50 dark:bg-primary-400/50" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
