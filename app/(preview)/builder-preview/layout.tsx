import type { Metadata } from 'next';
import { Asap, DM_Sans } from 'next/font/google';
import '../../globals.css';

const heading = Asap({ variable: '--font-asap-sans', subsets: ['latin'] });
const body = DM_Sans({ variable: '--font-dm-sans', subsets: ['latin'] });
export const metadata: Metadata = {
  title: 'Vista previa | Ingenix',
  robots: { index: false, follow: false },
};
export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${heading.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
