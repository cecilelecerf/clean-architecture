'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ArrowDown, ArrowLeft } from 'lucide-react';
import { fromColorClasses, textColorClasses, toColorClasses } from '@/utils/color';
import { formatDateFrench } from '@/utils/date/formatDateFrench';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { TransactionId } from '@infrastructure/types/transaction';
import { Button } from '../ui/button';
import { useQuery } from '@tanstack/react-query';
import { endpoints } from '@/utils/endpoint';
import { AccountId, AccountResumeWithUser } from '@infrastructure/types/account';
import { match } from 'ts-pattern';
import { Skeleton } from '../ui/skeleton';


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
    const query = useQuery(endpoints.accounts.transactions.get({ transactionId, accountIban }))

    return (
        <>
            <div className="flex items-center gap-2 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-bold">Détail de la transaction</h1>
            </div>
            {match(query)
                .with({ status: "pending" }, () => <TransactionDetailSkeleton />)
                .with({ status: "error" }, () => "error")
                .with({ status: "success" }, ({ data: transaction }) => (
                    <>

                        <Card
                            className={`rounded-2xl text-white shadow-lg border-0 bg-linear-to-br ${fromColorClasses[800]['blue']} ${toColorClasses[500]['blue']} ${textColorClasses[50]['blue']}`}
                        >
                            <CardContent className="flex flex-col justify-between">
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
                                <div className="mt-4 pt-4 border-t border-white/20">
                                    <p className="text-xs opacity-75">Type de transaction</p>
                                    <p className="text-sm font-medium capitalize mt-1">{transaction.type}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col md:flex-row items-center gap-4 my-6">
                            {/* Compte source */}
                            <AccountCard clickable={clickable} account={transaction.fromAccount} />

                            {/* Flèche responsive */}
                            <div className="shrink-0">
                                <ArrowDown className="w-6 h-6 text-gray-400 md:hidden" />
                                <ArrowRight className="w-6 h-6 text-gray-400 hidden md:block" />
                            </div>

                            {/* Compte destination */}
                            <AccountCard clickable={clickable} account={transaction.toAccount} />
                        </div>
                    </>
                )
                ).exhaustive()
            }
        </>
    );
}

const AccountCard = ({ clickable, account }: { clickable?: boolean, account: AccountResumeWithUser }) => {
    const router = useRouter();

    return (

        <Card className="w-full md:flex-1 rounded-xl shadow-md border-2">
            <CardContent className="p-4">
                <div
                    className={cn(
                        "flex items-center gap-3 mb-3",
                        clickable && "cursor-pointer hover:bg-gray-50  p-2 rounded-lg transition-colors"
                    )}
                    onClick={() => clickable && router.push(`/admin/users/${account.user.id}`)}
                >
                    <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gray-100">
                            {account.user.firstname?.[0]}
                            {account.user.lastname?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                            {account.user.firstname} {account.user.lastname}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {account.user.email}
                        </p>
                    </div>
                </div>
                <div
                    className={cn(
                        `rounded-lg p-3 border-l-4 border-${account.color}-500 bg-gray-50`,
                        clickable && "cursor-pointer hover:bg-gray-100 transition-colors"
                    )}
                    onClick={() => clickable && router.push(`/admin/accounts/${account.IBAN}`)}

                >
                    <p className="text-xs text-gray-500 mb-1">Compte bénéficiaire</p>
                    <p className="font-medium text-sm">{account.name}</p>
                    <p className="text-xs text-gray-400 mt-1">
                        {account.type === "courant" ? "Compte courant" : "Compte épargne"}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

const TransactionDetailSkeleton = () => (
    <>
        <Card className="rounded-2xl shadow-lg border-0 bg-linear-to-br from-blue-800 to-blue-500">
            <CardContent className="flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-6 w-40 bg-white/20" />
                    <Skeleton className="h-4 w-24 bg-white/20" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-16 bg-white/20" />
                    <Skeleton className="h-9 w-32 bg-white/20" />
                </div>
                <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
                    <Skeleton className="h-3 w-32 bg-white/20" />
                    <Skeleton className="h-4 w-24 bg-white/20" />
                </div>
            </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row items-center gap-4 my-6">
            {/* Compte source skeleton */}
            <Card className="w-full md:flex-1 rounded-xl shadow-md border-2">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-40" />
                        </div>
                    </div>
                    <div className="rounded-lg p-3 bg-gray-50 space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-28" />
                    </div>
                </CardContent>
            </Card>

            {/* Flèche */}
            <div className="shrink-0">
                <ArrowDown className="w-6 h-6 text-gray-400 md:hidden" />
                <ArrowRight className="w-6 h-6 text-gray-400 hidden md:block" />
            </div>

            {/* Compte destination skeleton */}
            <Card className="w-full md:flex-1 rounded-xl shadow-md border-2">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-40" />
                        </div>
                    </div>
                    <div className="rounded-lg p-3 bg-gray-50 space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-28" />
                    </div>
                </CardContent>
            </Card>
        </div>
    </>
);