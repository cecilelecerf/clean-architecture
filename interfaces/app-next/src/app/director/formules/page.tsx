"use client"
import { TitleAdminPage } from "@/components/TitleAdminPage";
import { Skeleton } from "@/components/ui/skeleton";
import { endpoints } from "@/utils/endpoint";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQueries } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { match } from "ts-pattern";
import Link from "next/link";
import { Plus, Percent } from "lucide-react";

export default function FormulesPage() {
    const router = useRouter();

    const queries = useQueries({
        queries: [
            endpoints.formules.getAll(),
            endpoints.formules.getTypes()
        ]
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <TitleAdminPage title="Formules de prêt" />
                <Link href="/director/formules/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Créer une nouvelle formule
                    </Button>
                </Link>
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
                                                Aucune formule disponible
                                            </p>
                                            <p className="text-sm text-muted-foreground mb-6">
                                                Créez votre première formule de prêt
                                            </p>
                                            <Link href="/director/formules/new">
                                                <Button>
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Créer une formule
                                                </Button>
                                            </Link>
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
                                <div className="space-y-8">
                                    {/* Statistiques */}
                                    <Card>
                                        <CardContent className="py-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Total des formules
                                                    </p>
                                                    <p className="text-2xl font-bold">{formules.length}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Badge variant="outline">
                                                        {formules.filter((f) => f.isActive).length} actives
                                                    </Badge>
                                                    <Badge variant="secondary">
                                                        {formules.filter((f) => !f.isActive).length} inactives
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Formules par type */}
                                    {availableTypes.map((type) => (
                                        <div key={type.value} className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-xl font-bold">{type.label}</h2>
                                                <Badge variant="outline">
                                                    {formulesByType[type.value].length} formule
                                                    {formulesByType[type.value].length > 1 ? "s" : ""}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {formulesByType[type.value].map((formule) => (
                                                    <Card
                                                        key={formule.id}
                                                        className="hover:shadow-md transition-shadow cursor-pointer"
                                                        onClick={() => router.push(`/director/formules/${formule.id}`)}
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
                                                                    {formule.isActive ? "Active" : "Inactive"}
                                                                </Badge>
                                                            </div>

                                                            {/* Description */}
                                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                                {formule.description}
                                                            </p>

                                                            {/* Taux */}
                                                            <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
                                                                <div className="space-y-1">
                                                                    <p className="text-xs text-muted-foreground">Intérêt</p>
                                                                    <p className="font-semibold">{formule.interestRate}%</p>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-xs text-muted-foreground">Assurance</p>
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
                                                                    router.push(`/director/formules/${formule.id}`);
                                                                }}
                                                            >
                                                                Voir détails
                                                            </Button>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        }
                    )
                    .otherwise(() => <FormuleSkeleton />
                    )
            }
        </div>
    );
}

const FormuleSkeleton = () => (
    <div className="space-y-8">
        {/* Skeleton stats */}
        <Card>
            <CardContent className="py-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Skeleton sections */}
        {[1, 2].map((section) => (
            <div key={section} className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Card key={index}>
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-5 w-16" />
                                </div>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    <Skeleton className="h-12" />
                                    <Skeleton className="h-12" />
                                </div>
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-9 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        ))}
    </div>
);