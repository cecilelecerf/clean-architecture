// src/app/[locale]/(auth)/login/page.tsx
'use client';
import { signIn } from 'next-auth/react';
import { match } from 'ts-pattern';
import { Link } from '@/lib/i18n/navigation';
import FormWrapper, { DataInfo } from '@/components/FormWrapper';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { createClientSchema } from '@infrastructure/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

const loginSchema = createClientSchema.pick({ email: true, passwordHash: true });
type Login = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  console.log('t("auth.login.title"):', t("login.title"))

  const form = useForm<Login>({
    resolver: zodResolver(loginSchema),
  });

  const handleSubmit = async (values: Login) => {
    const res = await signIn('credentials', {
      redirect: false,
      email: values.email,
      password: values.passwordHash,
    });

    if (!res?.ok) {
      console.error('Erreur de connexion', res?.error);
      return;
    }

    const sessionRes = await fetch('/api/auth/session');
    const session = await sessionRes.json();

    if (!session?.user?.role) {
      console.error('Session invalide ou rôle manquant');
      return;
    }

    match(session.user.role)
      .with('client', () => router.push('/accounts'))
      .with('conseiller', () => router.push('/admin'))
      .with('directeur', () => router.push('/director'))
      .otherwise(() => router.push('/unauthorized'));
  };

  const data: DataInfo<Login> = {
    email: { label: t('form.email'), type: 'email' },
    passwordHash: { label: t('form.password'), type: 'password' },
  };

  return (
    <>
      <Link href="/">{t('backToHome')}</Link>
      <FormWrapper<Login>
        title={t('title')}
        form={form}
        data={data}
        onSubmit={handleSubmit}
        labelButton={t('form.submit')}
        loading={false}
      >
        <div className="space-y-2 text-center text-sm">
          <Link
            href="/forgot-password"
            className="text-primary hover:underline block"
          >
            {t('forgotPassword')}
          </Link>
          <div>
            <span className="text-muted-foreground">{t('noAccount')} </span>
            <Link
              href="/register"
              className="text-primary hover:underline font-medium"
            >
              {t('signUp')}
            </Link>
          </div>
        </div>
      </FormWrapper>
    </>
  );
}