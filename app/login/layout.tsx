import type { Metadata } from 'next';
import { Asap, DM_Sans } from 'next/font/google';
import theme from '@/src/components/Admin/theme.module.css';
import '../globals.css';

const font = DM_Sans({ variable: '--font-dm-sans', subsets: ['latin'] });
const heading = Asap({ variable: '--font-asap-sans', subsets: ['latin'] });
export const metadata: Metadata = {
  title: 'Acceso | Ingenix',
  robots: { index: false, follow: false },
};
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${font.variable} ${heading.variable} ${theme.theme}`}>
      <body>{children}</body>
    </html>
  );
}
