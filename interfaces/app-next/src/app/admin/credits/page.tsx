"use client"
import { CreditArray } from "@/components/credits/CreditArray";
import { CreditsSkeleton } from "@/components/credits/CreditArraySkeleton";
import { TitleAdminPage } from "@/components/TitleAdminPage";
import { Card, CardContent } from "@/components/ui/card";
import { endpoints } from "@/utils/endpoint";
import { CreditDTO } from "@infrastructure/types/credit";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { match } from "ts-pattern";

export default function AdminHomePage() {

    const searchParams = useSearchParams();
    const statusParam = searchParams.get('label');
    const status: CreditDTO["status"] | undefined = match(statusParam)
        .with('accepted', () => "ACCEPTED" as CreditDTO["status"])
        .with("completed", () => "COMPLETED" as CreditDTO["status"])
        .with("pending", () => 'PENDING' as CreditDTO["status"])
        .with("refused", () => 'REFUSED' as CreditDTO["status"])
        .otherwise(() => undefined);

    const query = useQuery(endpoints.credits.getAllByStatus({ status }));

    return (
        <>
            <TitleAdminPage
                title={`Crédits ${match(status)
                    .with('ACCEPTED', () => 'acceptés')
                    .with('COMPLETED', () => 'terminés')
                    .with('PENDING', () => 'en attente de traitement')
                    .with('REFUSED', () => 'refusés')
                    .otherwise(() => '')
                    }`}
            />
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
