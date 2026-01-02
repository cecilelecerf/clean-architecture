import { CreditDTOWithFormuleAndAdvisor } from "@application/dto/CreditDTOMapper"
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { MonthlyRow } from "./MonthlyRow";

type Props = { credits: CreditDTOWithFormuleAndAdvisor[], title: string, isAdmin?: boolean, basePath: string }

export const MonthlyArray = ({ credits, title, isAdmin, basePath }: Props) => {
    const { data: session } = useSession();
    if (!session?.user?.id) return <div>Unauthorized</div>;

    return <>
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
                                    Mois
                                </th>
                                <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                    Date
                                </th>
                                <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                    Mensualité
                                </th>
                                <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                    Statut
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {credits.map((credit) => (
                                <MonthlyRow
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