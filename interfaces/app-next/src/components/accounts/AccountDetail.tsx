
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, MoreVertical } from 'lucide-react';
import { fromColorClasses, textColorClasses, toColorClasses } from '@/utils/color';
import { useRouter } from 'next/navigation';
import { AccountId } from '@infrastructure/types/account';
import { useQuery } from '@tanstack/react-query';
import { endpoints } from '@/utils/endpoint';
import { match } from 'ts-pattern';
import { Flex } from '@radix-ui/themes';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { GetAllTransactions } from '@/components/accounts/transactions/GetAllTransactions';
import { Separator } from '../ui/separator';

export const AccountDetail = ({ accountIban, basePath, withUserInfo, withTransferButton }: { accountIban: AccountId, basePath: string, withUserInfo?: boolean, withTransferButton?: boolean }) => {

    const router = useRouter();
    const query = useQuery(endpoints.accounts.get({ accountIban }));
    return (

        <>
            {match(query)
                .with({ status: "pending" }, () => <SkeletonAccoutn />)
                .with({ status: "error" }, () => "error")
                .with({ status: "success" }, ({ data: account }) =>
                    <div className="flex flex-col gap-6">
                        {/* Account card*/}
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
                                    <p className="text-xs opacity-75 mb-1">{account.type}</p>
                                    <p className="text-3xl font-bold">
                                        {account.balance.amount.toLocaleString('fr-FR', { style: 'currency', currency: account.balance.currency })}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {withUserInfo && account.userId && (
                            <>
                                <Button
                                    onClick={() => router.push(`/admin/users/${account.userId}`)}
                                    className="flex-1 mx-1 bg-gray-100 text-gray-800 hover:bg-gray-200"
                                >
                                    Voir le client
                                </Button>
                                <Separator /></>
                        )}
                        {withTransferButton && (
                            <>
                                <Button
                                    onClick={() => router.push(`${basePath}/${account.IBAN}/transactions/new`)}
                                    className="flex-1 mx-1 bg-gray-100 text-gray-800 hover:bg-gray-200"
                                >
                                    Transférer
                                </Button>
                                <Separator /></>
                        )}
                        {/* Transactions */}
                        <Flex direction="column" gap="4">
                            <Flex justify="between">
                                <h2 className="font-semibold text-lg">Dernières transactions</h2>
                                <Link href={`${basePath}/${account.IBAN}/transactions`}>
                                    <Button variant="link">Voir +</Button>
                                </Link>
                            </Flex>
                            <GetAllTransactions accountIban={accountIban} filters={{ limit: 4, page: 1 }} onPaginationChange={() => { }} hiddePagination baseHref={`${basePath}/${accountIban}/transactions`} />
                        </Flex>
                    </div >
                )
                .exhaustive()}



        </>
    )
}
const SkeletonAccoutn = () => (
    <>
        <Card className="rounded-2xl shadow-lg border-0">
            <CardContent className="flex flex-col justify-between p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <div className="flex gap-2 my-4">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-64" />
                </div>
                <div>
                    <Skeleton className="h-3 w-24 mb-2" />
                    <Skeleton className="h-9 w-40" />
                </div>
            </CardContent>
        </Card>

        {/* Action button skeleton */}
        <Skeleton className="h-20 w-full mx-1 mt-10" /></>
)