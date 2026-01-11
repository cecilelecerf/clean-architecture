
import { UserId } from "@infrastructure/types/user";
import { TitleAdminPage } from "@/components/TitleAdminPage";
import ClientClientPage from "./page-client";

export default async function ClientPage({ params }: { params: Promise<{ userId: UserId }> }) {
    const { userId } = await params
    return (
        <>
            <TitleAdminPage />
            <ClientClientPage userId={userId} />


        </>
    )
}



