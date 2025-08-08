"use client";

import { useState, useEffect } from 'react';

const useIsDesktop = (breakpoint = 768) => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Set initial state after mount to ensure window is available
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= breakpoint);
    };
    
    checkScreenSize();

    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [breakpoint]);

  return isDesktop;
};

export default useIsDesktop;
