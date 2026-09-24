import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollObserver from '@/components/ScrollObserver';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';

export const metadata: Metadata = {
  metadataBase: new URL('https://ambrosstudio.space'),
  title: {
    default: 'Ambros Studio | Premium Digital Studio & Web Design in Surat, Gujarat',
    template: '%s',
  },
  description:
    'Ambros Studio is a premier digital studio based in Surat, Gujarat. We build custom high-converting websites, ROI-driven Meta ads, and luxury metal NFC business cards for ambitious brands.',
  keywords: [
    'Ambros Studio',
    'Ambros Studio Surat',
    'Ambros Studio Gujarat',
    'Digital Studio Surat',
    'Web Design Surat',
    'Web Development Surat',
    'Website Designer in Surat',
    'Digital Agency Surat',
    'Digital Marketing Agency Surat',
    'Meta Ads Surat',
    'Facebook Ads Agency Surat',
    'Metal NFC Cards',
    'Metal NFC Business Cards Surat',
    'Digital Business Card India',
    'Luxury Web Agency',
  ],
  authors: [{ name: 'Ambros Studio Team', url: 'https://wa.me/919998441519' }],
  creator: 'Ambros Studio',
  publisher: 'Ambros Studio',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/assets/ambros-logo.png',
    shortcut: '/assets/ambros-logo.png',
    apple: '/assets/ambros-logo.png',
  },
  openGraph: {
    title: 'Ambros Studio | Premium Digital Studio & Web Design in Surat, Gujarat',
    description:
      'Ambros Studio is a premier digital studio based in Surat, Gujarat. We build custom high-converting websites, ROI-driven Meta ads, and luxury metal NFC business cards.',
    url: 'https://ambrosstudio.space',
    siteName: 'Ambros Studio',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/assets/ambros-logo.png',
        width: 1024,
        height: 341,
        alt: 'Ambros Studio - Crafted with Purpose',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ambros Studio | Premium Digital Studio in Surat, Gujarat',
    description:
      'Boutique digital studio in Surat, Gujarat. Custom high-converting websites, Meta ads, and luxury metal NFC cards.',
    images: ['/assets/ambros-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'technology',
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
