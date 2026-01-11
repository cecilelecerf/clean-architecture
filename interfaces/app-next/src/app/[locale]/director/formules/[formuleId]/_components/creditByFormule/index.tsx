"use client"
import { FormuleId } from "@infrastructure/types/formule";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { match } from "ts-pattern";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { memo } from "react";
import { CreditListSkeleton } from "./CreditListSkeleton";
import { CreditCard } from "./CreditCard";
import { EmptyState } from "./EmptyState";

export const CreditByFormule = memo(({ formuleId }: { formuleId: FormuleId }) => {
    const query = useQuery(endpoints.credits.getAllByFormuleId({ formuleId }));
    const router = useRouter();
    const t = useTranslations("director.credits.formulas");

    const handleBackClick = () => {
        router.push('/director/formules');
    }

    return match(query)
        .with({ status: "error" }, () => (
            <div className="text-red-500 text-center border border-red-300 p-6 rounded-lg">
                Une erreur est survenue lors du chargement des crédits
            </div>
        ))
        .with({ status: 'pending' }, () => <CreditListSkeleton />)
        .with({ status: "success" }, ({ data: credits }) => {
            if (credits.length === 0) return <EmptyState onBack={handleBackClick} t={t} />
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {credits.map((credit) => (
                        <CreditCard key={credit.id} credit={credit} t={t} />
                    ))}
                </div>
            );
        })
        .exhaustive();
});

CreditByFormule.displayName = 'CreditByFormule';








