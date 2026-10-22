import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/manrope';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/ibm-plex-mono/400.css';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/components/providers/CartProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ScrollReveal } from '@/components/providers/ScrollReveal';
import { brand } from '@/config/brand';

export const metadata: Metadata = {
  title: { default: `${brand.name} ${brand.descriptor} — Less noise. More instinct.`, template: `%s — ${brand.name} ${brand.descriptor}` },
  description: 'All-electric motorcycles for those who feel the road differently.',
};

export const viewport: Viewport = { themeColor: '#0c0e0e', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <ScrollReveal />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
