'use client';
import { queryClient } from '@/lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { AbstractIntlMessages, NextIntlClientProvider, useLocale } from 'next-intl';


type ProvidersProps = {
  children: React.ReactNode; locale: string;
  messages: AbstractIntlMessages;

};

export const Providers = ({ children, locale, messages }: ProvidersProps) => {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </SessionProvider>
    </NextIntlClientProvider>
  );
}