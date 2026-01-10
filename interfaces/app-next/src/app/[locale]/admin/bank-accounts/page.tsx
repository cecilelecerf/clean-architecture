"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { endpoints } from "@/utils/endpoint";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { match } from "ts-pattern";
import { TitleAdminPage } from "@/components/TitleAdminPage";
import { AccountCard } from "@/components/accounts/AccountCard";

export default function AccountsPage() {
    const query = useQuery(endpoints.accounts.getAll({ type: "bank" }));
    const router = useRouter();

    return (
        <>
            <TitleAdminPage title="Comptes clients" />
            {match(query)
                .with({ status: "error" }, () => ("error"))
                .with({ status: "pending" }, () => <AccountsSkeleton />)
                .with({ status: "success" }, ({ data: accounts }) => {
                    if (accounts.length === 0) {
                        return (
                            <div className="text-gray-500 text-center border p-6 rounded-lg">
                                Aucun compte client pour le moment.
                            </div>
                        );
                    }

                    return (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {accounts.map((acc) => (
                                <AccountCard
                                    key={acc.IBAN}
                                    account={acc}
                                    onClickAccount={(iban) => router.push(`/admin/bank-accounts/${iban}`)}
                                />
                            ))}
                        </div>
                    );
                })
                .exhaustive()}
        </>
    );
}

const AccountsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="shadow-sm">
                <CardContent className="p-4 space-y-3">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="py-3 px-4 bg-gray-50 rounded-lg space-y-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-8 w-28" />
                    </div>
                    <div className="flex items-center gap-3 pt-2 border-t">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-40" />
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Skeleton className="h-8 flex-1" />
                        <Skeleton className="h-8 flex-1" />
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
);