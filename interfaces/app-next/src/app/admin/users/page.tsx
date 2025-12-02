"use client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { advisorEndpoint } from "@/utils/endpoint/advisor";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { match } from "ts-pattern";

export default function AdminUsersPage() {
    const query = useQuery(advisorEndpoint.users.getAll())
    const router = useRouter()
    return match(query)
        .with({ status: "error" }, () => "error")
        .with({ status: "pending" }, () => "pending")
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
                        <div className="">
                            <Button
                                onClick={() => router.push(`users/${user.id}`)}
                            >
                                + d'info
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

        }
        ).exhaustive()

}
