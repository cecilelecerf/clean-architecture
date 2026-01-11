import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { FormuleCard } from "./FormuleCard";
import { FormuleDTO } from "@infrastructure/types/formule";

interface FormulesByTypeProps {
    availableTypes: Array<{ value: string; label: string }>;
    formulesByType: Record<string, FormuleDTO[]>;
    t: ReturnType<typeof useTranslations>;
}

export const FormulesByType = ({
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
);