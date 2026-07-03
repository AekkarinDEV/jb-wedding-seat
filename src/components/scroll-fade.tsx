"use client";

import { useEffect, useState } from "react";

export default function ScrollFade({ children }: { children: React.ReactNode }) {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      // Get the scroll position
      const scrollY = window.scrollY;
      
      // Calculate opacity: 1 at top, fades to 0 over 200px
      // 0.2 means it fades out very smoothly
      const newOpacity = Math.max(0, 1 - scrollY / 200);
      
      setOpacity(newOpacity);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Check initial position in case of page reload
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ opacity, transition: "opacity 0.1s ease-out", pointerEvents: opacity === 0 ? "none" : "auto" }}>
      {children}
    </div>
  );
}
