"use client"

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { TitleAdminPage } from "@/components/TitleAdminPage";
import { SavingsRateHeroBanner } from "./GetCurrentSavingRate";

export default function SavingsRatePage() {
    const router = useRouter();
    return (
        <>
            <TitleAdminPage title="Taux d'épargne" />
            <SavingsRateHeroBanner />
        </>
    )
}