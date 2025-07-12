"use client";

import React, { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Text from "@/components/commons/atoms/Text";
import SimpleHero from "@/components/commons/organisms/SimpleHero";
import TShirtGallery from "@/components/commons/organisms/TShirtGallery";
import TShirtFeatures from "@/components/commons/organisms/TShirtFeatures";
import Link from "next/link";

interface TShirt {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
}

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export default function Home() {
  useEffect(() => {
    // Inicializar ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  // Datos para las poleras destacadas
  const featuredTShirts: TShirt[] = [
    {
      id: "tshirt-1",
      name: "Urban Explorer",
      image:
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600",
      price: 24.99,
      category: "Urbano",
    },
    {
      id: "tshirt-2",
      name: "Minimal White",
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
      price: 22.99,
      category: "Minimalista",
    },
    {
      id: "tshirt-3",
      name: "Nature Vibes",
      image: "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600",
      price: 26.99,
      category: "Naturaleza",
    },
    {
      id: "tshirt-4",
      name: "Geometric Art",
      image:
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600",
      price: 25.99,
      category: "Geométrico",
    },
    {
      id: "tshirt-5",
      name: "Vintage Style",
      image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600",
      price: 27.99,
      category: "Vintage",
    },
    {
      id: "tshirt-6",
      name: "Typography Bold",
      image:
        "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=600",
      price: 23.99,
      category: "Tipografía",
    },
  ];

  // Datos para las características
  const tshirtFeatures: Feature[] = [
    {
      id: "feature-1",
      icon: "🎨",
      title: "Diseño Personalizado",
      description:
        "Crea poleras únicas con nuestras herramientas de diseño intuitivas. Sube tus imágenes o utiliza nuestra biblioteca de elementos.",
    },
    {
      id: "feature-2",
      icon: "👕",
      title: "Calidad Premium",
      description:
        "Nuestras poleras están fabricadas con algodón 100% de alta calidad, garantizando durabilidad y comodidad.",
    },
    {
      id: "feature-3",
      icon: "⚡",
      title: "Entrega Rápida",
      description:
        "Recibe tu pedido en tiempo récord. Entregamos en todo Chile en un plazo de 24-48 horas.",
    },
    {
      id: "feature-4",
      icon: "💳",
      title: "Precios Competitivos",
      description:
        "Ofrecemos la mejor relación calidad-precio del mercado, con descuentos por volumen para grupos.",
    },
  ];

  return (
    <div className="bg-background">
      {/* Hero Section Simple y Efectivo */}
      <SimpleHero />

      {/* Sección de Características de las Poleras */}
      <TShirtFeatures
        title="Por qué elegir nuestras poleras"
        subtitle="Descubre lo que hace únicas a nuestras poleras personalizadas"
        features={tshirtFeatures}
        className="bg-gradient-to-b from-background to-background/90"
      />

      {/* Galería de Poleras */}
      <TShirtGallery
        title="Poleras Destacadas"
        subtitle="Explora nuestra selección de poleras más populares"
        tshirts={featuredTShirts}
        className="bg-gradient-to-b from-background/90 to-background/80"
      />

      {/* Sección CTA */}
      <section className="py-20 bg-gradient-to-b from-background/80 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Text
            variant="h2"
            className="text-4xl font-bold text-foreground mb-6"
          >
            ¡Crea tu polera personalizada hoy!
          </Text>

          <Text
            variant="body"
            className="text-xl text-muted mb-12 max-w-3xl mx-auto"
          >
            Únete a miles de personas que ya han creado sus poleras únicas con
            Rabbit Hole. Proceso sencillo, calidad garantizada y entrega rápida.
          </Text>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/customize"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <span>Comenzar a Diseñar</span>
              <svg
                className="ml-2 w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>

            <Link
              href="/shop"
              className="px-8 py-4 border-2 border-blue-500/30 text-foreground rounded-lg font-medium hover:border-blue-600 hover:text-blue-600 transition-colors"
            >
              Ver Galería
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-card rounded-lg border border-border/30">
              <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
              <div className="text-muted">Diseños disponibles</div>
            </div>

            <div className="p-6 bg-card rounded-lg border border-border/30">
              <div className="text-4xl font-bold text-blue-600 mb-2">24h</div>
              <div className="text-muted">Tiempo de entrega</div>
            </div>

            <div className="p-6 bg-card rounded-lg border border-border/30">
              <div className="text-4xl font-bold text-blue-600 mb-2">5⭐</div>
              <div className="text-muted">Valoración de clientes</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
