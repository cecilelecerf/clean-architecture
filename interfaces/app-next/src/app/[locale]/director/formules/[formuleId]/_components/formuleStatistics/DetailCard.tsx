"use client";

import { memo, useMemo } from "react";

interface DetailCardProps {
    icon: React.ElementType;
    label: string;
    value: number;
    total: number;
    color: "green" | "red" | "orange";
}

export const DetailCard = memo(({ icon: Icon, label, value, total, color }: DetailCardProps) => {
    const percentage = useMemo(() => {
        return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    }, [value, total]);

    const colorClasses = useMemo(() => ({
        green: "bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:border-green-200/10",
        red: "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:border-red-200/10",
        orange: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:border-orange-200/10",
    }), []);

    const textColorClasses = useMemo(() => ({
        green: "text-green-700",
        red: "text-red-700",
        orange: "text-orange-700",
    }), []);

    return (
        <div className={`p-4 rounded-lg border-2 ${colorClasses[color]}`}>
            <div className="flex items-center justify-between mb-2">
                <Icon className="h-5 w-5" />
                <span className={`text-sm font-semibold ${textColorClasses[color]}`}>
                    {percentage}%
                </span>
            </div>
            <p className={`text-2xl font-bold ${textColorClasses[color]}`}>{value}</p>
            <p className="text-xs opacity-75 mt-1">{label}</p>
        </div>
    );
});

DetailCard.displayName = 'DetailCard';