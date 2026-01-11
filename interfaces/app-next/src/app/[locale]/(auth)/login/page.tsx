'use client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Link } from '@/lib/i18n/navigation';
import { User, MapPin, Mail } from 'lucide-react';
import { endpoints } from '@/utils/endpoint';
import FormWrapper, { DataInfo, Section } from '@/components/FormWrapper';
import { useForm } from 'react-hook-form';
import { CreateClientPayload, createClientSchema, LoginPayload, loginSchema } from '@infrastructure/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
  const t = useTranslations('auth.login');
  const mutation = useMutation(endpoints.auth.login());

  const form = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
  });

  const handleSubmit = (values: LoginPayload) => {
    mutation.mutate(
      { ...values },
      {
        onSuccess: () => toast.success(t('form.success')),
        onError: () => toast.error(t('form.error')),
      }
    );
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
      loading={mutation.isPending}
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