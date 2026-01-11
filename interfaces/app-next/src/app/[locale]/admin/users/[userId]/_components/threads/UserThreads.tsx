"use client"
import { endpoints } from "@/utils/endpoint"
import { UserId } from "@infrastructure/types/user"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { match } from "ts-pattern"
import { ThreadCard, UserThreadsSkeleton } from "./ThreadCard"

export const UserThreads = ({ userId }: { userId: UserId }) => {
    const { data: session } = useSession()
    const query = useQuery(endpoints.threads.getByUser({ userId }))
    return match(query)
        .with({ status: "error" }, () => "error")
        .with({ status: 'pending' }, () => <UserThreadsSkeleton />)
        .with({ status: "success" }, ({ data: threads }) => {
            if (threads.length === 0) return
            return (
                <section>
                    <h2 className="text-lg font-bold mb-4">Conversations clients</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {threads.map((thread) => (
                            <ThreadCard thread={thread} haveAcceded={session.user.id === thread.administratorId}
                            />
                        ))}
                    </div>
                </section>)
        }
        ).exhaustive()
}

