import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDateFrench } from "@/utils/date/formatDateFrench"
import { endpoints } from "@/utils/endpoint"
import { UserId } from "@infrastructure/types/user"
import { Flex } from "@radix-ui/themes"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { match } from "ts-pattern"

export const UserThreads = ({ userId }: { userId: UserId }) => {
    const { data: session } = useSession()
    const router = useRouter()
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
                        {threads.map((acc) => (
                            <Card
                                key={acc.id}
                                className={`shadow-sm gap-0`}
                            >
                                <CardHeader>
                                    <Flex justify="between" gap="2">

                                        <CardTitle>{acc.title}</CardTitle>
                                        <Badge>{acc.isClose ? "Fermé" : "Ouvert"}</Badge>
                                    </Flex>
                                </CardHeader>
                                <CardContent className="flex flex-col justify-center">

                                    {session.user.id === acc.administratorId && <Button variant="link" onClick={() => router.push(`/admin/client-threads/${acc.id}`)}>Accéder</Button>}
                                    <p className="text-xs text-center">{formatDateFrench(acc.updatedAt)}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>)
        }
        ).exhaustive()
}


const UserThreadsSkeleton = () => (
    <section>
        <h2 className="text-lg font-semibold mb-4">Conversations clients</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="shadow-sm">
                    <CardHeader>
                        <Flex justify="between" gap="2" align="center">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </Flex>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-center items-center space-y-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-3 w-28" />
                    </CardContent>
                </Card>
            ))}
        </div>
    </section>
);
