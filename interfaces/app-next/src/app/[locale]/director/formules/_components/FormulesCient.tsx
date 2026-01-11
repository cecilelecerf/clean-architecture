"use client"
import { TitleAdminPage } from "@/components/TitleAdminPage";
import { endpoints } from "@/utils/endpoint";
import { Button } from "@/components/ui/button";
import { useQueries } from "@tanstack/react-query";
import { match } from "ts-pattern";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { FormulesStats } from "./FormuleStats";
import { EmptyState } from "./EmptyState";
import { FormulesByType } from "./FormuleByType";
import { FormulesSkeleton } from "./FormuleSkeleton";

export function FormulesClient() {
    const queries = useQueries({
        queries: [
            endpoints.formules.getAll(),
            endpoints.formules.getTypes()
        ]
    });

    const t = useTranslations("director.credits");

    const { formulesByType, availableTypes, stats } = useMemo(() => {
        if (queries[0].status !== "success" || queries[1].status !== "success") {
            return { formulesByType: {}, availableTypes: [], stats: null };
        }

        const formules = queries[0].data;
        const types = queries[1].data;

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

        const stats = {
            total: formules.length,
            active: formules.filter((f) => f.isActive).length,
            inactive: formules.filter((f) => !f.isActive).length,
        };

        return { formulesByType, availableTypes, stats };
    }, [queries]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <TitleAdminPage title="Formules de prêt" />
                <Link href="/director/formules/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        {t("new")}
                    </Button>
                </Link>
            </div>

            {match(queries)
                .when(
                    (queries) => queries.some((q) => q.status === "error"),
                    () => (
                        <div className="text-red-500 text-center border border-red-300 p-6 rounded-lg">
                            Une erreur est survenue lors du chargement des formules
                        </div>
                    )
                )
                .when(
                    (queries) => queries.every((q) => q.status === "success"),
                    () => {
                        if (queries[0].data.length === 0) {
                            return <EmptyState t={t} />;
                        }

                        return (
                            <div className="space-y-8">
                                <FormulesStats stats={stats!} t={t} />
                                <FormulesByType
                                    availableTypes={availableTypes}
                                    formulesByType={formulesByType}
                                    t={t}
                                />
                            </div>
                        );
                    }
                )
                .otherwise(() => <FormulesSkeleton />)
            }
        </div>
    );
}