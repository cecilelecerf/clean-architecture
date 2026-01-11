"use client";

import { memo, useMemo } from "react";

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: number | string;
    color: "blue" | "green" | "purple" | "orange";
}

export const StatCard = memo(({ icon: Icon, label, value, color }: StatCardProps) => {
    const colorClasses = useMemo(() => ({
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-50/10",
        green: "bg-green-50 text-green-600 dark:bg-green-50/10",
        purple: "bg-purple-50 text-purple-600 dark:bg-purple-50/10",
        orange: "bg-orange-50 text-orange-600 dark:bg-orange-50/10",
    }), []);

    const textColorClasses = useMemo(() => ({
        blue: "text-blue-700",
        green: "text-green-700",
        purple: "text-purple-700",
        orange: "text-orange-700",
    }), []);

    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-500/10 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            <p className={`text-2xl font-bold ${textColorClasses[color]}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
        </div>
    );
});

StatCard.displayName = 'StatCard';