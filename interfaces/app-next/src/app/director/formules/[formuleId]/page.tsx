"use client";

import { useParams } from "next/navigation";
import { FormuleId } from "@infrastructure/types/formule";
import { FormuleInfo } from "./FormuleInfo";

export default function FormulePage() {
    const { formuleId } = useParams<{ formuleId: FormuleId }>();
    // TODO: Ajouter les credit en cours lié à cette formule de prêt, l'argent gagné par la banque etc ... 
    return(
        <>
            <FormuleInfo formuleId={formuleId} />
        </>
    )
}