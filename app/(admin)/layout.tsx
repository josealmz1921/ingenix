import type { Metadata } from 'next';
import { Asap, DM_Sans } from 'next/font/google';
import AdminShell from '@/src/components/Admin/AdminShell';
import theme from '@/src/components/Admin/theme.module.css';
import '../globals.css';

const heading = Asap({ variable: '--font-asap-sans', subsets: ['latin'] });
const body = DM_Sans({ variable: '--font-dm-sans', subsets: ['latin'] });
export const metadata: Metadata = {
  title: 'Administración | Ingenix',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${heading.variable} ${body.variable} ${theme.theme}`}>
      <body>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
