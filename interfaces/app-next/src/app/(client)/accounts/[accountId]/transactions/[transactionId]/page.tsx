'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { fromColorClasses, textColorClasses, toColorClasses } from '@/utils/color';
import { AccountId } from '@infrastructure/types/account';
import { TransactionId } from '@infrastructure/types/transaction';
import { useQuery } from '@tanstack/react-query';
import { endpoints } from '@/utils/endpoint';
import { match } from 'ts-pattern';
import { use } from 'react';
import { formatDateFrench } from '@/utils/date/formatDateFrench';


export default function TransactionIdPage({ params }: { params: Promise<{ accountId: AccountId, transactionId: TransactionId }> }) {
  const { accountId, transactionId } = use(params)
  const router = useRouter();
  const query = useQuery(endpoints.accounts.transactions.get({ transactionId, accountIban: accountId }))

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">Détail de la transaction</h1>
      </div>
      {match(query)
        .with({ status: "error" }, () => "error")
        .with({ status: "pending" }, () => "pending")
        .with({ status: "success" }, ({ data: transaction }) =>
          <>
            {console.log(transaction)}
            <Card
              className={`rounded-2xl text-white shadow-lg border-0 bg-linear-to-br  ${fromColorClasses[800]['blue']}
            ${toColorClasses[500]['blue']} 
            ${textColorClasses[50]['blue']} `}
            >
              <CardContent className=" flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-lg font-medium">
                    {transaction.icon && <span className="mr-3">{transaction.icon}</span>}
                    {transaction.label}
                  </p>
                  <p className="opacity-80 text-sm">{formatDateFrench(transaction.date)}</p>
                </div>
                <div>
                  <p className="text-xs opacity-75 mb-1">Montant</p>
                  <p className="text-3xl font-bold">
                    {transaction.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-lg border-0 overflow-hidden">
              <CardContent className="space-y-3">
                <div className="flex justify-between text-lg">
                  <p className="opacity-80">Type</p>
                  <p className="capitalize">{transaction.type}</p>
                </div>
                <div className="flex justify-between text-lg">
                  <p className="opacity-80">Depuis le compte</p>
                  <p className="truncate">{transaction.fromAccount.name} de {transaction.fromAccount.user.email}
                  </p>
                </div>
                <div className="flex justify-between text-lg">
                  <p className="opacity-80">Vers le compte</p>
                  <p className="truncate">{transaction.toAccount.name} de {transaction.toAccount.user.email}
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )
        .exhaustive()}

    </>
  );
}
