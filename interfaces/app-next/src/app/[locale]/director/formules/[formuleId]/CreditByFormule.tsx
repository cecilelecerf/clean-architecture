import { FormuleId } from "@infrastructure/types/formule";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { match } from "ts-pattern";
import { Calendar, Clock, CreditCardIcon, Euro, User } from 'lucide-react';
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditDTO } from "@infrastructure/types/credit";


export const CreditByFormule = ({ formuleId }: { formuleId: FormuleId }) => {
    const query = useQuery(endpoints.credits.getAllByFormuleId({ formuleId }))
    const router = useRouter()

    return match(query)
        .with({ status: "error" }, () => "error")
        .with({ status: 'pending' }, () => <CreditListSkeleton />)
        .with({ status: "success" }, ({ data: credits }) => {
            if (credits.length === 0) {
                return (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <CreditCardIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                Aucun crédit trouvé
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                Cette formule n'a pas encore de crédits associés.
                            </p>
                            <Button onClick={() => router.push('/director/formules')}>
                                Retour aux formules
                            </Button>
                        </CardContent>
                    </Card>
                );
            }

            return (
                < div className="grid grid-cols-1 sm:grid-cols-2 gap-5" >
                    {
                        credits.map((credit) => (
                            <CreditCard key={credit.id} credit={credit} />
                        ))
                    }
                </div >
            );
        })
        .exhaustive()

}

const CreditListSkeleton = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <Card key={i}>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-3">
                    {[...Array(4)].map((_, j) => (
                        <Skeleton key={j} className="h-4 w-full" />
                    ))}
                </CardContent>
            </Card>
        ))}
    </div>
);

const StatusBadge = ({ status }: { status: CreditDTO["status"] }) => {
    const variants = {
        PENDING: { variant: "outline" as const, label: "En attente" },
        ACCEPTED: { variant: "default" as const, label: "Accepté" },
        REFUSED: { variant: "destructive" as const, label: "Refusé" },
        COMPLETED: { variant: "secondary" as const, label: "Terminé" },
    };

    const config = variants[status];

    return (
        <Badge variant={config.variant}>
            {config.label}
        </Badge>
    );
};


const CreditCard = ({ credit }: { credit: CreditDTO }) => (
    <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
            <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-semibold">
                    Crédit #{credit.id.slice(0, 8)}
                </CardTitle>
                <StatusBadge status={credit.status} />
            </div>
        </CardHeader>

        <CardContent className="space-y-4">
            {/* Informations principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                    <Euro className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">Montant initial</p>
                        <p className="font-semibold">
                            {credit.initialAmount.amount.toLocaleString('fr-FR')}€
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">Mensualité</p>
                        <p className="font-semibold">
                            {credit.monthlyPayment.amount.toLocaleString('fr-FR')}€
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">Durée</p>
                        <p className="font-semibold">{credit.durationMonths} mois</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <Euro className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">Solde restant</p>
                        <p className="font-semibold">
                            {credit.remainingBalance.amount.toLocaleString('fr-FR')}€
                        </p>
                    </div>
                </div>
            </div>

            {/* Dates */}
            <div className="pt-3 border-t space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                        Début : {new Date(credit.startDate).toLocaleDateString('fr-FR')}
                    </span>
                </div>

                {credit.advisorId && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Conseiller : {credit.advisorId.slice(0, 8)}</span>
                    </div>
                )}

                {credit.reason && (
                    <div className="text-sm text-muted-foreground">
                        <p className="font-medium">Motif :</p>
                        <p className="italic">{credit.reason}</p>
                    </div>
                )}
            </div>

        </CardContent>
    </Card>
);

