import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_CLIENT_URL;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/director/'], // Optionnel: bloquer admin/director des moteurs de recherche
      },
    ],
    sitemap: `${BASE_URL}/fr/sitemap.xml`,
  };
}
