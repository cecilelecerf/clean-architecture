"use client"
import { CreditArray } from "@/components/credits/CreditArray";
import { CreditsSkeleton } from "@/components/credits/CreditArraySkeleton";
import { TitleAdminPage } from "@/components/TitleAdminPage";
import { Card, CardContent } from "@/components/ui/card";
import { endpoints } from "@/utils/endpoint";
import { UserId } from "@infrastructure/types/user";
import { useQuery } from "@tanstack/react-query";
import { match } from "ts-pattern";

export default function AdminHomePage() {
    const query = useQuery(endpoints.credits.getAllByClientId({ userId: "efrfe" as UserId }));

    return (
        <>
            <TitleAdminPage title="Crédits en attente de traitement" />
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
                                            Aucune demande de crédit en attente de traitement
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
    );

}
