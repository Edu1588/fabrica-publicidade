import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LiquidImage from './LiquidImage';
import { useLanguage } from '../../contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

export default function Section3V2() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    // Liquid entrance effect for text
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 60%", // Triggers slightly later than Section 2
        toggleActions: "play none none reverse"
      }
    });

    if (displacementRef.current) {
      tl.to(displacementRef.current, {
        attr: { scale: 100 },
        duration: 0
      })
      .to(displacementRef.current, {
        attr: { scale: 0 },
        duration: 2.5,
        ease: 'power3.out'
      }, 0);
    }

    if (textRefs.current.length > 0) {
      tl.fromTo(textRefs.current, 
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5, stagger: 0.2, ease: 'power3.out' },
        0.5
      );
    }

    // Simple fade up for body text
    const fadeElements = gsap.utils.toArray('.fade-up-text-s3');
    fadeElements.forEach((el: any) => {
      gsap.fromTo(el, 
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 1.5, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  }, [language]);

  return (
    <section id="projects" ref={sectionRef} className="relative min-h-screen bg-[#020205] px-6 md:px-10 flex items-stretch z-10 overflow-hidden">
      <svg className="fixed pointer-events-none w-0 h-0">
        <defs>
          <filter id="section3-liquid" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="1" result="warp" />
            <feDisplacementMap 
              ref={displacementRef}
              xChannelSelector="R" 
              yChannelSelector="G" 
              scale="0" 
              in="SourceGraphic" 
              in2="warp" 
            />
          </filter>
        </defs>
      </svg>
      
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C46A1A]/5 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Left Rotated Text - Sticky */}
      <div className="hidden lg:block w-24 relative shrink-0 z-20">
        <div className="sticky top-[50vh] -translate-y-1/2 flex items-center justify-center">
          <div 
            className="transform -rotate-90 origin-center text-[#F5F2EC] tracking-[0.2em] text-lg uppercase whitespace-nowrap"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {t('Projetos', 'Projects')}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full flex flex-col lg:flex-row relative z-10">
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-center py-32 mt-20 lg:mt-0 lg:pl-16">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            {/* Text Side */}
            <div>
              <div key={language} className="mb-12" style={{ fontFamily: 'var(--font-heading)', filter: 'url(#section3-liquid)' }}>
                <div className="overflow-hidden mb-2">
                  <h2 ref={el => { textRefs.current[0] = el; }} className="text-4xl md:text-5xl lg:text-6xl font-light text-[#F5F2EC] leading-[1.1] transform-gpu">
                    {t('O Nosso Legado', 'Our Legacy')}
                  </h2>
                </div>
                <div className="overflow-hidden mb-2">
                  <h2 ref={el => { textRefs.current[1] = el; }} className="text-4xl md:text-5xl lg:text-6xl font-light text-[#F5F2EC] leading-[1.1] transform-gpu">
                    {t('Em Construção', 'Under Construction')}
                  </h2>
                </div>
              </div>

              <div key={`${language}-text`} className="max-w-md text-sm md:text-base text-[#F5F2EC]/70 font-light leading-loose fade-up-text-s3">
                <p className="mb-6">
                  {t('Cada projeto é uma prova da nossa dedicação à excelência e à visão. Nós não apenas construímos; nós forjamos experiências digitais que ressoam com propósito e precisão.', 'Each project is a testament to our dedication to excellence and vision. We do not simply build; we forge digital experiences that resonate with purpose and precision.')}
                </p>
                <div className="mt-12 flex items-center gap-4 cursor-pointer group w-fit">
                   <div className="w-12 h-[1px] bg-white group-hover:w-16 transition-all duration-300"></div>
                   <span className="text-xs uppercase tracking-widest font-sans group-hover:opacity-70 transition-opacity">
                     {t('Explorar Tudo', 'Explore All')}
                   </span>
                </div>
              </div>
            </div>

            {/* Images Side */}
            <div className="relative h-[500px] lg:h-[700px] w-full flex items-center justify-center">
              {/* Project 1 */}
              <div className="absolute w-[70%] h-[60%] top-[10%] right-0 z-10 shadow-2xl overflow-hidden group">
                 <div className="w-full h-full transform transition-transform duration-1000 group-hover:scale-105">
                   <LiquidImage src="https://picsum.photos/id/40/800/800" className="w-full h-full object-cover" />
                 </div>
              </div>
              
              {/* Project 2 */}
              <div className="absolute w-[60%] h-[50%] bottom-[10%] left-0 z-20 shadow-2xl overflow-hidden group">
                 <div className="w-full h-full transform transition-transform duration-1000 group-hover:scale-105">
                   <LiquidImage src="https://picsum.photos/id/60/800/600" className="w-full h-full object-cover" />
                 </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
