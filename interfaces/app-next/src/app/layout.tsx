import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/sonner"
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { Providers } from '@/components/Providers';
import { Metadata } from 'next';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "Avenir",
  description: "Une banque moderne qui vous accompagne dans la gestion de votre épargne avec des outils intelligents et un conseil personnalisé.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='fr'>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <Theme>
            <Toaster />
            {children}
          </Theme>
        </Providers>
      </body>
    </html>
  );
}
