import { UserId } from "@infrastructure/types/user";
import { TitleAdminPage } from "@/components/TitleAdminPage";
import { UserInfo } from "@/components/users/UserInfo";

export default async function ClientPage({ params }: { params: Promise<{ userId: UserId }> }) {
    const { userId } = await params
    return (
        <>
            <TitleAdminPage />
            <UserInfo userId={userId} />
        </>
    )
}



