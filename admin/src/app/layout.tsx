import type { Metadata } from 'next';
import './globals.css';
import { AdminAuthProvider } from '@/lib/auth';
import { AdminShell } from '@/components/AdminShell';

export const metadata: Metadata = {
  title: 'EVee Crown Motors — Executive Admin Portal',
  description: 'Enterprise fleet management, order processing, and customer analytics for Crown Motors.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AdminAuthProvider>
          <AdminShell>{children}</AdminShell>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
