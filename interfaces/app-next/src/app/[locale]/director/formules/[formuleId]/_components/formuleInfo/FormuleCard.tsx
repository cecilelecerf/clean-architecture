"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Euro, Pencil, Percent } from 'lucide-react';
import { useTranslations } from "next-intl";
import { memo, useMemo } from "react";
import { FormuleDetailRow } from "./FormuleDetailRow";

type FormuleDetail = {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
};

interface FormuleCardProps {
    formule: {
        id: string;
        label: string;
        type: string;
        description: string;
        interestRate: number;
        insuranceRate: number;
        minAmount?: number;
        maxAmount?: number;
        isActive: boolean;
        createdAt: string;
    };
    onUpdate: () => void;
    t: ReturnType<typeof useTranslations>;
}

export const FormuleCard = memo(({ formule, onUpdate, t }: FormuleCardProps) => {
    const details = useMemo<FormuleDetail[]>(() => {
        const baseDetails: FormuleDetail[] = [
            {
                label: t("type"),
                value: formule.type
            },
            {
                label: t("description"),
                value: formule.description
            },
            {
                label: t("interestRate"),
                value: `${formule.interestRate}%`,
                icon: <Percent className="h-4 w-4 text-muted-foreground" />
            },
            {
                label: t("insuranceRate"),
                value: `${formule.insuranceRate}%`,
                icon: <Percent className="h-4 w-4 text-muted-foreground" />
            },
        ];

        if (formule.minAmount !== undefined && formule.maxAmount !== undefined) {
            baseDetails.push({
                label: t("amount"),
                value: `${formule.minAmount.toLocaleString('fr-FR')}€ - ${formule.maxAmount.toLocaleString('fr-FR')}€`,
                icon: <Euro className="h-4 w-4 text-muted-foreground" />
            });
        }

        return baseDetails;
    }, [formule, t]);

    const formattedDate = useMemo(() => {
        return new Date(formule.createdAt).toLocaleDateString('fr-FR');
    }, [formule.createdAt]);

    return (
        <div className="p-2 space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold">
                                {formule.label}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {t("createdAt")} {formattedDate}
                            </p>
                        </div>
                        <Badge
                            variant={formule.isActive ? "default" : "secondary"}
                            className="shrink-0"
                        >
                            {formule.isActive ? t("active") : t("inactive")}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="grid gap-3">
                        {details.map((detail) => (
                            <FormuleDetailRow
                                key={detail.label}
                                label={detail.label}
                                value={detail.value}
                                icon={detail.icon}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button onClick={onUpdate}>
                    <Pencil size={16} className="mr-2" />
                    {t("update")}
                </Button>
            </div>
        </div>
    );
});

FormuleCard.displayName = 'FormuleCard';