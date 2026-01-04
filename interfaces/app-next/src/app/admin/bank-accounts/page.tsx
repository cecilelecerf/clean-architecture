"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { endpoints } from "@/utils/endpoint";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { match } from "ts-pattern";
import { TitleAdminPage } from "@/components/TitleAdminPage";

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
                                <Card
                                    key={acc.IBAN}
                                    className={`shadow hover:shadow-lg transition-all py-1`}
                                    onClick={() => router.push(`/admin/bank-accounts/${acc.IBAN}`)}
                                >
                                    <CardContent className="p-4 space-y-3">
                                        {/* Nom du compte */}
                                        <div>
                                            <h3 className="font-semibold text-lg">{acc.name}</h3>
                                            <p className="text-xs text-gray-500">
                                                {acc.type === "courant" ? "Compte courant" : "Compte épargne"}
                                            </p>
                                        </div>

                                        {/* Solde */}
                                        <div className="py-3 px-4 bg-gray-50 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1">Solde</p>
                                            <p className="text-2xl font-bold">
                                                {acc.amount.toLocaleString("fr-FR", {
                                                    style: "currency",
                                                    currency: acc.currency,
                                                })}
                                            </p>
                                        </div>


                                        {/* Actions */}
                                        <div className="flex flex-col gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => router.push(`/admin/bank-accounts/${acc.IBAN}`)}
                                            >
                                                Voir compte
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
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