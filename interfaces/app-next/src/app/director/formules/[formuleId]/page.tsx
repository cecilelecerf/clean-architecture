"use client";

import { useParams } from "next/navigation";
import { FormuleId } from "@infrastructure/types/formule";
import { FormuleInfo } from "./FormuleInfo";
import { TitleAdminPage } from "@/components/TitleAdminPage";
import { CreditByFormule } from "./CreditByFormule";
import { FormuleStatistics } from "./FormuleStatistics";

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