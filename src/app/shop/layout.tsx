import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tienda | Rabbit Hole - Poleras Personalizadas',
  description: 'Explora nuestra colección de poleras personalizadas de alta calidad. Encuentra el diseño perfecto para expresar tu estilo único.',
};

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
