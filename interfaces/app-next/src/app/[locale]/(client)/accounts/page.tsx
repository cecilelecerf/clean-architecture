'use client';

import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { match } from 'ts-pattern';
import { endpoints } from '@/utils/endpoint';
import { SavingsRateHeroBanner } from '../savings-rate/GetCurrentSavingRate';
import { Skeleton } from '@/components/ui/skeleton';
import { AccountCard } from '@/components/accounts/AccountCard';
import { GoToAddPage } from '@/components/GoToAddPage';
import { useTranslations } from 'next-intl';

export default function AccountsPage() {
  const router = useRouter();
  const query = useQuery(endpoints.accounts.getAllByMe());
  const t = useTranslations("client.account");

  return (
    <>
      <SavingsRateHeroBanner />

      <h1 className="text-2xl font-bold mb-2 mt-10">{t("title")}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {match(query)
          .with({ "status": "error" }, () => "error")
          .with({ status: "pending" }, () => <SkeletonAccounts />)
          .with({ status: "success" }, ({ data }) => {
            return data.map((account) =>
            (
              <AccountCard key={account.IBAN} account={account} onClickAccount={(iban) => router.push(`/accounts/${account.IBAN}`)} />
            ))

          }
          ).exhaustive()}
      </div>
      <GoToAddPage path='/accounts/new' />
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