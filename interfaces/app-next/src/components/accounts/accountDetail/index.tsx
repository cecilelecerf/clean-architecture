'use client';

import { AccountId } from '@infrastructure/types/account';
import { useQuery } from '@tanstack/react-query';
import { endpoints } from '@/utils/endpoint';
import { match } from 'ts-pattern';
import { Flex } from '@radix-ui/themes';
import { GetAllTransactions } from '@/components/accounts/transactions/GetAllTransactions';
import { Separator } from '../../ui/separator';
import { ButtonLink } from '@/components/ButtonLink';
import { SkeletonAccount } from './SkeletonAccount';
import { AccountHero } from './Hero';

export const AccountDetail = ({
    accountIban,
    basePath,
    withUserInfo,
    withTransferButton
}: {
    accountIban: AccountId,
    basePath: string,
    withUserInfo?: boolean,
    withTransferButton?: boolean
}) => {
    const query = useQuery(endpoints.accounts.get({ accountIban }));
    return (
        <>
            {match(query)
                .with({ status: "pending" }, () => <SkeletonAccount />)
                .with({ status: "error" }, () => <div className="text-red-500">Erreur de chargement</div>)
                .with({ status: "success" }, ({ data: account }) => {
                    return (
                        <div className="flex flex-col gap-6">
                            <AccountHero account={account} />
                            {withUserInfo && account.userId && (
                                <>
                                    <ButtonLink
                                        className="flex-1 mx-1 bg-gray-100 text-gray-800 hover:bg-gray-200"
                                        href={`/admin/users/${account.userId}`}>
                                        Voir le client
                                    </ButtonLink>
                                    <Separator />
                                </>
                            )
                            }

                            {withTransferButton && (
                                <>
                                    <ButtonLink
                                        className="flex-1 mx-1 bg-gray-100 text-gray-800 hover:bg-gray-200"
                                        href={`${basePath}/${account.IBAN}/transactions/new`}>
                                        Transférer
                                    </ButtonLink>
                                    <Separator />
                                </>
                            )}

                            <Flex direction="column" gap="4">
                                <Flex justify="between">
                                    <h2 className="font-semibold text-lg">Dernières transactions</h2>

                                    <ButtonLink
                                        variant='link'
                                        href={`${basePath}/${account.IBAN}/transactions`}>
                                        Voir +
                                    </ButtonLink>

                                </Flex>


                                <GetAllTransactions
                                    accountIban={accountIban}
                                    filters={{ limit: 4, page: 1 }}
                                    onPaginationChange={() => { }}
                                    hiddePagination
                                    baseHref={`${basePath}/${accountIban}/transactions`}
                                />

                            </Flex>

                        </div >
                    );
                })
                .exhaustive()}
        </>
    );
};

