'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/dist/SplitText';
import Text from '@/components/commons/atoms/Text';

interface AnimatedTextProps {
  text: string;
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body';
  className?: string;
  animationType?: 'chars' | 'words' | 'lines';
  staggerAmount?: number;
  delay?: number;
}

const AnimatedText = ({
  text,
  variant,
  className = '',
  animationType = 'chars',
  staggerAmount = 0.05,
  delay = 0
}: AnimatedTextProps) => {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Registrar SplitText plugin
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(SplitText);
      
      if (!textRef.current) return;
      
      // Crear la división de texto
      const splitType: 'chars' | 'words' | 'lines' = animationType;
      const split = new SplitText(textRef.current, { 
        type: splitType,
        linesClass: "split-line",
        wordsClass: "split-word",
        charsClass: "split-char"
      });
      
      // Configurar la animación según el tipo
      let elements;
      switch (splitType) {
        case 'chars':
          elements = split.chars;
          break;
        case 'words':
          elements = split.words;
          break;
        case 'lines':
          elements = split.lines;
          break;
      }
      
      // Animación inicial
      gsap.set(elements, { 
        y: 50,
        opacity: 0 
      });
      
      // Animación de entrada
      gsap.to(elements, {
        y: 0,
        opacity: 1,
        stagger: staggerAmount,
        duration: 0.8,
        ease: "power3.out",
        delay: delay
      });
      
      // Limpiar
      return () => {
        split.revert();
      };
    }
  }, [text, animationType, staggerAmount, delay]);

  return (
    <div ref={textRef} className={className}>
      <Text variant={variant}>
        {text}
      </Text>
    </div>
  );
};

export default AnimatedText;
