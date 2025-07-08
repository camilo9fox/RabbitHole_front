"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const values = [
  {
    icon: "🎨",
    title: "Creatividad",
    desc: "Celebramos la expresión individual y fomentamos la innovación en cada diseño.",
  },
  {
    icon: "✅",
    title: "Calidad",
    desc: "Trabajamos con materiales premium y la mejor tecnología de impresión.",
  },
  {
    icon: "🌱",
    title: "Sustentabilidad",
    desc: "Producimos bajo demanda y usamos tintas eco-friendly para reducir residuos.",
  },
  {
    icon: "🤝",
    title: "Comunidad",
    desc: "Colaboramos con artistas locales y donamos a causas sociales.",
  },
  {
    icon: "🔍",
    title: "Transparencia",
    desc: "Compartimos nuestros procesos y costes abiertamente.",
  },
  {
    icon: "🚀",
    title: "Innovación",
    desc: "Siempre exploramos nuevas técnicas y tendencias para sorprenderte.",
  },
];

export default function AboutPage() {
  const { resolvedTheme } = useTheme();
  const isDarkTheme = resolvedTheme === "dark";
  const cardBg = isDarkTheme ? "bg-gray-800/70" : "bg-white/80";

  return (
    <main className="pt-24 pb-16 px-6 sm:px-10 lg:px-20 max-w-7xl mx-auto space-y-24">
      {/* Hero */}
      <section className="relative rounded-3xl overflow-hidden shadow-lg">
        <Image
          src="https://images.unsplash.com/photo-1468190919318-dda40b332156?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Equipo de Rabbit Hole"
          width={1600}
          height={600}
          priority
          className="w-full h-80 md:h-[28rem] lg:h-[32rem] object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent" />
        <h1 className="absolute bottom-6 left-6 sm:left-10 lg:left-16 text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg">
          Conoce a Rabbit Hole
        </h1>
      </section>

      {/* Historia */}
      <section className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2
            className={`text-3xl font-bold mb-4 ${
              isDarkTheme ? "text-gray-100" : "text-gray-900"
            }`}
          >
            Nuestra historia
          </h2>
          <p
            className={`leading-relaxed mb-4 ${
              isDarkTheme ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Rabbit Hole nació en 2023 cuando un grupo de amigos fanáticos del
            diseño y la moda decidió crear un espacio donde cualquiera pudiera
            plasmar su creatividad en prendas de alta calidad. Lo que empezó en
            un garage con una sola impresora se ha convertido en una tienda
            online que envía a todo Chile y pronto al resto de Latinoamérica.
          </p>
          <p
            className={`leading-relaxed ${
              isDarkTheme ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Nuestra misión es simple: <strong>empoderar tu identidad</strong> a
            través de ropa única, producida de manera ética y sustentable. Cada
            polera se imprime bajo demanda para reducir residuos y utilizamos
            tintas eco-friendly certificadas.
          </p>
        </div>
        <Image
          src="https://images.unsplash.com/photo-1562577309-2592ab84b1bc?auto=format&fit=crop&w=800&q=80"
          alt="Impresión de polera personalizada"
          width={800}
          height={600}
          className="rounded-2xl shadow-md object-cover w-full h-64 md:h-80"
        />
      </section>

      {/* Valores */}
      <section>
        <h2
          className={`text-3xl font-bold text-center mb-12 ${
            isDarkTheme ? "text-gray-100" : "text-gray-900"
          }`}
        >
          Nuestros valores
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((v) => (
            <div
              key={v.title}
              className={`rounded-2xl p-6 shadow transition-colors ${cardBg} backdrop-blur-md`}
            >
              <span className="text-4xl select-none">{v.icon}</span>
              <h3
                className={`text-xl font-semibold mt-4 mb-2 ${
                  isDarkTheme ? "text-gray-100" : "text-gray-900"
                }`}
              >
                {v.title}
              </h3>
              <p
                className={`leading-relaxed text-sm ${
                  isDarkTheme ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center mt-10">
        <h2
          className={`text-3xl font-bold mb-4 ${
            isDarkTheme ? "text-gray-100" : "text-gray-900"
          }`}
        >
          ¿Listo para crear tu polera única?
        </h2>
        <Link
          href="/customize"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white dark:bg-blue-500 hover:bg-blue-700 transition-colors"
        >
          Personalizar ahora <ArrowRight size={20} />
        </Link>
      </section>
    </main>
  );
}
