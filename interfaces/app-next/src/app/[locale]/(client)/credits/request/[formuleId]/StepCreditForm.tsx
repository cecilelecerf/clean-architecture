'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FormWrapper, { DataInfo } from '@/components/FormWrapper';
import { useMutation } from '@tanstack/react-query';
import { endpoints } from '@/utils/endpoint';
import { AccountId } from '@infrastructure/types/account';
import { FormuleDTO } from '@infrastructure/types/formule';
import { useRouter } from 'next/navigation';
import { requestCreditSchema } from '@/utils/endpoint/creditEndpoints';
import { useTranslations } from 'next-intl';

const formRequestCreditSchema = requestCreditSchema.pick({
  durationMonths: true,
}).extend({
  initialAmount: z.number(),
  startDate: z.string()
})

export type FormRequestCredit = z.infer<typeof formRequestCreditSchema>

type StepCreditFormProps = {
  minAmount?: number;
  maxAmount?: number;
  formule: FormuleDTO
  info: { accountId: AccountId, currency: string }
};

export const StepCreditForm = ({ formule, info }: StepCreditFormProps) => {
  const mutation = useMutation(endpoints.credits.create());
  const router = useRouter()
  const form = useForm<FormRequestCredit>({
    resolver: zodResolver(formRequestCreditSchema),
  });
  const t = useTranslations("client.loan.request");

  const data: DataInfo<FormRequestCredit> = {
    initialAmount: {
      label: t("form.amount"),
      type: 'number',
      placeholder: `Entre ${formule.minAmount ?? 100} et ${formule.maxAmount ?? 10000} €`,
    },
    startDate: {
      label: t("form.date"),
      type: 'date',
      placeholder: 'YYYY-MM-DD',
    },
    durationMonths: {
      label: t("form.duration"),
      type: 'number',
      placeholder: 'Ex: 12',
    },
  };

  const submit = (values: FormRequestCredit) => {
    const effectiveDateISO = new Date(values.startDate).toISOString();
    mutation.mutate(
      {
        accountId: info.accountId,
        formuleCreditId: formule.id,
        initialAmount: {
          amount: values.initialAmount,
          currency: info.currency
        },
        durationMonths: values.durationMonths,
        startDate: effectiveDateISO
      },
    );
  };

  return (
    <FormWrapper<FormRequestCredit>
      title={t("title")}
      description={t("description")}
      form={form}
      data={data}
      onSubmit={submit}
      labelButton={t("button")}
      loading={mutation.isPending}
    />
  );
};
