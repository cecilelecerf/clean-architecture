import { UsersSkeleton } from "@/components/users/UserCard";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { AdminUsersClient } from "./users-clients";

type Props = {
    searchParams: { role?: string };
};

export default async function AdminUsersPage({ searchParams }: Props) {
    const t = await getTranslations("director.user");
    const roleParam = searchParams.role;

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
