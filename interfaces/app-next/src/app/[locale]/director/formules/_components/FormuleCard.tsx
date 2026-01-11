"use client"
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { memo, useCallback } from "react";
import { useTranslations } from "next-intl";

interface FormuleCardProps {
    formule: {
        id: string;
        label: string;
        description: string;
        isActive: boolean;
        interestRate: number;
        insuranceRate: number;
        minAmount?: number;
        maxAmount?: number;
    };
    t: ReturnType<typeof useTranslations>;
}

export const FormuleCard = memo(({ formule, t }: FormuleCardProps) => {
    const router = useRouter();

    const handleClick = useCallback(() => {
        router.push(`/director/formules/${formule.id}`);
    }, [router, formule.id]);

    const handleButtonClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/director/formules/${formule.id}`);
    }, [router, formule.id]);

    return (
        <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={handleClick}
        >
            <CardContent className="p-4 space-y-3">
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

                <p className="text-sm text-muted-foreground line-clamp-2">
                    {formule.description}
                </p>

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

                {formule.minAmount !== undefined &&
                    formule.maxAmount !== undefined && (
                        <div className="text-sm text-muted-foreground pt-2 border-t">
                            {formule.minAmount.toLocaleString('fr-FR')}€ - {formule.maxAmount.toLocaleString('fr-FR')}€
                        </div>
                    )}

                <Button
                    variant="outline"
                    className="w-full"
                    size="sm"
                    onClick={handleButtonClick}
                >
                    {t("details")}
                </Button>
            </CardContent>
        </Card>
    );
});

FormuleCard.displayName = 'FormuleCard';