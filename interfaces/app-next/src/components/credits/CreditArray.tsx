import { CreditDTO } from "@infrastructure/types/credit"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { CreditCardMobile } from "./CreditCard"
import { CreditRow } from "./CreditRow"
import { useSession } from "next-auth/react"
type Props = { credits: CreditDTO[], title: string, isAdmin?: boolean, basePath: string }

export const CreditArray = ({ credits, title, isAdmin, basePath }: Props) => {

    const { data: session } = useSession();
    if (!session?.user?.id) return <div>Unauthorized</div>;

    return <>
        {/* Mobile: Cards */}
        <div className="lg:hidden ">
            <h2 className="text-lg font-bold mb-2">{title} ({credits.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {credits.map((credit) => (
                    <CreditCardMobile
                        key={credit.id}
                        credit={credit}
                        userId={session.user.id}
                        basePath={basePath}
                    />
                ))}
            </div>
        </div>

        {/* Desktop: Table */}
        <Card className="hidden lg:block">
            <CardHeader>
                <CardTitle>{title} ({credits.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                    Statut
                                </th>
                                <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                    Montant
                                </th>
                                <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                    Durée
                                </th>
                                <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                    Taux
                                </th>
                                <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                    Mensualité
                                </th>
                                <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                    Date demande
                                </th>
                                <th className="text-right p-4 text-sm font-semibold text-gray-600">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {credits.map((credit) => (
                                <CreditRow
                                    key={credit.id}
                                    credit={credit}
                                    isAdmin={isAdmin}
                                    basePath={basePath}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    </>
}