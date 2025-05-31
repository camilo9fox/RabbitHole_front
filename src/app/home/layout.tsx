import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rabbit Hole - Diseña tu polera única',
  description: 'Crea diseños personalizados para tus poleras. Tu imaginación es el límite.',
};

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
