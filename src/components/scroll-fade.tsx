"use client";

import { useEffect, useRef } from "react";

export default function ScrollFade({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const updateOpacity = () => {
      if (!containerRef.current) return;
      
      const scrollY = window.scrollY;
      const newOpacity = Math.max(0, 1 - scrollY / 450);
      
      containerRef.current.style.opacity = newOpacity.toString();
      containerRef.current.style.pointerEvents = newOpacity === 0 ? "none" : "auto";
      
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateOpacity);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Initial setup
    updateOpacity();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative", zIndex: 10 }}>
      {children}
    </div>
  );
}
