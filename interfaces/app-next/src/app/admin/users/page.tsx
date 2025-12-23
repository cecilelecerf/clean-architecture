"use client"
import { TitleAdminPage } from "@/components/TitleAdminPage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { endpoints } from "@/utils/endpoint";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { match } from "ts-pattern";

export default function AdminUsersPage() {
    const query = useQuery(endpoints.users.getAll({ role: "client" }))
    const router = useRouter()
    return (
        <>
            <TitleAdminPage title="Clients" />
            {match(query)
                .with({ status: "error" }, () => "error")
                .with({ status: "pending" }, () => <UsersSkeleton />)
                .with({ status: "success" }, ({ data: users }) => {
                    if (users.length === 0) return <div className="text-gray-500 text-center border p-6 rounded-lg">
                        Aucun utilisateur associé pour le moment.
                    </div>
                    return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {users.map((user) => (
                            <Card key={user.id} className="flex items-center gap-4 p-4">
                                <Avatar>
                                    <AvatarFallback>
                                        {user.firstname?.[0]}
                                        {user.lastname?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-semibold text-center">
                                        {user.firstname} {user.lastname}
                                    </p>
                                    <p className="text-sm text-center text-gray-500">{user.email}</p>
                                </div>
                                <div >
                                    <Button
                                        onClick={() => router.push(`users/${user.id}`)}
                                    >
                                        + d&apos;info
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>

                }
                ).exhaustive()
            }
        </>
    )
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
)