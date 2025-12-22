'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { AccountId } from '@infrastructure/types/account';
import FormWrapper, { Field } from '@/components/FromWrapper';
import { useMutation, useQuery } from '@tanstack/react-query';
import { endpoints } from '@/utils/endpoint';
import { NewTransaction } from '@infrastructure/types/transaction';

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

  // Récupérer la liste des comptes
  const accountsQuery = useQuery(endpoints.accounts.getAll());

  const [formData, setFormData] = useState<Partial<NewTransaction> & { fromAccountIban: AccountId }>({ fromAccountIban: accountId });

  const mutation = useMutation(endpoints.accounts.transactions.new({ accountIban: accountId }));

  const fields: Field[] = [
    {
      label: 'Libellé',
      type: 'text',
      placeholder: 'Ex: Virement mensuel',
      get: formData.label,
      set: (value) => setFormData((prev) => ({ ...prev, label: value as string })),
    },
    {
      label: 'Montant (€)',
      type: 'number',
      placeholder: 'Ex: 45.90',
      numberOptions: {
        min: 0.01,
        step: 0.01,
      },
      get: formData.amount,
      set: (value) => setFormData((prev) => ({ ...prev, amount: value as string })),
    }, {
      label: 'Icône',
      type: 'icon',
      get: formData.icon ?? '💰',
      set: (value) => setFormData((prev) => ({ ...prev, icon: value as string })),
      options: TRANSACTION_ICONS,
    },
    {
      label: 'Depuis',
      type: "text",
      get: accountId,
      set: () => { },
      disabled: true
    },
    {
      label: 'Vers le compte',
      type: "text",
      placeholder: 'FR953185014227386135953585',
      get: formData.toAccountIban,
      set: (value) => setFormData((prev) => ({ ...prev, toAccountIban: value as AccountId })),
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.label || !formData.amount || !formData.toAccountIban) {
      return;
    }

    if (accountId === formData.toAccountIban) {
      alert("Le compte source et le compte cible doivent être différents");
      return;
    }

    mutation.mutate({ label: formData.label, amount: formData.amount, toAccountIban: formData.toAccountIban, currency: "eur", icon: formData.icon }, { onSuccess: () => router.push(`/accounts/${accountId}`) });
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormWrapper
        title="Nouvelle transaction"
        description="Transférez de l'argent"
        fields={fields}
        button="Créer la transaction"
        loading={mutation.isPending || accountsQuery.isPending}
        message={mutation.isError
          ? mutation.error instanceof Error
            ? mutation.error.message
            : "Erreur lors de la création de la transaction"
          : undefined
        } messageType={mutation.isError ? "error" : undefined}
      />
    </form>
  );
}