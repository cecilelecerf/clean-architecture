"use client";

import { Button } from "@/components/ui/button";
import { endpoints } from "@/utils/endpoint";
import { CreditId } from "@infrastructure/types/credit";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { match } from "ts-pattern";
import {
    ArrowLeft,
} from "lucide-react";
import { use } from "react";
import { CreditDetails, CreditDetailSkeleton } from "@/components/credits/CreditDetails";


export default function CreditDetailPage({
    params,
}: {
    params: Promise<{ creditId: CreditId }>;
}) {
    const { creditId } = use(params);
    const router = useRouter();
    const query = useQuery(endpoints.credits.get({ creditId }));

    return (
        <>
            <div className="flex items-center gap-2 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-bold">Détail du crédit</h1>
            </div>

            {match(query)
                .with({ status: "error" }, () => ("error"
                ))
                .with({ status: "pending" }, () => <CreditDetailSkeleton />)
                .with({ status: "success" }, ({ data: credit }) => <CreditDetails credit={credit} account={credit.account} />)
                .exhaustive()}
        </>
    );
}
