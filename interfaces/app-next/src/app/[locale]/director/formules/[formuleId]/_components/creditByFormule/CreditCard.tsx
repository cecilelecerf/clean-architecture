import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, CreditCardIcon, Euro, User } from 'lucide-react';
import { useTranslations } from "next-intl";
import { CreditDTO } from "@infrastructure/types/credit";
import { StatusBadge } from "./StatusBadge";

interface CreditCardProps {
    credit: CreditDTO;
    t: ReturnType<typeof useTranslations>;
}
export const CreditCard = ({ credit, t }: CreditCardProps) => {
    const formattedValues = {
        creditId: credit.id.slice(0, 8),
        initialAmount: credit.initialAmount.amount.toLocaleString('fr-FR'),
        monthlyPayment: credit.monthlyPayment.amount.toLocaleString('fr-FR'),
        remainingBalance: credit.remainingBalance.amount.toLocaleString('fr-FR'),
        startDate: new Date(credit.startDate).toLocaleDateString('fr-FR'),
        advisorId: credit.advisorId?.slice(0, 8)
    };

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
};


const InfoItem = ({
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
)
