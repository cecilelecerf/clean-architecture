"use client";
import { GoToAddPage } from "@/components/GoToAddPage";
import { TitleAdminPage } from "@/components/TitleAdminPage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { endpoints } from "@/utils/endpoint";
import { User } from "@infrastructure/types/user";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { match } from "ts-pattern";

function AdminUsersContent() {
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const router = useRouter();
    const roleParam = searchParams.get('role');



    const role: User["role"] | undefined = match(roleParam)
        .with("director", () => "directeur" as User["role"])
        .with("advisor", () => "conseiller" as User["role"])
        .otherwise(() => undefined);

    const query = useQuery(endpoints.users.getAll({ role }));

    const title = match(roleParam)
        .with("director", () => "Directeurs")
        .with("advisor", () => "Conseillers")
        .otherwise(() => "Directeurs et Conseillers");

    if (!session?.user?.id) {
        return <div>Unauthorized</div>;
    }
    return (
        <>
            <TitleAdminPage title={title} />
            {match(query)
                .with({ status: "error" }, ({ error }) => ("error"
                ))
                .with({ status: "pending" }, () => <UsersSkeleton />)
                .with({ status: "success" }, ({ data: users }) => {
                    const filteredUsers = users.filter((user) => user.id !== session.user.id);

                    if (filteredUsers.length === 0) {
                        return (
                            <div className="text-gray-500 text-center border p-6 rounded-lg">
                                Aucun utilisateur associé pour le moment.
                            </div>
                        );
                    }

                    return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredUsers.map((user) => (
                                <Card key={user.id} className="flex items-center gap-4 p-4">
                                    <Avatar>
                                        <AvatarFallback>
                                            {user.firstname?.[0]}{user.lastname?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-semibold text-center">
                                            {user.firstname} {user.lastname}
                                        </p>
                                        <p className="text-sm text-center text-gray-500">
                                            {user.email}
                                        </p>
                                    </div>
                                    <Button onClick={() => router.push(`/director/users/${user.id}`)}>
                                        + d&apos;info
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    );
                })
                .exhaustive()
            }
            <GoToAddPage path={`/director/users/new${roleParam ? `?role=${roleParam}` : ""}`} />
        </>
    );
}

export default function AdminUsersPage() {
    return (
        <Suspense fallback={<UsersSkeleton />}>
            <AdminUsersContent />
        </Suspense>
    );
}

const UsersSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="flex items-center gap-4 p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32 mx-auto" />
                    <Skeleton className="h-3 w-40 mx-auto" />
                </div>
                <Skeleton className="h-9 w-20" />
            </Card>
        ))}
    </div>
);