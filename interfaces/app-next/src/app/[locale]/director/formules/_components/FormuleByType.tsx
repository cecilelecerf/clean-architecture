"use client"
import { Badge } from "@/components/ui/badge";
import { memo } from "react";
import { useTranslations } from "next-intl";
import { FormuleCard } from "./FormuleCard";

interface FormulesByTypeProps {
    availableTypes: Array<{ value: string; label: string }>;
    formulesByType: Record<string, any[]>;
    t: ReturnType<typeof useTranslations>;
}

export const FormulesByType = memo(({
    availableTypes,
    formulesByType,
    t
}: FormulesByTypeProps) => (
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
                        <FormuleCard
                            key={formule.id}
                            formule={formule}
                            t={t}
                        />
                    ))}
                </div>
            </div>
        ))}
    </>
));

FormulesByType.displayName = 'FormulesByType';