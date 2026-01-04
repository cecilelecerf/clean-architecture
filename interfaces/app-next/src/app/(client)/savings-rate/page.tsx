import { TitleAdminPage } from "@/components/TitleAdminPage";
import { SavingsRateHeroBanner } from "./GetCurrentSavingRate";

export default function SavingsRatePage() {
    return (
        <>
            <TitleAdminPage title="Taux d'épargne" />
            <SavingsRateHeroBanner />
        </>
    )
}