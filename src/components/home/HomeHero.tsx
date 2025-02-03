import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { BrandsCarousel } from './BrandsCarousel';

interface HeroProps {
  companyName: string;
  title: string;
  highlightedWord: string;
  subtitle: string;
}

export function HomeHero({
  companyName = "Mariloc Locação de Máquinas e Equipamentos",
  title = "A Ferramenta",
  highlightedWord = "certa",
  subtitle = "As melhores marcas mundiais, você aluga na Mariloc,\nde Profissional para Profissional.",
}: Partial<HeroProps>) {
  const systemSettings = useSelector((state: RootState) => state.theme.systemSettings);
  const logos = systemSettings?.featured_logos || [];

  return (
    <>
      {/* Hero Banner */}
      <section className="pt-16 pb-12 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4">
          {/* Container com bordas arredondadas */}
          <div className="bg-gradient-to-b from-[#990000] to-[#CC0000] dark:from-[#660000] dark:to-[#990000] rounded-2xl overflow-hidden shadow-lg dark:shadow-red-900/20">
            <div className="py-24">
              <div className="text-center flex flex-col items-center gap-8">
                {/* Nome da empresa */}
                <h2 className="text-white/90 dark:text-white/80 text-xl">
                  {companyName}
                </h2>

                {/* Título principal */}
                <div className="text-center">
                  <h1 className="text-[52px] font-bold text-white leading-tight tracking-wide">
                    {title} <span className="text-white">{highlightedWord}</span><br />
                    <span className="text-[52px]">para sua obra.</span>
                  </h1>
                </div>

                {/* Subtítulo */}
                <p className="text-white/90 dark:text-white/80 text-xl max-w-2xl whitespace-pre-line">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Bar */}
      {systemSettings?.featured_logos_enabled && logos.length > 0 && (
        <div className="bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto">
            <BrandsCarousel logos={logos} />
          </div>
        </div>
      )}
    </>
  );
}
