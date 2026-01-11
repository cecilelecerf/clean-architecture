"use client";

import { memo, useMemo } from "react";

interface FinancialStatCardProps {
    icon: React.ElementType;
    label: string;
    value: number;
    color: "blue" | "green" | "purple" | "orange";
}

export const FinancialStatCard = memo(({ icon: Icon, label, value, color }: FinancialStatCardProps) => {
    const colorClasses = useMemo(() => ({
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10",
        green: "bg-green-50 text-green-600 dark:bg-green-500/10",
        purple: "bg-purple-50 text-purple-600 dark:bg-purple-500/10",
        orange: "bg-orange-50 text-orange-600 dark:bg-orange-500/10",
    }), []);

    const textColorClasses = useMemo(() => ({
        blue: "text-blue-700",
        green: "text-green-700",
        purple: "text-purple-700",
        orange: "text-orange-700",
    }), []);

    const formattedValue = useMemo(() => {
        return value.toLocaleString('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        });
    }, [value]);

    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-500/10 rounded-lg border">
            <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            <p className={`text-xl font-bold ${textColorClasses[color]}`}>
                {formattedValue}
            </p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
        </div>
    );
});

FinancialStatCard.displayName = 'FinancialStatCard';