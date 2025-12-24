import { TitleAdminPage } from "@/components/TitleAdminPage";
import { GetAllSavingsRate } from "./GetAll";
import { AdminSavingsRateHeroBanner } from "./GetCurrentSavingRate";
import { WrapperDirectorSavingRate } from "./WrapperDirectorSavingRate";

export default function SavingsRatePage() {
    return (
        <>
            <TitleAdminPage title="Taux d'épargne" />
            <WrapperDirectorSavingRate />
        </>
    )
}