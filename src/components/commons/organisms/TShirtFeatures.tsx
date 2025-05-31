'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import Image from '@/components/commons/atoms/Image';
import Text from '@/components/commons/atoms/Text';

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface TShirtFeaturesProps {
  title: string;
  subtitle: string;
  features: Feature[];
  className?: string;
}

const TShirtFeatures = ({ title, subtitle, features, className = '' }: TShirtFeaturesProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    if (!sectionRef.current || !titleRef.current || !featuresRef.current || !imageRef.current) return;
    
    // Animación del título
    gsap.fromTo(
      titleRef.current.children,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.2,
        duration: 0.8,
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top bottom-=100",
          toggleActions: "play none none reverse"
        }
      }
    );
    
    // Animación de la imagen
    gsap.fromTo(
      imageRef.current,
      { x: 50, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 1,
        scrollTrigger: {
          trigger: imageRef.current,
          start: "top bottom-=100",
          toggleActions: "play none none reverse"
        }
      }
    );
    
    // Animación de las características
    const items = featuresRef.current.querySelectorAll('.feature-item');
    gsap.fromTo(
      items,
      { x: -30, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        stagger: 0.2,
        duration: 0.8,
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top bottom-=100",
          toggleActions: "play none none reverse"
        }
      }
    );
    
    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [features]);
  
  return (
    <section ref={sectionRef} className={`py-20 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={titleRef} className="text-center mb-16">
          <Text variant="h2" className="text-4xl font-bold text-foreground mb-4">
            {title}
          </Text>
          <Text variant="body" className="text-xl text-muted max-w-2xl mx-auto">
            {subtitle}
          </Text>
        </div>
        
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div ref={featuresRef} className="lg:w-1/2 space-y-6">
            {features.map((feature) => (
              <div 
                key={feature.id} 
                className="feature-item flex items-start p-6 bg-card/80 backdrop-blur-sm rounded-xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg border border-border/30"
              >
                <div className="text-4xl text-accent mr-4">
                  {feature.icon}
                </div>
                <div>
                  <Text variant="h3" className="text-foreground font-medium mb-2">
                    {feature.title}
                  </Text>
                  <Text variant="body" className="text-muted">
                    {feature.description}
                  </Text>
                </div>
              </div>
            ))}
          </div>
          
          <div ref={imageRef} className="lg:w-1/2 relative">
            <div className="relative w-full h-[500px] rounded-xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800"
                alt="Poleras de calidad"
                width={800}
                height={800}
                className="w-full h-full object-cover"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-6 left-6 right-6 p-6 bg-black/80 backdrop-blur-sm rounded-lg border border-border/30">
                <Text variant="h3" className="text-white font-bold mb-2">
                  Calidad Premium Garantizada
                </Text>
                <Text variant="body" className="text-white">
                  Nuestras poleras están hechas con los mejores materiales para garantizar durabilidad y comodidad.
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TShirtFeatures;
