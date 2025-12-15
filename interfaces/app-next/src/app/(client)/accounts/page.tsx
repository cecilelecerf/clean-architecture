'use client';

import { Card } from '@/components/ui/card';
import { textColorClasses } from '@/utils/color';
import { toStringTypeAccount } from '@/utils/toStringTypeAccount';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { match } from 'ts-pattern';
import { ButtonLink } from '@/components/buttons/ButtonLink';
import { clientEndpoints } from '@/utils/endpoint/client';

export default function AccountsPage() {
  const router = useRouter();
  const query = useQuery(clientEndpoints.accounts.getAll())

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Mes comptes</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {match(query)
          .with({ "status": "error" }, () => "error")
          .with({ status: "pending" }, () => "loading")
          .with({ status: "success" }, ({ data }) => {
            return data.map((account) => (
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
            ))

          }
          ).exhaustive()}
      </div>
      <ButtonLink path='/accounts/new'>
        + Ajouter un compte
      </ButtonLink>
    </>
  );
}
