'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { textColorClasses } from '@/utils/color';
import { toStringTypeAccount } from '@/utils/toStringTypeAccount';
import { mockAccounts } from '@infrastructure/data/accounts';
import { useRouter } from 'next/navigation';

export default function AccountsPage() {

  const router = useRouter();

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Mes comptes</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {mockAccounts.map((account) => (
          <Card
            key={account.IBAN}
            className={`p-4 flex justify-between items-center rounded-lg border-0 bg-gray-50 hover:bg-gray-100 shadow-none transition-all duration-200 cursor-pointer flex-row`}
            onClick={() => router.push(`/accounts/${account.IBAN}`)}
          >
            {/* Left side */}

            <div>
              <p className={`font-semibold text-lg leading-5`}>{account.name}</p>
              <p className="text-sm text-gray-500">{toStringTypeAccount(account)}</p>
            </div>

            {/* Right side */}
            <div className="text-right">
              <p className={`font-bold text-gray-800 ${textColorClasses[700][account.color]}`}>
                {account.balance.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </p>
              <p className={`text-xs font-medium mt-0.5`}>Disponible</p>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-6">
        <Button
          variant="ghost"
          className="w-full bg-gray-100 text-gray-800 hover:bg-gray-200"
          onClick={() => router.push('/accounts/new')}
        >
          + Ajouter un compte
        </Button>
      </div>
    </>
  );
}
