"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ShippingAndReturnsPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Fallback to system before hydration
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
            Envío y Devoluciones
          </h1>
          <p className="text-secondary/80 max-w-2xl mx-auto">
            Conoce nuestras políticas de despacho, plazos de entrega y el
            proceso para realizar una devolución o cambio.
          </p>
        </header>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Plazos de Entrega</h2>
          <p>
            Procesamos y despachamos tu pedido dentro de{" "}
            <strong>24 horas </strong>
            hábiles después de la confirmación del pago. Los tiempos de envío
            varían según la región:
          </p>
          <ul className="list-disc space-y-2 ml-6">
            <li>Santiago Urbano: 2–3 días hábiles.</li>
            <li>Regiones Zona Norte y Sur: 3–5 días hábiles.</li>
            <li>Zonas Extremas y Rurales: 5–8 días hábiles.</li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Costos de Envío</h2>
          <p>
            El costo se calcula automáticamente al finalizar tu compra de
            acuerdo con la dirección de destino y el peso del paquete. Ofrecemos
            <strong> envío gratis</strong> en compras superiores a $50.000
            dentro de Chile continental.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Seguimiento de tu Pedido</h2>
          <p>
            Recibirás un correo con el número de seguimiento una vez que tu
            pedido sea despachado. También puedes revisar el estado en la
            sección{" "}
            <Link href="/my-orders" className="text-accent underline">
              Mis Órdenes
            </Link>{" "}
            iniciando sesión.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Devoluciones y Cambios</h2>
          <p>
            Tienes <strong>30 días corridos</strong> desde la fecha de recepción
            para solicitar cambio o devolución. El producto debe estar sin uso,
            con etiquetas y empaque original.
          </p>
          <ol className="list-decimal space-y-2 ml-6">
            <li>
              Escríbenos a{" "}
              <a
                href="mailto:devoluciones@rabbithole.cl"
                className="text-accent underline"
              >
                devoluciones@rabbithole.cl
              </a>{" "}
              indicando número de orden y motivo.
            </li>
            <li>
              Te enviaremos una etiqueta pre-pago para que entregues el paquete
              en la sucursal indicada.
            </li>
            <li>
              Una vez recibido, realizaremos el cambio o reembolso en un plazo
              máximo de 5 días hábiles.
            </li>
          </ol>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold">
            Pedidos con Diseños Personalizados Rechazados
          </h2>
          <p>
            Si tu compra incluye <strong>diseños personalizados</strong> que son
            rechazados por nuestro equipo de revisión (por infringir derechos de
            autor, contenido ofensivo u otras causas),{" "}
            <strong>el pedido no se cancela</strong>. Solo se descartan los
            diseños observados y se aplica lo siguiente:
          </p>
          <ul className="list-disc space-y-2 ml-6">
            <li>Te notificaremos por correo el motivo del rechazo.</li>
            <li>
              Reembolsaremos automáticamente el monto pagado por cada diseño
              rechazado en un plazo de 3-5 días hábiles.
            </li>
            <li>
              Puedes cargar un nuevo diseño desde la sección{" "}
              <Link href="/customize" className="text-accent underline">
                Personaliza tu polera
              </Link>
              .
            </li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Dudas</h2>
          <p>
            Si tienes cualquier consulta adicional, contáctanos en
            <a
              href="mailto:info@rabbithole.cl"
              className="text-accent underline ml-1"
            >
              info@rabbithole.cl
            </a>
            <strong> </strong>o vía WhatsApp al +56 9 1234 5678.
          </p>
        </section>
      </div>
    </main>
  );
}
