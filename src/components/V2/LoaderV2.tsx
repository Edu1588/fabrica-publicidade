import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function LoaderV2({ isLoading }: { isLoading: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress number
    let obj = { val: 0 };
    gsap.to(obj, {
      val: 100,
      duration: 3,
      ease: 'power2.inOut',
      onUpdate: () => {
        setProgress(Math.floor(obj.val));
      }
    });
  }, []);

  useEffect(() => {
    if (!isLoading && containerRef.current) {
      // Exit animation
      const tl = gsap.timeline();
      
      tl.to(numberRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power3.inOut'
      }, 0)
      .to(containerRef.current, {
        opacity: 0,
        duration: 1.2,
        ease: 'power2.inOut',
        onComplete: () => {
          if (containerRef.current) {
            containerRef.current.style.pointerEvents = 'none';
          }
        }
      }, 0.5);
    }
  }, [isLoading]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-[#0c0c0c] flex flex-col justify-center text-[#d1cfcb]"
      style={{ fontFamily: 'var(--font-heading)' }}
    >
      
      <div 
        ref={numberRef}
        className="absolute bottom-8 left-6 md:left-24 lg:left-40 text-sm md:text-base font-serif"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {progress}
      </div>
    </div>
  );
}
