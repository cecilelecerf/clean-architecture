"use client";

import { useParams } from "next/navigation";
import { FormuleId } from "@infrastructure/types/formule";
import { FormuleInfo } from "./_components/formuleInfo";
import { TitleAdminPage } from "@/components/TitleAdminPage";
import { CreditByFormule } from "./_components/creditByFormule";
import { FormuleStatistics } from "./_components/formuleStatistics";

export default function FormulePage() {
    const { formuleId } = useParams<{ formuleId: FormuleId }>();
    return (
        <>
            <TitleAdminPage title="Formules de prêt" />
            <FormuleInfo formuleId={formuleId} />
            <FormuleStatistics formuleId={formuleId} />
            <CreditByFormule formuleId={formuleId} />
        </>
    )
}