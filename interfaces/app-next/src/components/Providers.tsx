'use client';
import { queryClient } from '@/lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { NextIntlClientProvider, useLocale } from 'next-intl';


type ProvidersProps = {
  children: React.ReactNode; locale: string;

};

export const Providers = ({ children, locale }: ProvidersProps) => {
  console.log(locale)
  return (
    <NextIntlClientProvider locale={locale}>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>

          {children}
        </QueryClientProvider>
      </SessionProvider>
    </NextIntlClientProvider>
  );
}