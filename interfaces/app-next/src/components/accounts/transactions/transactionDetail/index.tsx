'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TransactionId } from '@infrastructure/types/transaction';
import { useQuery } from '@tanstack/react-query';
import { endpoints } from '@/utils/endpoint';
import { AccountId } from '@infrastructure/types/account';
import { match } from 'ts-pattern';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { TransactionCardContent } from './TransactionCardContent';
import { AccountTransactionDetail } from './AccountDetail';
import { TransactionDetailSkeleton } from './TransactionDetailSkeleton';


interface TransactionDetailProps {
    transactionId: TransactionId;
    accountIban: AccountId
    clickable?: boolean,
}

export function TransactionDetail({
    transactionId,
    accountIban,
    clickable,
}: TransactionDetailProps) {
    const router = useRouter();
    const query = useQuery(endpoints.accounts.transactions.get({ transactionId, accountIban }));

    const t = useTranslations("account.transactions.details");

    return (
        <>
            <div className="flex items-center gap-2 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-bold">{t("title")}</h1>
            </div>
            {match(query)
                .with({ status: "pending" }, () => <TransactionDetailSkeleton />)
                .with({ status: "error" }, () => "error")
                .with({ status: "success" }, ({ data: transaction }) => (
                    <>
                        <TransactionCardContent transaction={transaction} />
                        <AccountTransactionDetail clickable={clickable} transaction={transaction} />
                    </>
                )
                ).exhaustive()
            }
        </>
    );
}


