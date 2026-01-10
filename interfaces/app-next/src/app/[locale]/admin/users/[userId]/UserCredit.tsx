"use client";

import { Card, CardContent } from "@/components/ui/card";
import { endpoints } from "@/utils/endpoint";
import { UserId } from "@infrastructure/types/user";
import { useQuery, } from "@tanstack/react-query";
import { match } from "ts-pattern";
import { CreditArray } from "@/components/credits/CreditArray";
import { CreditsSkeleton } from "@/components/credits/CreditArraySkeleton";

export const AdminUserCredits = ({ userId }: { userId: UserId }) => {
    const query = useQuery(endpoints.credits.getAllByClientId({ userId }));

    return (
        <div className="space-y-6">
            <h1 className="text-lg md:text-xl font-bold mb-4">Crédits du client</h1>

            {match(query)
                .with({ status: "error" }, () => "error")
                .with({ status: "pending" }, () => <CreditsSkeleton />)
                .with({ status: "success" }, ({ data: credits }) => {
                    if (credits.length === 0) {
                        return (
                            <Card className="text-center p-8 md:p-12">
                                <CardContent>
                                    <p className="text-gray-500">
                                        Ce client n'a aucune demande de crédit.
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    }

                    return (<CreditArray credits={credits} title="Tous les crédits" isAdmin basePath="/admin" />);
                })
                .exhaustive()}
        </div>
    );
};




