import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://abrosstudio.com'),
  title: 'AbrosStudio | Digital Agency Surat — Crafted With Purpose',
  description:
    'Premium digital studio founded by Anas Shaikh in Surat, Gujarat. We build custom high-converting websites, targeted Meta ads, and digital + metal NFC business cards.',
  keywords: [
    'AbrosStudio',
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
    icon: '/assets/abros-logo-transparent.png',
  },
  openGraph: {
    title: 'AbrosStudio | Digital Agency Surat — Crafted With Purpose',
    description:
      'We help ambitious local businesses look professional and win customers online with custom websites, targeted Meta ads, and metal NFC business cards.',
    url: 'https://abrosstudio.com',
    siteName: 'AbrosStudio',
    images: [
      {
        url: '/assets/abros-logo-transparent.png',
        width: 765,
        height: 195,
        alt: 'AbrosStudio — Crafted With Purpose',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AbrosStudio | Crafted With Purpose',
    description: 'Digital agency in Surat, Gujarat founded by Anas Shaikh.',
    images: ['/assets/abros-logo-transparent.png'],
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
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
