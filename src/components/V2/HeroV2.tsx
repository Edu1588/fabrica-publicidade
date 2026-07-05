import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useLanguage } from '../../contexts/LanguageContext';
import ProceduralSmoke from './ProceduralSmoke';

export default function HeroV2() {
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const { language, t } = useLanguage();
  
  const headlinePt = localStorage.getItem('aforja_headline_pt') || "Grandes marcas não nascem prontas.";
  const headlineEn = localStorage.getItem('aforja_headline_en') || "Great brands are not born ready.";
  const text = t(headlinePt, headlineEn);
  const chars = text.split("");
  
  const smokeEnabled = localStorage.getItem('aforja_smoke_enabled') !== 'false';
  
  useEffect(() => {
    // Delay matches the previous Loader timing
    if (textRef.current) {
      gsap.to(textRef.current.children, {
        opacity: 1,
        duration: 1.5,
        stagger: 0.05,
        ease: 'power2.inOut',
        delay: 0.5
      });
    }
    
    if (displacementRef.current) {
      gsap.fromTo(displacementRef.current,
        { attr: { scale: 100 } },
        { attr: { scale: 0 }, duration: 2.5, ease: 'power3.out', delay: 0.5 }
      );
    }
  }, [language, text]); // Re-run animation when language or text changes

  return (
    <section className="relative h-screen w-full flex flex-col justify-center bg-[#0c0c0c] overflow-hidden">
      {smokeEnabled && <ProceduralSmoke />}
      <svg className="fixed pointer-events-none w-0 h-0">
        <defs>
          <filter id="hero-liquid" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="1" result="warp" />
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
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 opacity-60 scale-105"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?q=80&w=2000&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent"></div>
      </div>

      <div className="relative z-[101] px-6 md:px-24 lg:px-40 max-w-7xl mx-auto w-full">
        <h1 
          key={language}
          ref={textRef}
          className="text-2xl md:text-3xl lg:text-4xl font-light tracking-wide text-[#F5F2EC]"
          style={{ fontFamily: 'var(--font-heading)', filter: 'url(#hero-liquid)' }}
        >
          {chars.map((char, index) => (
            <span key={index} className="opacity-0">
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>
      </div>
    </section>
  );
}
