'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Copy, MoreVertical } from 'lucide-react';
import { clsx } from 'clsx';
import { toStringTypeAccount } from '@/utils/toStringTypeAccount';
import { fromColorClasses, textColorClasses, toColorClasses } from '@/utils/color';
import { mockAccounts } from '@infrastructure/data/accounts';
import { transactions } from '@infrastructure/data/transactions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const account = mockAccounts[0];

export default function AccountIdPage() {
  const router = useRouter();
  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">Retour</h1>
      </div>
      <div className="flex flex-col gap-6">
        {/* Account card */}
        <Card
          className={`rounded-2xl text-white shadow-lg border-0 bg-linear-to-br  ${fromColorClasses[800][account.color]}
            ${toColorClasses[500][account.color]} 
            ${textColorClasses[50][account.color]} `}
        >
          <CardContent className=" flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <p className="text-lg font-medium">{account.name}</p>
              <Button variant="ghost" size="icon">
                <MoreVertical className={`h-5 w-5 ${textColorClasses[50][account.color]}`} />
              </Button>
            </div>
            <div className="flex gap-2 my-4">
              <Copy />
              <p> {account.IBAN}</p>
            </div>
            <div>
              <p className="text-xs opacity-75 mb-1">{toStringTypeAccount(account)}</p>
              <p className="text-3xl font-bold">
                {account.balance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Button
          onClick={() => router.push(`/accounts/${account.IBAN}/transactions/new`)}
          className="flex-1 mx-1 bg-gray-100 text-gray-800 hover:bg-gray-200"
        >
          Transférer
        </Button>
        <Separator />
        {/* Transactions */}
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-lg">Dernières transactions</h2>
          <div className="flex flex-col gap-3">
            {transactions.map((t) => (
              <Link
                href={`/accounts/${account.IBAN.toLowerCase()}/transactions/${t.id}`}
                key={t.id}
                className="flex justify-between items-center rounded-lg p-2 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{t.icon}</span>
                  <div>
                    <p className="font-medium">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.date.toLocaleString()}</p>
                  </div>
                </div>
                <div
                  className={clsx(
                    'font-semibold',
                    t.amount < 0 ? 'text-red-500' : 'text-green-500',
                  )}
                >
                  {t.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
