// Animation utility functions

/**
 * Creates a staggered animation delay based on index
 */
export const getStaggeredDelay = (index: number, baseDelay: number = 100): number => {
  return index * baseDelay;
};

/**
 * Creates intersection observer for scroll-triggered animations
 */
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  threshold: number = 0.1
): IntersectionObserver => {
  return new IntersectionObserver(callback, { threshold });
};

/**
 * Handles mouse movement for interactive elements
 */
export const handleMouseMove = (
  event: MouseEvent,
  setMousePosition: (position: { x: number; y: number }) => void
): void => {
  setMousePosition({ x: event.clientX, y: event.clientY });
};

/**
 * Creates mouse event listeners
 */
export const addMouseListeners = (
  setMousePosition: (position: { x: number; y: number }) => void
): (() => void) => {
  const handleMouseMoveEvent = (e: MouseEvent) => handleMouseMove(e, setMousePosition);
  
  window.addEventListener('mousemove', handleMouseMoveEvent);
  
  return () => window.removeEventListener('mousemove', handleMouseMoveEvent);
};

/**
 * Generates transform style for mouse-following elements
 */
export const getMouseTransform = (
  mousePosition: { x: number; y: number },
  sensitivity: number = 0.01
): React.CSSProperties => {
  return {
    transform: `translate(${mousePosition.x * sensitivity}px, ${mousePosition.y * sensitivity}px)`,
    transition: 'transform 0.3s ease-out',
  };
};

/**
 * Creates CSS class string with conditional classes
 */
export const createClassName = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Generates random delay for animations
 */
export const getRandomDelay = (min: number = 0, max: number = 2000): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
