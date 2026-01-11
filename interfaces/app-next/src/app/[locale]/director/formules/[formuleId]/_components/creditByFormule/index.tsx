
"use client"
import { FormuleId } from "@infrastructure/types/formule";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { match } from "ts-pattern";
import { Calendar, Clock, CreditCardIcon, Euro, User } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { memo, useCallback, useMemo } from "react";
import { CreditDTO } from "@infrastructure/types/credit";
import { StatusBadge } from "./StatusBadge";
import { CreditListSkeleton } from "./CreditListSkeleton";

export const CreditByFormule = memo(({ formuleId }: { formuleId: FormuleId }) => {
    const query = useQuery(endpoints.credits.getAllByFormuleId({ formuleId }));
    const router = useRouter();
    const t = useTranslations("director.credits.formulas");

    const handleBackClick = useCallback(() => {
        router.push('/director/formules');
    }, [router]);

    return match(query)
        .with({ status: "error" }, () => (
            <div className="text-red-500 text-center border border-red-300 p-6 rounded-lg">
                Une erreur est survenue lors du chargement des crédits
            </div>
        ))
        .with({ status: 'pending' }, () => <CreditListSkeleton />)
        .with({ status: "success" }, ({ data: credits }) => {
            if (credits.length === 0) {
                return (
                    <EmptyState onBack={handleBackClick} t={t} />
                );
            }

            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {credits.map((credit) => (
                        <CreditCard key={credit.id} credit={credit} t={t} />
                    ))}
                </div>
            );
        })
        .exhaustive();
});

CreditByFormule.displayName = 'CreditByFormule';

const EmptyState = memo(({
    onBack,
    t
}: {
    onBack: () => void;
    t: ReturnType<typeof useTranslations>
}) => (
    <Card>
        <CardContent className="py-12 text-center">
            <CreditCardIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
                {t("none")}
            </h3>
            <p className="text-muted-foreground mb-6">
                {t("nothingAssociate")}
            </p>
            <Button onClick={onBack}>
                {t("back")}
            </Button>
        </CardContent>
    </Card>
));

EmptyState.displayName = 'EmptyState';


interface CreditCardProps {
    credit: CreditDTO;
    t: ReturnType<typeof useTranslations>;
}

export const CreditCard = memo(({ credit, t }: CreditCardProps) => {
    const formattedValues = useMemo(() => ({
        creditId: credit.id.slice(0, 8),
        initialAmount: credit.initialAmount.amount.toLocaleString('fr-FR'),
        monthlyPayment: credit.monthlyPayment.amount.toLocaleString('fr-FR'),
        remainingBalance: credit.remainingBalance.amount.toLocaleString('fr-FR'),
        startDate: new Date(credit.startDate).toLocaleDateString('fr-FR'),
        advisorId: credit.advisorId?.slice(0, 8)
    }), [credit]);

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold">
                        {t("loan")} #{formattedValues.creditId}
                    </CardTitle>
                    <StatusBadge status={credit.status} t={t} />
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <InfoItem
                        icon={Euro}
                        label={t("info.amount")}
                        value={`${formattedValues.initialAmount}€`}
                    />

                    <InfoItem
                        icon={CreditCardIcon}
                        label={t("info.monthly")}
                        value={`${formattedValues.monthlyPayment}€`}
                    />

                    <InfoItem
                        icon={Clock}
                        label={t("info.duration")}
                        value={`${credit.durationMonths} ${t("info.month")}`}
                    />

                    <InfoItem
                        icon={Euro}
                        label={t("info.balance")}
                        value={`${formattedValues.remainingBalance}€`}
                    />
                </div>

                <div className="pt-3 border-t space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                            {t("info.start")} : {formattedValues.startDate}
                        </span>
                    </div>

                    {credit.advisorId && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>
                                {t("info.advisor")} : {formattedValues.advisorId}
                            </span>
                        </div>
                    )}

                    {credit.reason && (
                        <div className="text-sm text-muted-foreground">
                            <p className="font-medium">{t("info.reason")} :</p>
                            <p className="italic">{credit.reason}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
});

CreditCard.displayName = 'CreditCard';

const InfoItem = memo(({
    icon: Icon,
    label,
    value
}: {
    icon: any;
    label: string;
    value: string;
}) => (
    <div className="flex items-center gap-2 text-sm">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <div>
            <p className="text-muted-foreground">{label}</p>
            <p className="font-semibold">{value}</p>
        </div>
    </div>
));

InfoItem.displayName = 'InfoItem';