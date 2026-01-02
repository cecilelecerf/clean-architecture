import { FormuleId } from "@infrastructure/types/formule";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { match } from "ts-pattern";
import { Pencil } from 'lucide-react';
import { useRouter } from "next/navigation";
import { TitleAdminPage } from "@/components/TitleAdminPage";

export const FormuleInfo = ({ formuleId }: { formuleId: FormuleId }) => {
    const query = useQuery(endpoints.formules.get({ formuleId: formuleId }))
    const router = useRouter()

    return match(query)
        .with({ status: "error" }, () => "error")
        .with({ status: 'pending' }, () => "pendign")
        .with({ status: "success" }, ({ data: formule }) => (
            <>
                <TitleAdminPage title="Formules de prêt" />

                <div className="p-2 space-y-4">
                    {/* Card principale avec titre et statut */}
                    <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                        <span className="text-lg font-bold">{formule.label}</span>
                        <Badge variant={formule.isActive ? "default" : "secondary"}>
                            {formule.isActive ? "Actif" : "Inactif"}
                        </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-gray-700">
                        <p><strong>Type :</strong> {formule.type}</p>
                        <p><strong>Description :</strong> {formule.description}</p>
                        <p><strong>Taux d'intérêt :</strong> {formule.interestRate}%</p>
                        <p><strong>Taux d'assurance :</strong> {formule.insuranceRate}%</p>
                        {formule.minAmount !== undefined && formule.maxAmount !== undefined && (
                        <p><strong>Montant :</strong> {formule.minAmount}€ - {formule.maxAmount}€</p>
                        )}
                    </CardContent>
                    </Card>

                    {/* Bouton pour modifier */}
                    <div className="flex justify-end">
                    <Button onClick={() => router.push(`/director/formules/${formule.id}/update`)}>
                        <Pencil size={16} className="mr-2" /> Modifier la formule de prêt
                    </Button>
                    </div>
                </div>
            </>
    ))
    .exhaustive();
}