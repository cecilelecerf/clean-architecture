'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import FormWrapper, { DataInfo } from '@/components/erfer';
import { zodResolver } from '@hookform/resolvers/zod';
import { AccountId } from '@infrastructure/types/account';
import { NewTransaction, newTransactionSchema } from '@infrastructure/types/transaction';
import { useMutation, useQuery } from '@tanstack/react-query';
import { endpoints } from '@/utils/endpoint';

const TRANSACTION_ICONS = [
  { label: 'Argent', value: '💰', icon: '💰' },
  { label: 'Carte', value: '💳', icon: '💳' },
  { label: 'Cadeau', value: '🎁', icon: '🎁' },
  { label: 'Nourriture', value: '🍔', icon: '🍔' },
  { label: 'Shopping', value: '🛍️', icon: '🛍️' },
  { label: 'Transport', value: '🚗', icon: '🚗' },
  { label: 'Maison', value: '🏠', icon: '🏠' },
  { label: 'Santé', value: '⚕️', icon: '⚕️' },
  { label: 'Sport', value: '⚽', icon: '⚽' },
  { label: 'Voyage', value: '✈️', icon: '✈️' },
  { label: 'Éducation', value: '📚', icon: '📚' },
  { label: 'Divertissement', value: '🎬', icon: '🎬' },
  { label: 'Abonnement', value: '📱', icon: '📱' },
  { label: 'Salaire', value: '💵', icon: '💵' },
  { label: 'Économies', value: '🐷', icon: '🐷' },
  { label: 'Autre', value: '📌', icon: '📌' },
];


export default function NewTransactionPage() {
  const { accountId } = useParams<{ accountId: AccountId }>();
  const router = useRouter();

  const form = useForm<NewTransaction>({
    resolver: zodResolver(newTransactionSchema),
  });

  const accountsQuery = useQuery(endpoints.accounts.getAllByMe());
  const mutation = useMutation(endpoints.accounts.transactions.new({ accountIban: accountId }));

  const handleSubmit = (values: NewTransaction) => {
    if (accountId === values.toAccountIban) {
      alert('Le compte source et le compte cible doivent être différents');
      return;
    }

    mutation.mutate(
      { ...values },
      {
        onSuccess: () => router.push(`/accounts/${accountId}`),
      }
    );
  };

  const data: DataInfo<NewTransaction> = {
    label: { label: 'Libellé', type: 'text', placeholder: 'Ex: Virement mensuel' },
    amount: { label: 'Montant (€)', type: 'number', placeholder: 'Ex: 45.90' },
    icon: { label: 'Icône', type: 'icon', options: TRANSACTION_ICONS },
    toAccountIban: { label: 'Vers le compte', type: 'text', placeholder: 'FR953185014227386135953585' },
  };

  return (

    <FormWrapper<NewTransaction>
      title="Nouvelle transaction"
      form={form}
      data={data}
      onSubmit={handleSubmit}
      labelButton="Créer la transaction"
      loading={mutation.isPending || accountsQuery.isPending}
    />

  );
}
