import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LiquidImage from './LiquidImage';
import { useLanguage } from '../../contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

export default function Section2V2() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    // Liquid entrance effect for text
    textRefs.current.forEach((text, index) => {
      if (!text) return;
      
      gsap.fromTo(text, 
        { 
          y: 100, 
          opacity: 0, 
          skewY: 10,
          rotateZ: 5
        },
        {
          y: 0,
          opacity: 1,
          skewY: 0,
          rotateZ: 0,
          duration: 1.5,
          ease: "elastic.out(1, 0.75)",
          scrollTrigger: {
            trigger: text,
            start: "top 85%",
            toggleActions: "play none none reverse"
          },
          delay: index * 0.1
        }
      );
    });

    // Animate the small paragraph
      gsap.fromTo(".fade-up-text",
        { opacity: 0, y: 30 },
        { 
          opacity: 1, y: 0, duration: 1, ease: "power3.out",
          scrollTrigger: {
            trigger: ".fade-up-text",
            start: "top 85%",
          }
        }
      );

      if (textRefs.current[0] && displacementRef.current) {
        gsap.fromTo(displacementRef.current,
          { attr: { scale: 100 } },
          { 
            attr: { scale: 0 },
            duration: 2.5,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: textRefs.current[0],
              start: "top 85%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }
  }, [language]); // React to language change

  return (
    <section id="philosophy" ref={sectionRef} className="relative min-h-screen bg-[#060606] px-6 md:px-10 flex items-stretch z-10">
      <svg className="fixed pointer-events-none w-0 h-0">
        <defs>
          <filter id="section2-liquid" x="-20%" y="-20%" width="140%" height="140%">
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
      {/* Top Left Image */}
      <div className="absolute top-0 left-0 w-64 h-48 md:w-80 md:h-56 hidden md:block opacity-60 mix-blend-lighten pointer-events-none">
        <LiquidImage src="https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?q=80&w=800&auto=format&fit=crop" className="w-full h-full" />
      </div>

      {/* Left Rotated Text - Sticky Removed per user request */}

      <div className="max-w-6xl mx-auto w-full flex flex-col lg:flex-row relative z-10">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-center py-32 mt-20 lg:mt-0 lg:pl-16">
          
          {/* Headline with liquid entrance */}
          <div key={language} className="mb-12" style={{ fontFamily: 'var(--font-heading)', filter: 'url(#section2-liquid)' }}>
            <div className="overflow-hidden mb-2">
              <h2 ref={el => { textRefs.current[0] = el; }} className="text-4xl md:text-5xl lg:text-7xl font-light text-[#F5F2EC] leading-[1.1] transform-gpu">
                {t('São Forjadas', 'They are Forged')}
              </h2>
            </div>
          </div>

          {/* Body Text */}
          <div key={`${language}-text`} className="max-w-md lg:ml-24 text-sm md:text-base text-[#F5F2EC]/70 font-light leading-loose fade-up-text">
            <p className="mb-6">
              {t('Sua empresa já possui o ingrediente mais importante: a vontade de crescer. Nós entramos no processo para moldar sua marca, fortalecer sua presença e transformar potencial em resultados concretos.', 'Your company already has the most important ingredient: the will to grow. We enter the process to mold your brand, strengthen your presence, and transform potential into concrete results.')}
            </p>
          </div>
        </div>

        {/* Right Images */}
        <div className="lg:w-[400px] mt-16 lg:mt-0 relative h-[600px] flex items-center justify-center">
          {/* Main big image */}
          <div className="w-[85%] h-[85%] absolute z-0 shadow-2xl">
            <LiquidImage src="https://images.unsplash.com/photo-1549429712-4eb00db0b84c?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover" />
          </div>
          
          {/* Overlapping small image */}
          <div className="w-1/2 h-1/3 absolute bottom-0 right-0 z-10 shadow-2xl translate-y-12 translate-x-8">
            <LiquidImage src="https://images.unsplash.com/photo-1596707323608-8e6d6d45e43a?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" />
          </div>
        </div>

      </div>
    </section>
  );
}
