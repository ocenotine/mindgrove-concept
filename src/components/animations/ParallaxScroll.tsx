
import { useRef, useEffect, useState, ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxScrollProps {
  children: ReactNode;
  speed?: number; // Positive = slower, negative = faster
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  threshold?: [number, number]; // Start and end thresholds
}

export const ParallaxScroll = ({
  children,
  speed = 0.5,
  direction = 'up',
  className = '',
  threshold = [0, 1],
}: ParallaxScrollProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [elementTop, setElementTop] = useState(0);
  const [elementHeight, setElementHeight] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const updatePosition = () => {
      const { top, height } = element.getBoundingClientRect();
      setElementTop(top + window.scrollY);
      setElementHeight(height);
      setClientHeight(window.innerHeight);
    };
    
    updatePosition();
    
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, []);
  
  const { scrollY } = useScroll();
  
  // Calculate scroll progress based on element visibility
  const scrollYProgress = useTransform(
    scrollY, 
    [Math.max(0, elementTop - clientHeight * threshold[0]), elementTop + elementHeight * threshold[1]],
    [0, 1]
  );
  
  // Calculate transform based on direction
  let transform;
  const amount = 100 * speed;
  
  switch (direction) {
    case 'up':
      transform = useTransform(scrollYProgress, [0, 1], [`translateY(${amount}px)`, `translateY(0px)`]);
      break;
    case 'down':
      transform = useTransform(scrollYProgress, [0, 1], [`translateY(-${amount}px)`, `translateY(0px)`]);
      break;
    case 'left':
      transform = useTransform(scrollYProgress, [0, 1], [`translateX(${amount}px)`, `translateX(0px)`]);
      break;
    case 'right':
      transform = useTransform(scrollYProgress, [0, 1], [`translateX(-${amount}px)`, `translateX(0px)`]);
      break;
    default:
      transform = useTransform(scrollYProgress, [0, 1], [`translateY(${amount}px)`, `translateY(0px)`]);
  }
  
  // Calculate opacity
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        transform,
        opacity,
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </motion.div>
  );
};

export default ParallaxScroll;
