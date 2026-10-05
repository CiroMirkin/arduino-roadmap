import '../styles.css';

import type { ReactNode } from 'react';
import { Footer } from '../components/footer';
import { Header } from '../components/header';

type RootLayoutProps = { children: ReactNode };

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-svh bg-canvas font-sans text-ink/90">
      <meta
        name="description"
        content="Roadmap de Arduino, ESP32, C++ y arquitectura de backend multi-organización, con ejemplos de código y quiz por concepto."
      />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        precedence="font"
      />
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
      <Footer />
    </div>
  );
}

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
