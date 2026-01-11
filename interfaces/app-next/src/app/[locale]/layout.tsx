import "@radix-ui/themes/styles.css";
import { routing } from '@/lib/i18n/routing';
import { notFound } from 'next/navigation';
import { getMessages } from 'next-intl/server';
import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';


export const metadata: Metadata = {
  title: "Avenir",
  description: "Une banque moderne qui vous accompagne dans la gestion de votre épargne avec des outils intelligents et un conseil personnalisé.",
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "fr")) {
    notFound();
  }
  const meggases = await getMessages()
  return (
    <>
      <>
        <NextIntlClientProvider locale={locale} messages={meggases}>
          {children}
        </NextIntlClientProvider>
      </>
    </>
  );
}
