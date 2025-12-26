'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fromColorClasses, textColorClasses, toColorClasses } from '@/utils/color';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { match } from 'ts-pattern';
import { endpoints } from '@/utils/endpoint';
import { ButtonLink } from '@/components/buttons/ButtonLink';
import { SavingsRateHeroBanner } from '../savings-rate/GetCurrentSavingRate';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccountsPage() {
  const router = useRouter();
  const query = useQuery(endpoints.accounts.getAllByMe())

  return (
    <>
      <SavingsRateHeroBanner />

      <h1 className="text-2xl font-bold mb-2 mt-10">Mes comptes</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {match(query)
          .with({ "status": "error" }, () => "error")
          .with({ status: "pending" }, () => <SkeletonAccounts />)
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
                  <p className="text-sm text-gray-500">{account.type}</p>
                </div>

                {/* Right side */}
                <div className="text-right">
                  <p className={`font-bold ${account.amount > 0 ? "text-emerald-700" : "text-red-700"} `}>
                    {account.amount.toLocaleString('fr-FR', {
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


const SkeletonAccounts = () => {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <Card
          key={index}
          className="p-4 flex justify-between items-center rounded-lg border-0 bg-gray-50 shadow-none flex-row"
        >
          {/* Left side */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Right side */}
          <div className="text-right space-y-2">
            <Skeleton className="h-6 w-24 ml-auto" />
            <Skeleton className="h-3 w-16 ml-auto" />
          </div>
        </Card>
      ))}
    </>
  );
};