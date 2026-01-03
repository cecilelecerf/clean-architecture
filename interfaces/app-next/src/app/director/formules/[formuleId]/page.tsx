"use client";

import { useParams } from "next/navigation";
import { FormuleId } from "@infrastructure/types/formule";
import { FormuleInfo } from "./FormuleInfo";
import { TitleAdminPage } from "@/components/TitleAdminPage";
import { CreditByFormule } from "./CreditByFormule";
import { Separator } from "@/components/ui/separator";

export default function FormulePage() {
    const { formuleId } = useParams<{ formuleId: FormuleId }>();
    // TODO: Ajouter les credit en cours lié à cette formule de prêt, l'argent gagné par la banque etc ... 
    return (
        <>
            <TitleAdminPage title="Formules de prêt" />

            <FormuleInfo formuleId={formuleId} />
            <Separator className="mt-12" />
            <CreditByFormule formuleId={formuleId} />
        </>
    )
}