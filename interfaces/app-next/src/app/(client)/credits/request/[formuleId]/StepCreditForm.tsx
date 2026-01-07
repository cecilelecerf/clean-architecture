'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FormWrapper, { DataInfo } from '@/components/erfer';
import { useMutation } from '@tanstack/react-query';
import { endpoints } from '@/utils/endpoint';
import { AccountId } from '@infrastructure/types/account';
import { FormuleDTO } from '@infrastructure/types/formule';
import { useRouter } from 'next/navigation';
import { requestCreditSchema } from '@/utils/endpoint/creditEndpoints';

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

  const data: DataInfo<FormRequestCredit> = {
    initialAmount: {
      label: 'Montant souhaité',
      type: 'number',
      placeholder: `Entre ${formule.minAmount ?? 100} et ${formule.maxAmount ?? 10000} €`,
    },
    startDate: {
      label: 'Date de début',
      type: 'date',
      placeholder: 'YYYY-MM-DD',
    },
    durationMonths: {
      label: 'Durée (mois)',
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
      {
        onSuccess: (data) => {
          router.push(`/credits/${data.id}`);
        },
      }
    );
  };

  return (
    <FormWrapper<FormRequestCredit>
      title="Informations du crédit"
      description="Renseignez les détails de votre crédit"
      form={form}
      data={data}
      onSubmit={submit}
      labelButton="Envoyer la demande"
      loading={mutation.isPending}
    />
  );
};
