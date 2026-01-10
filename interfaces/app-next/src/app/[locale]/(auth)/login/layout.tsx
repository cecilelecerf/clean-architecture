import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';

type Props = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations('auth.login');
    const tCommon = await getTranslations("common");
    const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL;
    return {
        title: t('meta.title'),
        description: t('meta.description'),

        openGraph: {
            title: t('meta.title'),
            description: t('meta.description'),
            url: `${baseUrl}/${locale}/login`,
            siteName: tCommon('siteName'),
            locale: locale === 'fr' ? 'fr_FR' : 'en_US',
            type: 'website',
        },

        alternates: {
            canonical: `${baseUrl}/${locale}/login`,
            languages: {
                'fr': `${baseUrl}/fr/connexion`,
                'en': `${baseUrl}/en/login`,
            },
        },

        robots: {
            index: false,
            follow: true,
        },
    };
}

export default async function LoginLayout({ children, params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <>{children}</>;
}