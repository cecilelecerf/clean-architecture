"use client"

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { TitleAdminPage } from "@/components/TitleAdminPage";

export default function SavingsRatePage(){
    const router = useRouter();
    return(
        <>
            <TitleAdminPage title="Taux d'épargne" />
            <Button
                size="sm"
                onClick={() => router.push(`/director/saving-rate/new/`)}
            >
                Créer un nouveau taux
            </Button>
        </>
    )
}