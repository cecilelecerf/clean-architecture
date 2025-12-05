'use client';

import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check } from 'lucide-react';
import { Color, colorSchema } from '@infrastructure/types/color';
import { AccountId } from '@infrastructure/types/account';
import { bgColorClasses } from '@/utils/color';
import clsx from 'clsx';

const newAccountSchema = z.object({
  name: z.string().min(2, 'Le nom du compte est obligatoire'),
  balance: z.number(),
  color: z.enum(['blue', 'green', 'purple', 'gray']),
  icon: z
    .string()
    .min(1, 'L’icône est obligatoire')
    .max(2, 'Une seule icône (emoji) est autorisée'),
});

type NewAccountForm = z.infer<typeof newAccountSchema>;

export default function NewAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [color, setColor] = useState<Color | null>(null);

  const form = useForm<NewAccountForm>({
    resolver: zodResolver(newAccountSchema),
    defaultValues: {
      name: '',
      balance: 0,
      color: null,
      icon: '💰',
    },
  });

  const onSubmit = async (data: NewAccountForm) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000)); // Simule un appel réseau
    console.log('✅ Nouveau compte créé :', { id: uuid() as AccountId, ...data, color });
    router.push('/accounts');
  };

  return (
    <>
      {/* Header */}

      {/* Card */}
      <Card className="rounded-2xl shadow-lg border-0 bg-linear-to-br from-gray-50 to-gray-100">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1>Nouveau compte</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 text-gray-700">
            {/* Nom */}
            <div>
              <Label htmlFor="name">Nom du compte</Label>
              <Input id="name" placeholder="Ex : Compte courant" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Solde */}
            <div>
              <Label htmlFor="balance">Solde initial (€)</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="Ex : 1250.50"
                {...form.register('balance', { valueAsNumber: true })}
              />
              {form.formState.errors.balance && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.balance.message}</p>
              )}
            </div>

            {/* Couleur */}
            <div>
              <Label>Couleur du compte</Label>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                {colorSchema.options.map((c, i) => (
                  <div
                    key={i}
                    className={clsx(
                      `h-9 flex justify-center items-center rounded-xl  border-gray-900 ${bgColorClasses[300][c]}`,
                      c === color && 'border',
                    )}
                    onClick={() => setColor((prev) => (prev === c ? null : c))}
                  >
                    {c === color && <Check />}{' '}
                  </div>
                ))}
              </div>
              {form.formState.errors.color && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.color.message}</p>
              )}
            </div>

            {/* Icône */}
            <div>
              <Label htmlFor="icon">Icône (emoji)</Label>
              <Input id="icon" placeholder="💳" {...form.register('icon')} maxLength={2} />
              {form.formState.errors.icon && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.icon.message}</p>
              )}
            </div>

            {/* Bouton */}
            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? 'Création en cours...' : 'Créer le compte'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
