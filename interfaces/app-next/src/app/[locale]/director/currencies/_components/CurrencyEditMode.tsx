"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { memo } from "react";

interface CurrencyEditModeProps {
    newRate: string;
    onRateChange: (value: string) => void;
    onSave: () => void;
    onCancel: () => void;
    isPending: boolean;
    t: ReturnType<typeof useTranslations>;
}

export const CurrencyEditMode = ({
    newRate,
    onRateChange,
    onSave,
    onCancel,
    isPending,
    t
}: CurrencyEditModeProps) => {
    return (
        <div className="space-y-2">
            <Input
                type="number"
                step="0.000001"
                value={newRate}
                onChange={(e) => onRateChange(e.target.value)}
                placeholder={t("new")}
                disabled={isPending}
            />
            <div className="flex gap-2">
                <Button
                    onClick={onSave}
                    size="sm"
                    className="flex-1"
                    disabled={isPending}
                >
                    {isPending ? t("saving") : t("save")}
                </Button>
                <Button
                    onClick={onCancel}
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                >
                    {t("cancel")}
                </Button>
            </div>
        </div>
    );
};

CurrencyEditMode.displayName = 'CurrencyEditMode';