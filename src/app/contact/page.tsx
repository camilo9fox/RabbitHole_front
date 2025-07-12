"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  const headingColor = mounted
    ? isDark
      ? "text-white"
      : "text-gray-900"
    : "text-gray-900 dark:text-white";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80 dark:from-background/90 dark:to-background px-4 md:px-8 lg:px-32 py-24">
      <div className="max-w-3xl w-full mx-auto space-y-10 bg-card/60 backdrop-blur-md shadow-xl rounded-xl p-10 border border-gray-200 dark:border-white/15">
        <header className="space-y-3 text-center">
          <h1
            className={`text-3xl md:text-4xl font-bold tracking-tight ${headingColor}`}
            suppressHydrationWarning
          >
            Contáctanos
          </h1>
          <p className="text-secondary/80 max-w-2xl mx-auto">
            ¿Tienes alguna pregunta o comentario? Completa el formulario y te
            responderemos lo antes posible.
          </p>
        </header>

        {sent ? (
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="h-12 w-12 text-accent" />
            <p className="text-lg font-medium text-center">
              ¡Gracias por contactarnos! Hemos recibido tu mensaje y te
              responderemos pronto.
            </p>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-1">
                <label htmlFor="name" className="font-medium">
                  Nombre
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  className="px-4 py-2 rounded-md bg-background border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="email" className="font-medium">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="px-4 py-2 rounded-md bg-background border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <label htmlFor="message" className="font-medium">
                Mensaje
              </label>
              <textarea
                id="message"
                required
                rows={5}
                className="px-4 py-2 rounded-md bg-background border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto inline-flex items-center justify-center px-6 py-2 rounded-md font-medium bg-accent border shadow hover:bg-accent/90 dark:hover:bg-accent/80 dark:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar mensaje"}
            </button>
          </form>
        )}

        <div className="border-t border-gray-300 dark:border-gray-700 pt-8 grid md:grid-cols-3 gap-6 text-secondary/80">
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-accent mt-0.5" />
            <span>Av. Providencia 1234, Santiago, Chile</span>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="h-5 w-5 text-accent" />
            <span>+56 9 1234 5678</span>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-accent" />
            <span>info@rabbithole.cl</span>
          </div>
        </div>
      </div>
    </main>
  );
}
