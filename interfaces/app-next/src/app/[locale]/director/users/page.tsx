import { UsersSkeleton } from "@/components/users/UserCard";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { AdminUsersClient } from "./users-clients";
type SearchParams = Promise<{
    role?: "director" | "advisor";
}>;

type Props = {
    searchParams: SearchParams;
};

export default async function AdminUsersPage({ searchParams }: Props) {
    const params = await searchParams;
    const t = await getTranslations("director.user");
    const roleParam = params.role;
    const title = roleParam === "director"
        ? "Directeurs"
        : roleParam === "advisor"
            ? "Conseillers"
            : "Directeurs et Conseillers";
    const translations = {
        none: t("none"),
        moreInfo: "+ d'info",
    };

    return (
        <Suspense fallback={<UsersSkeleton />}>
            <AdminUsersClient
                roleParam={roleParam}
                title={title}
                translations={translations}
            />
        </Suspense>
    );
}
