"use client";

import { UserId } from "@infrastructure/types/user";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { match } from "ts-pattern";
import { CardUserDetail, SkeletonCardUserDetail } from "@/components/users/CardUserDetail";
import { CardUserAction, SkeletonCardUserAction } from "@/components/users/CardAction";

type Props = {
    userId: UserId
}

export default function ClientClientPage({ userId }: Props) {
    const query = useQuery(endpoints.users.get({ id: userId }));

    return (
        <>
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
                )
                .exhaustive()}
        </>
    )
}



