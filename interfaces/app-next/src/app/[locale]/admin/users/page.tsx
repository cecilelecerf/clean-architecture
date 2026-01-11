"use client"
import { TitleAdminPage } from "@/components/TitleAdminPage";
import { UserCard, UsersSkeleton } from "@/components/users/UserCard";
import { endpoints } from "@/utils/endpoint";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { match } from "ts-pattern";

export default function AdminUsersPage() {
    const query = useQuery(endpoints.users.getAll({ role: "client" }))
    const t = useTranslations("advisor.users");
    return (
        <>
            <TitleAdminPage title={t("title")} />
            {match(query)
                .with({ status: "error" }, () => "error")
                .with({ status: "pending" }, () => <UsersSkeleton />)
                .with({ status: "success" }, ({ data: users }) => {
                    if (users.length === 0) return <div className="text-gray-500 text-center border p-6 rounded-lg">
                        {t("none")}
                    </div>
                    return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {users.map((user) => (
                            <UserCard key={user.id} user={user} onViewDetailsHref={`users/${user.id}`} />
                        ))}
                    </div>
                }
                ).exhaustive()
            }
        </>
    )
}

