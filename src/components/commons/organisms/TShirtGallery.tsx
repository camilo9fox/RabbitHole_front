'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import Image from '@/components/commons/atoms/Image';
import Text from '@/components/commons/atoms/Text';

interface TShirt {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
}

interface TShirtGalleryProps {
  title: string;
  subtitle: string;
  tshirts: TShirt[];
  className?: string;
}

const TShirtGallery = ({ title, subtitle, tshirts, className = '' }: TShirtGalleryProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    if (!sectionRef.current || !titleRef.current || !galleryRef.current) return;
    
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
    
    // Animación de las poleras
    const items = galleryRef.current.querySelectorAll('.tshirt-item');
    gsap.fromTo(
      items,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.1,
        duration: 0.6,
        scrollTrigger: {
          trigger: galleryRef.current,
          start: "top bottom-=50",
          toggleActions: "play none none reverse"
        }
      }
    );
    
    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [tshirts]);
  
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
        
        <div 
          ref={galleryRef} 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {tshirts.map((tshirt) => (
            <div 
              key={tshirt.id} 
              className="tshirt-item group relative bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl border border-border/30"
            >
              <div className="relative h-80 overflow-hidden">
                <Image
                  src={tshirt.image}
                  alt={tshirt.name}
                  width={400}
                  height={500}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-10 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <button className="w-full py-3 px-4 bg-[#14213d] text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors shadow-md">
                    Personalizar
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <Text variant="h3" className="text-foreground font-medium">
                    {tshirt.name}
                  </Text>
                  <Text variant="body" className="text-accent font-bold">
                    ${tshirt.price}
                  </Text>
                </div>
                <Text variant="body" className="text-muted text-sm">
                  {tshirt.category}
                </Text>
              </div>
              
              {/* Badge de categoría */}
              <div className="absolute top-3 left-3 bg-accent/90 backdrop-blur-sm text-black text-sm py-1 px-3 rounded-md font-bold shadow-md">
                {tshirt.category}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TShirtGallery;
