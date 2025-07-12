"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function TermsPage() {
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
            Términos y Condiciones
          </h1>
          <p className="text-secondary/80 max-w-2xl mx-auto">
            Revisa las condiciones que rigen el uso de nuestro sitio y la compra
            de productos.
          </p>
        </header>

        <section className="space-y-6 text-secondary/80">
          <h2 className="text-xl font-semibold text-foreground">
            1. Información General
          </h2>
          <p>
            RabbitHole SpA (en adelante, “RabbitHole”) opera el sitio web
            <strong> rabbithole.cl </strong>. Al acceder y utilizar este sitio
            aceptas estar sujeto a los presentes Términos y Condiciones.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            2. Registro y Cuenta
          </h2>
          <p>
            No es obligatorio crear una cuenta para realizar un pedido ni para subir un diseño personalizado; puedes hacerlo como invitado. Sin embargo, recomendamos registrarte con un correo válido para llevar control de tus órdenes, acceder a tu historial y agilizar futuros procesos. Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            3. Precios y Pagos
          </h2>
          <p>
            Todos los precios están en pesos chilenos (CLP) e incluyen IVA. Los
            métodos de pago disponibles son tarjetas de débito/crédito y
            transferencias bancarias. Nos reservamos el derecho de modificar los
            precios sin aviso previo.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            4. Propiedad Intelectual
          </h2>
          <p>
            Todo contenido del sitio, incluidos logos, textos e imágenes, es
            propiedad de RabbitHole o sus licenciantes. Queda prohibido el uso
            no autorizado con fines comerciales.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            5. Diseños Personalizados
          </h2>
          <p>
            El usuario garantiza tener los derechos necesarios sobre los diseños
            que sube. RabbitHole puede rechazar diseños que infrinjan derechos
            de autor o contengan material ofensivo.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            6. Limitación de Responsabilidad
          </h2>
          <p>
            RabbitHole no será responsable por daños indirectos, incidentales o
            consecuentes que surjan del uso del sitio o de la imposibilidad de
            utilizarlo.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            7. Modificaciones
          </h2>
          <p>
            Podemos actualizar estos términos en cualquier momento. Los cambios
            tendrán efecto una vez publicados en el sitio.
          </p>

          <h2 className="text-xl font-semibold text-foreground">8. Contacto</h2>
          <p>
            Para consultas sobre estos términos, escríbenos a
            <a
              href="mailto:legal@rabbithole.cl"
              className="text-accent underline ml-1"
            >
              legal@rabbithole.cl
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
