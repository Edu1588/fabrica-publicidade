import { useState, useEffect } from 'react';
import { getCorsSafeImageUrl } from '../utils/imageLoader';

export const CorsImage = ({ src, alt, className, style }: { src: string, alt?: string, className?: string, style?: any }) => {
  const [safeSrc, setSafeSrc] = useState<string>(src);
  
  useEffect(() => {
    let active = true;
    if (src) {
      getCorsSafeImageUrl(src).then(url => {
        if (active) setSafeSrc(url);
      });
    } else {
      setSafeSrc('');
    }
    return () => { active = false; };
  }, [src]);

  return <img src={safeSrc} alt={alt} className={className} style={style} crossOrigin="anonymous" />;
};
