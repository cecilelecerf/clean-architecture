
import { UserId } from "@infrastructure/types/user";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { TitleAdminPage } from "@/components/TitleAdminPage";
import ClientClientPage from "./page-client";
import getQueryClient from "@/app/getClient";

export default async function ClientPage({ params }: { params: Promise<{ userId: UserId }> }) {
    const { userId } = await params
    const queryClient = getQueryClient();
    await queryClient.prefetchQuery(endpoints.users.get({ id: userId }));

    return (
        <>
            <TitleAdminPage />
            <HydrationBoundary state={dehydrate(queryClient)}>
                <ClientClientPage userId={userId} />
            </HydrationBoundary>

        </>
    )
}



