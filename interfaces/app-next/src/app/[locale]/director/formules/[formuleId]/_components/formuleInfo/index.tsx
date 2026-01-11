"use client"
import { FormuleId } from "@infrastructure/types/formule";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { match } from "ts-pattern";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { memo, useCallback } from "react";
import { FormuleCard } from "./FormuleCard";
import { FormuleInfoSkeleton } from "./FormuleInfoSkeleton";

export const FormuleInfo = memo(({ formuleId }: { formuleId: FormuleId }) => {
    const query = useQuery(endpoints.formules.get({ formuleId }));
    const router = useRouter();
    const t = useTranslations("director.credits.info");

    const handleUpdate = useCallback(() => {
        router.push(`/director/formules/${formuleId}/update`);
    }, [router, formuleId]);

    return match(query)
        .with({ status: "error" }, () => (
            <div className="text-red-500 text-center border border-red-300 p-6 rounded-lg">
                Une erreur est survenue lors du chargement de la formule
            </div>
        ))
        .with({ status: 'pending' }, () => <FormuleInfoSkeleton />)
        .with({ status: "success" }, ({ data: formule }) => (
            <FormuleCard
                formule={formule}
                onUpdate={handleUpdate}
                t={t}
            />
        ))
        .exhaustive();
});

FormuleInfo.displayName = 'FormuleInfo';