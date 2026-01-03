'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Color, colorSchema } from '@infrastructure/types/color';
import { Account, NewAccount } from '@infrastructure/types/account';
import { useMutation } from '@tanstack/react-query';
import { endpoints } from '@/utils/endpoint';
import FormWrapper, { Field as TField } from '@/components/FromWrapper';
import clsx from 'clsx';
import { bgColorClasses, textColorClasses } from '@/utils/color';
import { Check } from 'lucide-react';

export default function NewAccountPage() {

  const [field, setField] = useState<NewAccount>({
    color: null,
    name: "",
    type: "courant"
  });

  const fields: TField[] = [
    {
      label: 'Nom du compte',
      get: field.name,
      set: (e) => setField((prev) => ({ ...prev, name: e as string })),
    },
    {
      label: 'Type de compte',
      type: 'radio',
      get: field.type,
      set: (e) => setField((prev) => ({ ...prev, type: e as Account["type"] })),
      options: [
        { label: 'Courant', value: "courant" },
        { label: 'Epargne', value: "epargne" },
      ],
    },
    {
      label: 'Couleur',
      get: field.color,
      set: (e) => setField((prev) => ({ ...prev, color: e as Color })),
      type: "other",
      layout: (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {colorSchema.options.map((c, i) => (
            <div
              key={i}
              className={clsx(
                `h-9 flex justify-center items-center rounded-xl cursor-pointer hover:scale-110 transition-all ${bgColorClasses[300][c]}`,
                c === field.color && 'shadow scale-105',
              )}
              onClick={() => setField((prev) => ({
                ...prev,
                color: prev.color === c ? null : c
              }))}
            >
              {c === field.color && <Check className={textColorClasses[700][c]} />}
            </div>
          ))}
        </div>
      )
    },
  ];

  const mutation = useMutation(endpoints.accounts.create());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(field);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormWrapper
        title='Créer un nouveau compte'
        fields={fields}
        button='Créer'
        loading={mutation.isPending}
      />
    </form>
  );
}