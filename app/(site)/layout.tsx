import type { Metadata } from "next";
import { Asap, DM_Sans } from "next/font/google";
import Layout from '@/src/components/Layout';
import { site } from '@/src/content/site';
import "../globals.css";

const geistSans = Asap({
  variable: "--font-asap-sans",
  subsets: ["latin"],
});

const geistMono = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: site.title, template: '%s | Ingenix' },
  description: site.description,
  ...(site.url ? { metadataBase: new URL(site.url), alternates: { canonical: '/' } } : {}),
  openGraph: {
    type: 'website',
    locale: 'es',
    siteName: site.name,
    title: site.title,
    description: site.description,
    ...(site.url ? { url: site.url } : {}),
  },
  twitter: { card: 'summary', title: site.title, description: site.description },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
