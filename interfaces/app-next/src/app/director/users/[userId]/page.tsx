"use client";

import { UserId } from "@infrastructure/types/user";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { match } from "ts-pattern";
import { TitleAdminPage } from "@/components/TitleAdminPage";
import { CardUserDetail, SkeletonCardUserDetail } from "@/components/users/CardUserDetail";
import { CardUserAction, SkeletonCardUserAction } from "@/components/users/CardAction";



export default function ClientPage({ params }: { params: Promise<{ userId: UserId }> }) {
    const { userId } = use(params)
    const query = useQuery(endpoints.users.get({ id: userId }));

    return (<>
        <TitleAdminPage />

        {match(query)
            .with({ status: "error" }, () => 'error')
            .with({ status: 'pending' }, () =>
                <div className="space-y-6">
                    <SkeletonCardUserDetail />
                    <SkeletonCardUserAction />
                </div>)
            .with({ status: "success" }, ({ data: user }) =>
                <div className="space-y-6">
                    <CardUserDetail user={user} />
                    <CardUserAction user={user} />
                </div>
            ).exhaustive()}
    </>
    )
}



