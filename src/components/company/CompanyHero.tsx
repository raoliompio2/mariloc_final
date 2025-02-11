import { motion } from 'framer-motion'
import { CompanyHero as CompanyHeroType } from '../../types/company'

interface CompanyHeroProps {
  data: CompanyHeroType
}

export function CompanyHero({ data }: CompanyHeroProps) {
  // Debug
  console.log('CompanyHero data:', data)

  // Validate required data
  if (!data) {
    console.error('No hero data provided')
    return null
  }

  return (
    <div className="bg-surface-50 dark:bg-surface-900 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="relative h-[40vh] overflow-hidden rounded-3xl">
          {data.video_url ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
              poster={data.poster_url}
              onError={(e) => console.error('Video error:', e)}
            >
              <source src={data.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : data.poster_url ? (
            <img
              src={data.poster_url}
              alt={data.title || 'Hero background'}
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              decoding="sync"
              onError={(e) => {
                console.error('Image load error:', e)
                console.log('Failed to load image:', data.poster_url)
              }}
            />
          ) : null}
          <div className="absolute inset-0 bg-surface-900/60" />
          
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl"
            >
              {data.title}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-3xl text-base text-surface-200 dark:text-surface-300 md:text-lg"
            >
              {data.subtitle}
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  )
}
