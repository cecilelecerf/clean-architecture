import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { fromColorClasses, textColorClasses, toColorClasses } from "@/utils/color"
import { endpoints } from "@/utils/endpoint"
import { UserId } from "@infrastructure/types/user"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { match } from "ts-pattern"

export const UserAccounts = ({ userId }: { userId: UserId }) => {
    const router = useRouter()
    const query = useQuery(endpoints.accounts.getAllByClient({ userId }))

    return (
        <section>
            <h2 className="text-lg font-bold mb-4">Comptes bancaires</h2>
            {match(query)
                .with({ status: "error" }, () => ("error"))
                .with({ status: "pending" }, () => <AccountsSkeleton />)
                .with({ status: "success" }, ({ data: accounts }) => {
                    if (accounts.length === 0) {
                        return (
                            <div className="text-gray-500 text-center border p-6 rounded-lg">
                                Aucun compte bancaire pour le moment.
                            </div>
                        )
                    }

                    return (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {accounts.map((acc) => (
                                <Card
                                    key={acc.IBAN}
                                    className={`shadow border-0 bg-linear-to-br transition duration-200 hover:shadow-lg hover:scale-105
                                        ${fromColorClasses[800][acc.color]}
                                        ${toColorClasses[500][acc.color]} 
                                        ${textColorClasses[50][acc.color]}
                                    `}
                                    onClick={() => router.push(`/admin/accounts/${acc.IBAN}`)}
                                >
                                    <CardHeader>
                                        <CardTitle>{acc.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-1 text-sm">
                                        <p>Type : {acc.type === "courant" ? "Compte courant" : "Compte épargne"}</p>
                                        <p>
                                            Solde :{" "}
                                            <span className="font-semibold">
                                                {acc.amount.toLocaleString("fr-FR", {
                                                    style: "currency",
                                                    currency: acc.currency,
                                                })}
                                            </span>
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )
                })
                .exhaustive()}
        </section>
    )
}
const AccountsSkeleton = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="shadow-sm">
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-44" />
                </CardContent>
            </Card>
        ))}
    </div>
)