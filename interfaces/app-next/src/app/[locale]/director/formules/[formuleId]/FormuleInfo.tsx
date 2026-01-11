import { FormuleId } from "@infrastructure/types/formule";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { match } from "ts-pattern";
import { Euro, Pencil, Percent } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
type FormuleDetail = {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
};

export const FormuleInfo = ({ formuleId }: { formuleId: FormuleId }) => {
    const query = useQuery(endpoints.formules.get({ formuleId: formuleId }))
    const router = useRouter();
    const t = useTranslations("director.credits.info");

    return match(query)
        .with({ status: "error" }, () => "error")
        .with({ status: 'pending' }, () => "pendign")
        .with({ status: "success" }, ({ data: formule }) => {
            const details: FormuleDetail[] = [
                { label: t("type"), value: formule.type },
                { label: t("description"), value: formule.description },
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
                details.push({
                    label: t("amount"),
                    value: `${formule.minAmount.toLocaleString('fr-FR')}€ - ${formule.maxAmount.toLocaleString('fr-FR')}€`,
                    icon: <Euro className="h-4 w-4 text-muted-foreground" />
                });
            }
            return (<div className="p-2 space-y-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl font-bold">
                                    {formule.label}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {t("createdAt")} {new Date(formule.createdAt).toLocaleDateString('fr-FR')}
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
                                <div
                                    key={detail.label}
                                    className="flex items-start justify-between py-2 border-b last:border-0"
                                >
                                    <div className="flex items-center gap-2">
                                        {detail.icon}
                                        <span className="text-sm font-medium text-muted-foreground">
                                            {detail.label}
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold text-right">
                                        {detail.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                    <Button
                        onClick={() => router.push(`/director/formules/${formule.id}/update`)}
                    >
                        <Pencil size={16} className="mr-2" />
                        {t("update")}
                    </Button>
                </div>
            </div>
            )
        })
        .exhaustive()

}