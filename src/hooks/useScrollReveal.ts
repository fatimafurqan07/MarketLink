import { useEffect, useRef } from 'react';

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  animationDurationMs?: number;
}

/**
 * High-performance IntersectionObserver hook for 60fps on-scroll
 * animations on low-end mobile devices and desktop.
 * Applies will-change: transform ONLY during the active animation phase,
 * and automatically frees GPU texture layers once static to prevent GPU memory bloat.
 * Uses compositor-only properties and auto-containment ('contain: layout style').
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
) {
  const ref = useRef<T>(null);
  const {
    threshold = 0.08,
    rootMargin = '0px 0px -40px 0px',
    triggerOnce = true,
    animationDurationMs = 1200,
  } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Isolate rendering footprint for 60fps on mobile
    element.style.contain = 'layout style';

    // Fallback if IntersectionObserver is unsupported or reduced motion is preferred
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      element.classList.add('is-revealed');
      element.style.willChange = 'auto';
      return;
    }

    const triggerAnimation = () => {
      // 1. Apply will-animate only when animation is about to fire
      element.classList.add('will-animate');

      // 2. Trigger the CSS transition on the next animation frame
      requestAnimationFrame(() => {
        element.classList.add('is-revealed');

        // Check if there are long staggered sequences (e.g. how-it-works 4-step sequence)
        const hasExtendedSequence =
          element.querySelector('.how-it-works-tile-left') ||
          element.id === 'how-it-works-section';
        const effectiveDuration = hasExtendedSequence
          ? Math.max(animationDurationMs, 5000)
          : animationDurationMs;

        // 3. Clean up GPU layer after transition completes to preserve mobile GPU memory
        const timer = setTimeout(() => {
          element.classList.remove('will-animate');
          element.style.willChange = 'auto';
          const childStaggers = element.querySelectorAll('.will-animate');
          childStaggers.forEach((c) => {
            c.classList.remove('will-animate');
            (c as HTMLElement).style.willChange = 'auto';
          });
        }, effectiveDuration);

        return () => clearTimeout(timer);
      });
    };

    // Check if element is already within the initial viewport fold
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      triggerAnimation();
      if (triggerOnce) return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            triggerAnimation();
            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            element.classList.remove('is-revealed');
            element.classList.remove('will-animate');
            element.style.willChange = 'auto';
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, animationDurationMs]);

  return ref;
}
