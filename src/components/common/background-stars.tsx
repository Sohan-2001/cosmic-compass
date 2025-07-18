'use client';
import { useEffect, useState } from 'react';

export function BackgroundStars() {
  const [stars, setStars] = useState<{
    left: string;
    top: string;
    animationDuration: string;
    animationDelay: string;
    size: string;
  }[]>([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars = Array.from({ length: 100 }).map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 2 + 3}s`,
        animationDelay: `${Math.random() * 3}s`,
        size: `${Math.random() * 2 + 1}px`,
      }));
      setStars(newStars);
    };
    generateStars();
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
      {stars.map((star, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDuration: star.animationDuration,
            animationDelay: star.animationDelay,
          }}
        />
      ))}
    </div>
  );
}
