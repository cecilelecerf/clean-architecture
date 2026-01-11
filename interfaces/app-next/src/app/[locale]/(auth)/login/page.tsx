'use client';
import { Link } from '@/lib/i18n/navigation';
import FormWrapper, { DataInfo } from '@/components/FormWrapper';
import { useForm } from 'react-hook-form';
import { LoginPayload, loginSchema } from '@infrastructure/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { match } from 'ts-pattern';

export default function RegisterPage() {
  const t = useTranslations('auth.login');
  const router = useRouter()
  const form = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
  });

  const handleSubmit = async (values: LoginPayload) => {
    const res = await signIn('credentials', { redirect: false, email: values.email, password: values.password });

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
  const data: DataInfo<LoginPayload> = {
    email: { label: t('form.email'), type: "email", placeholder: "votre@email.com" },
    password: { label: t('form.password'), type: "password", placeholder: "*****" }
  }


  return (
    <FormWrapper<LoginPayload>
      title={t('title')}
      form={form}
      data={data}
      labelButton={t('form.submit')}
      loading={false}
      onSubmit={handleSubmit}
      showBackButton
    >
      <div className='flex flex-col gap-1 items-center'>
        <Link href="/forgot-password">{t("forgotPassword")}</Link>

        <div className="text-center text-sm ">
          <span className="text-muted-foreground">{t('noAccount')} </span>
          <Link href="/register" className="text-primary hover:underline font-medium">
            {t('signUp')}
          </Link>
        </div>
      </div>
    </FormWrapper>
  );
}
