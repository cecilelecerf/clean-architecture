"use client";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { UserId } from "@infrastructure/types/user";
import { match } from "ts-pattern";
import { CardUserDetail, SkeletonCardUserDetail } from "@/components/users/CardUserDetail";
import { CardUserAction, SkeletonCardUserAction } from "@/components/users/CardAction";

export const UserInfo = ({ userId }: { userId: UserId }) => {
    const query = useQuery(endpoints.users.get({ id: userId }))
    return match(query)
        .with({ status: "error" }, () => 'error')
        .with({ status: 'pending' }, () =>
            <>
                <SkeletonCardUserDetail />
                <SkeletonCardUserAction />
            </>)
        .with({ status: "success" }, ({ data: user }) =>
            <>
                <CardUserDetail user={user} />
                <CardUserAction user={user} />
            </>
        ).exhaustive()
}