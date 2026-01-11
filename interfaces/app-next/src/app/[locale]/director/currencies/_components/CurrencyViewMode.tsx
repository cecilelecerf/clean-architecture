"use client";

import { Button } from "@/components/ui/button";
import { CurrencyCode } from "@infrastructure/types/currency";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

interface CurrencyViewModeProps {
    currency: {
        code: CurrencyCode;
        exchangeRate: number;
    };
    onEdit: (code: CurrencyCode, rate: number) => void;
    t: ReturnType<typeof useTranslations>;
}

export const CurrencyViewMode = ({
    currency,
    onEdit,
    t
}: CurrencyViewModeProps) => {
    const formattedRate = useMemo(() => {
        return currency.exchangeRate.toFixed(6);
    }, [currency.exchangeRate]);

    return (
        <div className="space-y-2">
            <div className="text-2xl font-bold">
                {formattedRate}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
                {t("usd")} {formattedRate} {currency.code}
            </p>
            {currency.code !== "USD" && (
                <Button
                    onClick={() => onEdit(currency.code, currency.exchangeRate)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                >
                    {t("update")}
                </Button>
            )}
        </div>
    );
};

CurrencyViewMode.displayName = 'CurrencyViewMode';