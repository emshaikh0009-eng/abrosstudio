import type { Metadata } from 'next';
import { Sora, Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollObserver from '@/components/ScrollObserver';
import { Analytics } from '@vercel/analytics/next';

const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sora',
  weight: ['400', '500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ambrosstudio.com'),
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
  authors: [{ name: 'Ambros Studio Team', url: 'https://wa.me/919157778915' }],
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
    url: 'https://ambrosstudio.com',
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
    <html lang="en" className={`${sora.variable} ${inter.variable}`}>
      <head>
        {/* Seamless redirect if Supabase password-recovery token lands on root or general pages */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var h = window.location.hash || '';
                  var s = window.location.search || '';
                  var p = window.location.pathname || '';
                  if (p !== '/admin/reset-password' && p !== '/admin/reset-password/') {
                    if (
                      h.indexOf('type=recovery') !== -1 ||
                      s.indexOf('type=recovery') !== -1 ||
                      (s.indexOf('token_hash=') !== -1 && s.indexOf('recovery') !== -1)
                    ) {
                      window.location.replace('/admin/reset-password' + s + h);
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <ScrollObserver />
        <Header />
        <main>{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
