"use client";

import { endpoints } from "@/utils/endpoint";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AlertCircle
} from "lucide-react";
import { match } from "ts-pattern";

export default function ClientFormulesPage() {
    const query = useQuery(endpoints.formules.getAllActive());
    const router = useRouter();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Les formules de prêts</h1>
                <p className="text-gray-500">Retrouvez toutes les formules de prêts que nous vous proposons</p>
            </div>

            {match(query)
                .with({ status: "error" }, () => "error")
                .with({ status: "pending" }, () => <FormuleSkeleton />)
                .with({ status: "success" }, ({ data: formules }) => {
                    if (formules.length === 0) {
                        return (
                            <Card className="text-center p-12">
                                <CardContent className="space-y-4">
                                    <AlertCircle className="w-16 h-16 mx-auto text-gray-400" />
                                    <div>
                                        <h3 className="text-lg font-semibold">Aucune formule</h3>
                                        <p className="text-gray-500 mt-2">
                                            Aucune formule de prêt disponible
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    }

                    const formulesByType = formules.reduce((acc: Record<string, typeof formules>, formule) => {
                        if (!acc[formule.type]) acc[formule.type] = [];
                        acc[formule.type].push(formule);
                        return acc;
                    }, {});

                    const sortedTypes = Object.keys(formulesByType).sort();
                    return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>
                })
                .exhaustive()}
        </div>
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