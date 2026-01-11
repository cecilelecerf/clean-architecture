"use client";

import { GoToAddPage } from "@/components/GoToAddPage";
import { TitleAdminPage } from "@/components/TitleAdminPage";
import { UserCard, UsersSkeleton } from "@/components/users/UserCard";
import { endpoints } from "@/utils/endpoint";
import { User } from "@infrastructure/types/user";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { match } from "ts-pattern";

type Props = {
    roleParam?: string;
    title: string;
    translations: {
        none: string;
        moreInfo: string;
    };
};

export function AdminUsersClient({ roleParam, title, translations }: Props) {
    const { data: session } = useSession();
    const router = useRouter();

    const role: User["role"] | undefined = match(roleParam)
        .with("director", () => "directeur" as User["role"])
        .with("advisor", () => "conseiller" as User["role"])
        .otherwise(() => undefined);

    const query = useQuery(endpoints.users.getAll({ role }));

    if (!session?.user?.id) {
        return <div>Unauthorized</div>;
    }

    return (
        <>
            <TitleAdminPage title={title} />
            {match(query)
                .with({ status: "error" }, () => (
                    <div className="text-red-500 text-center border border-red-300 p-6 rounded-lg">
                        Une erreur est survenue lors du chargement des utilisateurs
                    </div>
                ))
                .with({ status: "pending" }, () => <UsersSkeleton />)
                .with({ status: "success" }, ({ data: users }) => {
                    const filteredUsers = users.filter((user) => user.id !== session.user.id);

                    if (filteredUsers.length === 0) {
                        return (
                            <div className="text-gray-500 text-center border p-6 rounded-lg">
                                {translations.none}
                            </div>
                        );
                    }

                    return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredUsers.map((user) => (
                                <UserCard
                                    key={user.id}
                                    user={user}
                                    onViewDetails={() => router.push(`/director/users/${user.id}`)}
                                    moreInfoLabel={translations.moreInfo}
                                />
                            ))}
                        </div>
                    );
                })
                .exhaustive()}
            <GoToAddPage path={`/director/users/new${roleParam ? `?role=${roleParam}` : ""}`} />
        </>
    );
}
