'use client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Link } from '@/lib/i18n/navigation';
import { User, MapPin, Mail } from 'lucide-react';
import { endpoints } from '@/utils/endpoint';
import FormWrapper, { Section } from '@/components/FormWrapper';
import { useForm } from 'react-hook-form';
import { CreateClientPayload, createClientSchema } from '@infrastructure/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
  const t = useTranslations('auth.register');
  const mutation = useMutation(endpoints.auth.register());

  const form = useForm<CreateClientPayload>({
    resolver: zodResolver(createClientSchema),
  });

  const handleSubmit = (values: CreateClientPayload) => {
    mutation.mutate(
      { ...values, dateOfBirth: new Date(values.dateOfBirth).toISOString() },
      {
        onSuccess: () => toast.success(t('form.success')),
        onError: () => toast.error(t('form.error')),
      }
    );
  };

  const personalSection: Section<CreateClientPayload> = {
    title: t('sections.personal.title'),
    description: t('sections.personal.description'),
    icon: User,
    data: {
      firstname: {
        label: t('form.firstname'),
        withIcon: true,
        type: 'text',
      },
      lastname: {
        label: t('form.lastname'),
        withIcon: true,
        type: 'text',
      },
      sexe: {
        label: t('form.gender.label'),
        type: 'radio',
        options: [
          { label: t('form.gender.female'), value: 'girl' },
          { label: t('form.gender.male'), value: 'boy' },
          { label: t('form.gender.other'), value: 'other' },
        ],
      },
      phoneNumber: {
        label: t('form.phone'),
        withIcon: true,
        type: 'phone',
      },
      dateOfBirth: {
        label: t('form.birthdate'),
        type: 'date',
        withIcon: true,
      },
    },
  };

  const addressSection: Section<CreateClientPayload> = {
    title: t('sections.address.title'),
    description: t('sections.address.description'),
    icon: MapPin,
    data: {
      address: { label: t('form.address'), type: 'text', notRequired: false },
      city: { label: t('form.city'), type: 'text', notRequired: false },
      country: { label: t('form.country'), type: 'text', notRequired: false },
      postalCode: { label: t('form.postalCode'), type: 'text', notRequired: false },
    },
  };

  const accountSection: Section<CreateClientPayload> = {
    title: t('sections.account.title'),
    description: t('sections.account.description'),
    icon: Mail,
    data: {
      email: { label: t('form.email'), type: 'email', withIcon: true },
      passwordHash: { label: t('form.password'), type: 'password', withIcon: true },
      confirmPassword: { label: t('form.confirmPassword'), type: 'password', withIcon: true },
    },
  };

  return (
    <FormWrapper<CreateClientPayload>
      title={t('title')}
      form={form}
      data={[personalSection, addressSection, accountSection]}
      labelButton={t('form.submit')}
      loading={mutation.isPending}
      onSubmit={handleSubmit}
      showBackButton
    >
      <div className="text-center text-sm pt-4">
        <span className="text-muted-foreground">{t('hasAccount')} </span>
        <Link href="/login" className="text-primary hover:underline font-medium">
          {t('signIn')}
        </Link>
      </div>
    </FormWrapper>
  );
}