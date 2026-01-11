"use client";

import { endpoints } from "@/utils/endpoint";
import { useQueries } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Percent,
} from "lucide-react";
import { match } from "ts-pattern";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export default function ClientFormulesPage() {
    const queries = useQueries({
        queries: [
            endpoints.formules.getAllActive(),
            endpoints.formules.getTypes()
        ]
    }); 
    const router = useRouter();

    const t = useTranslations("client.formulas");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
                <p className="text-gray-500">{t("description")}</p>
            </div>

            {
                match(queries)
                    .when(
                        (queries) => queries.some((q) => q.status === "error"),
                        () => "errors"
                    )
                    .when(
                        (queries) => queries.every((q) => q.status === "success"),
                        ([{ data: formules }, { data: types }],) => {

                            if (formules.length === 0) {
                                return (
                                    <Card>
                                        <CardContent className="py-12 text-center">
                                            <Percent className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                            <p className="text-lg font-medium mb-2">
                                                {t("none")}
                                            </p>
                                        </CardContent>
                                    </Card>
                                );
                            }

                            const formulesByType = formules.reduce(
                                (acc: Record<string, typeof formules>, formule) => {
                                    if (!acc[formule.type]) acc[formule.type] = [];
                                    acc[formule.type].push(formule);
                                    return acc;
                                },
                                {}
                            );


                            const typeOrder = ["CONSOMMATION", "PROFESSIONNEL", "IMMOBILIER", "AUTO", "AUTRE"];

                            const availableTypes = types
                                .filter((type) => formulesByType[type.value]?.length > 0)
                                .sort((a, b) => {
                                    const indexA = typeOrder.indexOf(a.value);
                                    const indexB = typeOrder.indexOf(b.value);

                                    if (indexA !== -1 && indexB !== -1) {
                                        return indexA - indexB;
                                    }

                                    if (indexA !== -1) return -1;
                                    if (indexB !== -1) return 1;

                                    return a.label.localeCompare(b.label);
                                });
                            return (
                                <>

                                    {availableTypes.map((type) => (
                                        <div key={type.value} className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-xl font-bold">{type.label}</h2>
                                                <Badge variant="outline">
                                                    {formulesByType[type.value].length} {t("formula")}
                                                    {formulesByType[type.value].length > 1 ? "s" : ""}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {formulesByType[type.value].map((formule) => (
                                                    <Card
                                                        key={formule.id}
                                                        className="hover:shadow-md transition-shadow cursor-pointer"
                                                        onClick={() => router.push(`/credits/formules/${formule.id}`)}
                                                    >
                                                        <CardContent className="p-4 space-y-3">
                                                            {/* En-tête */}
                                                            <div className="flex items-start justify-between gap-2">
                                                                <h3 className="font-semibold text-lg line-clamp-1 flex-1">
                                                                    {formule.label}
                                                                </h3>
                                                                <Badge
                                                                    variant={formule.isActive ? "default" : "secondary"}
                                                                    className="shrink-0"
                                                                >
                                                                    {formule.isActive ? t("active") : t("inactive")}
                                                                </Badge>
                                                            </div>

                                                            {/* Description */}
                                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                                {formule.description}
                                                            </p>

                                                            {/* Taux */}
                                                            <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
                                                                <div className="space-y-1">
                                                                    <p className="text-xs text-muted-foreground">{t("interest")}</p>
                                                                    <p className="font-semibold">{formule.interestRate}%</p>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-xs text-muted-foreground">{t("insurance")}</p>
                                                                    <p className="font-semibold">{formule.insuranceRate}%</p>
                                                                </div>
                                                            </div>

                                                            {/* Montants */}
                                                            {formule.minAmount !== undefined &&
                                                                formule.maxAmount !== undefined && (
                                                                    <div className="text-sm text-muted-foreground pt-2 border-t">
                                                                        {formule.minAmount.toLocaleString('fr-FR')}€ - {formule.maxAmount.toLocaleString('fr-FR')}€
                                                                    </div>
                                                                )}

                                                            {/* Bouton */}
                                                            <Button
                                                                variant="outline"
                                                                className="w-full"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    router.push(`/credits/formules/${formule.id}`);
                                                                }}
                                                            >
                                                                {t("details")}
                                                            </Button>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            );
                        }
                    )
                    .otherwise(() => <FormuleSkeleton />
                    )
            }
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