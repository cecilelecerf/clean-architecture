import { FormuleId } from "@infrastructure/types/formule";
import { FormuleInfo } from "./_components/formuleInfo";
import { TitleAdminPage } from "@/components/TitleAdminPage";
import { CreditByFormule } from "./_components/creditByFormule";
import { FormuleStatistics } from "./_components/formuleStatistics";
import { use } from "react";

export default function FormulePage({ params }: { params: Promise<{ formuleId: FormuleId }> }) {
    const { formuleId } = use(params);
    return (
        <>
            <TitleAdminPage title="Formules de prêt" />
            <FormuleInfo formuleId={formuleId} />
            <FormuleStatistics formuleId={formuleId} />
            <CreditByFormule formuleId={formuleId} />
        </>
    )
}