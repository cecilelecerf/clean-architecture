"use client"
import { TitleAdminPage } from "@/components/TitleAdminPage";
import { Skeleton } from "@/components/ui/skeleton";
import { endpoints } from "@/utils/endpoint";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { match } from "ts-pattern";
import Link from "next/link"
import { Plus } from "lucide-react"

export default function FormulesPage() {
    const query = useQuery(endpoints.formules.getAll())
    const router = useRouter()

    return (
        <>
            <TitleAdminPage title="Formules de prêt" />
            <Link href="/director/formules/new">
                <Button >
                    <Plus className="w-4 h-4 mr-2" />
                        Créer une nouvelle formule
                </Button>
            </Link>
            {match(query)
                .with({ status: "error" }, () => "error")
                .with({ status: "pending" }, () => <FormuleSkeleton />)
                .with({ status: "success" }, ({ data: formules }) => {
                    if (formules.length === 0) 
                    return 
                        <div className="text-gray-500 text-center border p-6 rounded-lg">
                            Aucune formules pour le moment.
                        </div>

                    const formulesByType = formules.reduce((acc: Record<string, typeof formules>, formule) => {
                        if (!acc[formule.type]) acc[formule.type] = [];
                        acc[formule.type].push(formule);
                        return acc;
                    }, {});

                    const sortedTypes = Object.keys(formulesByType).sort();
                    return <>
                        {sortedTypes.map((type) => (
                            <div key={type}>
                            <h2 className="text-xl font-bold my-4">{type}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {formulesByType[type].map((formule) => (
                                <Card key={formule.id} className="flex items-center gap-4 p-4">
                                    <div className="flex-1">
                                    <p className="font-semibold text-center">{formule.label}</p>
                                    <p className="text-sm text-center text-gray-500">{formule.interestRate}%</p>
                                    </div>
                                    <div>
                                    <Button onClick={() => router.push(`formules/${formule.id}`)}>
                                        + d&apos;info
                                    </Button>
                                    </div>
                                </Card>
                                ))}
                            </div>
                            </div>
                        ))}
                    </>

                }
                ).exhaustive()
            }
        </>
    )
}

const FormuleSkeleton = () => (
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