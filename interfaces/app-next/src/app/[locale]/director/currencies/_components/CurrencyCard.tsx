"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Currency, CurrencyCode } from "@infrastructure/types/currency";
import { useTranslations } from "next-intl";
import { CurrencyEditMode } from "./CurrencyEditMode";
import { CurrencyViewMode } from "./CurrencyViewMode";

interface CurrencyCardProps {
    currency: Currency
    isEditing: boolean;
    newRate: string;
    onRateChange: (value: string) => void;
    onEdit: (code: CurrencyCode, rate: number) => void;
    onSave: () => void;
    onCancel: () => void;
    isPending: boolean;
    t: ReturnType<typeof useTranslations>;
}

export const CurrencyCard = ({
    currency,
    isEditing,
    newRate,
    onRateChange,
    onEdit,
    onSave,
    onCancel,
    isPending,
    t
}: CurrencyCardProps) => {
    return (
        <Card className="justify-between">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{currency.symbol}</span>
                        <div>
                            <CardTitle className="text-lg">{currency.code}</CardTitle>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {currency.name}
                            </p>
                        </div>
                    </div>
                    {currency.code === "USD" && (
                        <Badge variant="secondary">{t("ref")}</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <CurrencyEditMode
                        newRate={newRate}
                        onRateChange={onRateChange}
                        onSave={onSave}
                        onCancel={onCancel}
                        isPending={isPending}
                        t={t}
                    />
                ) : (
                    <CurrencyViewMode
                        currency={currency}
                        onEdit={onEdit}
                        t={t}
                    />
                )}
            </CardContent>
        </Card>
    );
};

CurrencyCard.displayName = 'CurrencyCard';