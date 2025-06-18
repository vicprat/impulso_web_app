'use client';

import { useState, useCallback, RefObject } from 'react';

type MousePosition = {
  x: number;
  y: number;
}

const INITIAL_STATE: MousePosition = {
  x: 0,
  y: 0
}

export const useMouseTracking = (containerRef?: RefObject<HTMLElement>) => {
  
  const [state, setState] = useState(INITIAL_STATE) 
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    let rect: DOMRect;
    
    if (containerRef?.current) {
      rect = containerRef.current.getBoundingClientRect();
    } else {
      rect = e.currentTarget.getBoundingClientRect();
    }

    setState({
      ...state,
      x: (e.clientX - rect.left - rect.width / 2) / rect.width,
      y: (e.clientY - rect.top - rect.height / 2) / rect.height,
    });
  }, [containerRef, state]);

  return {
    mousePosition: state,
    handleMouseMove
  };
};