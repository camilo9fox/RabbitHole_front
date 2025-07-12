"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function PrivacyPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

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
            Política de Privacidad
          </h1>
          <p className="text-secondary/80 max-w-2xl mx-auto">
            Tu privacidad es importante para nosotros. Conoce cómo recopilamos,
            usamos y protegemos tu información personal.
          </p>
        </header>

        <section className="space-y-6 text-secondary/80">
          <h2 className="text-xl font-semibold text-foreground">1. Información que Recopilamos</h2>
          <p>
            Al realizar una compra o registrarte en Rabbithole, podemos
            solicitar tu nombre, correo electrónico, dirección de envío, número
            de teléfono y datos de pago. También recopilamos información
            relacionada con tu navegación mediante cookies.
          </p>

          <h2 className="text-xl font-semibold text-foreground">2. Uso de la Información</h2>
          <p>
            Utilizamos tus datos para procesar pedidos, personalizar tu
            experiencia, mejorar nuestros servicios y enviarte notificaciones
            relacionadas con tu cuenta o promociones, si así lo permites.
          </p>

          <h2 className="text-xl font-semibold text-foreground">3. Cookies</h2>
          <p>
            Empleamos cookies y tecnologías similares para reconocer tu
            navegador y recopilar datos sobre tu interacción con el sitio.
            Puedes deshabilitarlas desde tu navegador, pero algunas funciones
            podrían verse afectadas.
          </p>

          <h2 className="text-xl font-semibold text-foreground">4. Compartir Información</h2>
          <p>
            No vendemos ni alquilamos tu información personal. Solo la
            compartimos con proveedores de servicios de terceros que nos ayudan
            a operar nuestro negocio (por ejemplo, empresas de logística y
            pasarelas de pago), quienes están obligados a protegerla.
          </p>

          <h2 className="text-xl font-semibold text-foreground">5. Seguridad</h2>
          <p>
            Aplicamos medidas de seguridad técnicas y organizativas para
            proteger tus datos contra accesos no autorizados, pérdida o
            destrucción.
          </p>

          <h2 className="text-xl font-semibold text-foreground">6. Tus Derechos</h2>
          <p>
            Puedes acceder, rectificar o eliminar tu información personal en
            cualquier momento. Para ejercer estos derechos, contáctanos a
            <a href="mailto:privacidad@rabbithole.cl" className="text-accent underline ml-1">privacidad@rabbithole.cl</a>.
          </p>

          <h2 className="text-xl font-semibold text-foreground">7. Cambios en la Política</h2>
          <p>
            RabbitHole puede actualizar esta política ocasionalmente. Publicaremos
            la nueva versión en el sitio e indicaremos la fecha de actualización.
          </p>

          <h2 className="text-xl font-semibold text-foreground">8. Contacto</h2>
          <p>
            Si tienes preguntas sobre esta Política de Privacidad, escríbenos a
            <a href="mailto:privacidad@rabbithole.cl" className="text-accent underline ml-1">privacidad@rabbithole.cl</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
