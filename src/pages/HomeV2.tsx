import React, { useState, useEffect } from 'react';
import SmoothScroller from '../components/Layout/SmoothScroller';
import LoaderV2 from '../components/V2/LoaderV2';
import HeroV2 from '../components/V2/HeroV2';
import Section2V2 from '../components/V2/Section2V2';
import Section3V2 from '../components/V2/Section3V2';
import FixedOverlayV2 from '../components/V2/FixedOverlayV2';

export default function HomeV2() {
  const [loading, setLoading] = useState(true);

  // We handle loading state in this component to reveal the content
  useEffect(() => {
    // Artificial delay to show loader
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4500); // 4.5 seconds for the loader animation

    return () => clearTimeout(timer);
  }, []);

  return (
    <SmoothScroller>
      <div className="bg-[#0c0c0c] min-h-screen text-[#F5F2EC] font-serif selection:bg-[#C46A1A] selection:text-white relative" style={{ fontFamily: 'var(--font-heading)' }}>
        <LoaderV2 isLoading={loading} />
        
        {/* Only render fixed overlay content once loading is finishing up to avoid initial scroll flash */}
        <div className={`transition-opacity duration-1000 ${loading ? 'opacity-0 pointer-events-none' : 'opacity-100'} relative z-40`}>
          <FixedOverlayV2 />
        </div>
          
        <main className="flex flex-col">
          <HeroV2 />
          <Section2V2 />
          <Section3V2 />
        </main>
      </div>
    </SmoothScroller>
  );
}
