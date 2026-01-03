"use client"

import { TitleAdminPage } from "@/components/TitleAdminPage";
import { endpoints } from "@/utils/endpoint";
import { useQuery } from "@tanstack/react-query";
import { match } from "ts-pattern";
import { CreditsSkeleton } from "@/components/credits/CreditArraySkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { CreditArray } from "@/components/credits/CreditArray";

export default function CurrentCreditListHomePage() {
    const query = useQuery(endpoints.credits.getAllActive());

    return (
        <>
            <TitleAdminPage title="Crédits en cours" />
            <>
                {match(query)
                    .with({ status: "error" }, () => "error")
                    .with({ status: "pending" }, () => <CreditsSkeleton />)
                    .with({ status: "success" }, ({ data: credits }) => {
                        if (credits.length === 0) {
                            return (
                                <Card className="text-center p-8 md:p-12">
                                    <CardContent>
                                        <p className="text-gray-500">
                                            Aucun crédit en cours
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        }
            
                        return (<CreditArray credits={credits} title="Tous les crédits" isAdmin basePath="/admin" />);
                    })
                    .exhaustive()}
            </>
        </>
    )
}