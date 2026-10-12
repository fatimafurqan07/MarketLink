import React, { useState, useRef, useEffect, useCallback } from 'react';

interface Card3DTiltProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  perspective?: number;
  glare?: boolean;
}

export const Card3DTilt: React.FC<Card3DTiltProps> = React.memo(({
  children,
  className = '',
  intensity = 10,
  perspective = 1000,
  glare = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<string>('rotateX(0deg) rotateY(0deg)');
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const rafId = useRef<number | null>(null);
  const isReducedMotion = useRef<boolean>(false);

  useEffect(() => {
    isReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isReducedMotion.current || !cardRef.current) return;

    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
    }

    const clientX = e.clientX;
    const clientY = e.clientY;

    rafId.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Safe bounds calculation with clamped rotation
      const rX = Math.max(-intensity, Math.min(intensity, ((y - centerY) / centerY) * -intensity));
      const rY = Math.max(-intensity, Math.min(intensity, ((x - centerX) / centerX) * intensity));

      setTransformStyle(`rotateX(${rX.toFixed(2)}deg) rotateY(${rY.toFixed(2)}deg) translateZ(8px)`);

      if (glare) {
        setGlarePos({
          x: Math.round((x / rect.width) * 100),
          y: Math.round((y / rect.height) * 100),
          opacity: 0.18,
        });
      }
    });
  }, [intensity, glare]);

  const handleMouseLeave = useCallback(() => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
    }
    setTransformStyle('rotateX(0deg) rotateY(0deg) translateZ(0px)');
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  useEffect(() => {
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: `${perspective}px`,
        contain: 'layout style',
      }}
      className="relative transition-transform duration-200 ease-out will-change-transform"
    >
      <div
        style={{
          transform: transformStyle,
          transformStyle: 'preserve-3d',
        }}
        className={`relative transition-transform duration-200 ease-out will-change-transform ${className}`}
      >
        {children}

        {/* Dynamic 3D Glare Sheen Overlay */}
        {glare && (
          <div
            aria-hidden="true"
            style={{
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 60%)`,
              opacity: glarePos.opacity,
            }}
            className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300 z-30 backface-hidden"
          />
        )}
      </div>
    </div>
  );
});

Card3DTilt.displayName = 'Card3DTilt';
