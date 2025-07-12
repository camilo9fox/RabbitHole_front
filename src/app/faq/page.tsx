"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "¿Cuánto tarda en llegar mi pedido?",
    a: "Los tiempos de entrega dependen de tu ubicación. Dentro de Santiago el despacho demora 2–3 días hábiles; otras regiones entre 3–5 días y zonas extremas 5–8 días hábiles.",
  },
  {
    q: "¿Cómo sé si mi diseño personalizado fue aprobado?",
    a: 'Te enviaremos un correo tan pronto nuestro equipo de revisión apruebe (o rechace) tu diseño. También podrás verlo en la sección "Mis Órdenes".',
  },
  {
    q: "¿Puedo cambiar o devolver un producto?",
    a: "Sí. Tienes 30 días corridos desde la recepción para solicitar cambio o devolución siempre que el producto esté sin uso y con su empaque original.",
  },
  {
    q: "¿Qué pasa si mi diseño es rechazado?",
    a: "El pedido principal sigue su curso. Solo se descarta el diseño rechazado y se reembolsa el monto correspondiente en un plazo de 3-5 días hábiles.",
  },
  {
    q: "¿Qué métodos de pago aceptan?",
    a: "Tarjetas de débito y crédito nacionales, transferencias bancarias.",
  },
  {
    q: "¿Realizan envíos internacionales?",
    a: "Por ahora solo enviamos dentro de Chile continental. Estamos trabajando para habilitar envíos internacionales pronto.",
  },
];

export default function FAQPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => setMounted(true), []);

  const headingColor = mounted
    ? isDark
      ? "text-white"
      : "text-gray-900"
    : "text-gray-900 dark:text-white";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80 dark:from-background/90 dark:to-background px-4 md:px-8 lg:px-32 py-24">
      <div className="max-w-4xl w-full mx-auto space-y-10 bg-card/60 backdrop-blur-md shadow-xl rounded-xl p-10 border border-gray-200 dark:border-white/15">
        <header className="space-y-3 text-center">
          <h1
            className={`text-3xl md:text-4xl font-bold tracking-tight ${headingColor}`}
            suppressHydrationWarning
          >
            Preguntas Frecuentes
          </h1>
          <p className="text-secondary/80 max-w-2xl mx-auto">
            Encuentra respuestas a las dudas más comunes sobre nuestros
            productos, envíos y políticas.
          </p>
        </header>

        <div className="divide-y divide-gray-300 dark:divide-gray-700">
          {faqs.map((item, idx) => (
            <div key={idx} className="py-6">
              <button
                type="button"
                onClick={() =>
                  setOpenIndex((prev) => (prev === idx ? null : idx))
                }
                className="w-full flex justify-between items-center text-left focus:outline-none"
              >
                <span className="font-medium">{item.q}</span>
                <ChevronDown
                  className={`h-5 w-5 transform transition-transform ${
                    openIndex === idx ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
              {openIndex === idx && (
                <p className="mt-4 text-secondary/80">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
