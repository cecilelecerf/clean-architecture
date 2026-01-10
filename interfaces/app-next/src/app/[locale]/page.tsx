import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Building2, ChartLine, Lock, PiggyBank, Shield, Smartphone, TrendingUp, Users } from "lucide-react";
import { DevSection } from "@/components/homepage/DevSection";
import { CTA } from "@/components/homepage/CTA";
import { LangageSwitcher } from "@/components/LangageSwitcher";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import { routing } from "@/lib/i18n/routing";
type Props = {
  params: Promise<{ locale: string }>;
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://votre-banque.com';

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    keywords: t('meta.keywords'),

    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      url: `${baseUrl}/${locale}`,
      siteName: tCommon('siteName'),
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: t('meta.title'),
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: t('meta.title'),
      description: t('meta.description'),
      images: [`${baseUrl}/og-image.png`],
    },

    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'fr': `${baseUrl}/fr`,
        'en': `${baseUrl}/en`,
        'x-default': `${baseUrl}/fr`,
      },
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

    authors: [{ name: tCommon('siteName') }],
    creator: tCommon('siteName'),
    publisher: tCommon('siteName'),
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('home');
  const tCommon = await getTranslations('common');

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">

          <div className="flex justify-center">
            <LangageSwitcher />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            <Shield className="h-4 w-4" />
            {t('hero.badge')}
          </div>

          <h1 className="text-6xl font-bold tracking-tight bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {t('hero.title.line1')}
            <br />
            {t('hero.title.line2')}
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {t('hero.description')}
          </p>

          <CTA />
        </div>
      </section>

      <DevSection />

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">{t('features.title')}</h2>
          <p className="text-slate-600 text-lg">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <PiggyBank className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>{t('features.savings.title')}</CardTitle>
              <CardDescription>
                {t('features.savings.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-cyan-500 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <ChartLine className="h-6 w-6 text-cyan-600" />
              </div>
              <CardTitle>{t('features.realtime.title')}</CardTitle>
              <CardDescription>
                {t('features.realtime.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-purple-500 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>{t('features.advisors.title')}</CardTitle>
              <CardDescription>
                {t('features.advisors.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-green-500 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>{t('features.security.title')}</CardTitle>
              <CardDescription>
                {t('features.security.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-orange-500 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>{t('features.mobile.title')}</CardTitle>
              <CardDescription>
                {t('features.mobile.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-pink-500 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-pink-600" />
              </div>
              <CardTitle>{t('features.analytics.title')}</CardTitle>
              <CardDescription>
                {t('features.analytics.description')}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-linear-to-r from-blue-600 to-cyan-600 border-0 text-white max-w-4xl mx-auto">
          <CardHeader className="text-center space-y-4 py-12">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-white/20 rounded-full mx-auto">
              <Building2 className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl">
              {t('cta.title')}
            </CardTitle>
            <CardDescription className="text-white/90 text-lg">
              {t('cta.description')}
            </CardDescription>
            <div className="pt-4">
              <Button size="lg" variant="secondary" className="text-lg" asChild>
                <Link href="/register">
                  {t('cta.button')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-12">
        <div className="container mx-auto px-4 text-center text-slate-600">
          <p>{tCommon('footer.copyright')}</p>
          <div className="flex gap-6 justify-center mt-4 text-sm">
            <Link href="/legal/privacy" className="hover:text-blue-600">
              {tCommon('footer.privacy')}
            </Link>
            <Link href="/legal/terms" className="hover:text-blue-600">
              {tCommon('footer.terms')}
            </Link>
            <Link href="/contact" className="hover:text-blue-600">
              {tCommon('footer.contact')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}