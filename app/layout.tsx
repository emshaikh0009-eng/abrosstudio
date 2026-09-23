import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollObserver from '@/components/ScrollObserver';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';

export const metadata: Metadata = {
  metadataBase: new URL('https://ambrosstudio.com'),
  title: 'Ambros Studio | Premium Digital Studio Surat',
  description:
    'Ambros Studio creates professional digital experiences for businesses. We build custom high-converting websites, targeted Meta ads, and luxury metal NFC business cards.',
  keywords: [
    'Ambros Studio',
    'Ambros',
    'Anas Shaikh',
    'Digital Agency Surat',
    'Web Design Surat',
    'Metal NFC Cards',
    'Digital Business Card',
    'Meta Ads Surat',
    'Luxury Web Agency',
  ],
  authors: [{ name: 'Anas Shaikh', url: 'https://wa.me/919998441519' }],
  icons: {
    icon: '/assets/ambros-logo-new.svg',
  },
  openGraph: {
    title: 'Ambros Studio | Premium Digital Studio Surat',
    description:
      'Ambros Studio creates professional digital experiences for businesses: custom websites, targeted Meta ads, and metal NFC business cards.',
    url: 'https://ambrosstudio.com',
    siteName: 'Ambros Studio',
    images: [
      {
        url: '/assets/ambros-logo-new.svg',
        width: 320,
        height: 54,
        alt: 'Ambros Studio Logo',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ambros Studio | Premium Digital Studio',
    description: 'Boutique digital studio in Surat, Gujarat founded by Anas Shaikh.',
    images: ['/assets/ambros-logo-new.svg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ScrollObserver />
        <Header />
        <main>{children}</main>
        <Footer />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
