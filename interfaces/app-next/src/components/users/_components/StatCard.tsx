import { LucideIcon } from "lucide-react";
import clsx from "clsx";

type StatCardProps = {
    label: string;
    value: number | string;
    icon: LucideIcon;
    color: "green" | "purple" | "orange" | "blue";
};

export const StatCard = ({ label, value, icon: Icon, color }: StatCardProps) => {
    return (
        <div
            className={clsx(
                "p-3 md:p-4 rounded-lg",
                {
                    green: "bg-green-50 dark:bg-green-900/20",
                    purple: "bg-purple-50 dark:bg-purple-900/20",
                    orange: "bg-orange-50 dark:bg-orange-900/20",
                    blue: "bg-blue-50 dark:bg-blue-900/20",
                }[color]
            )}
        >
            <div
                className={clsx(
                    "flex items-center gap-2 mb-2",
                    {
                        green: "text-green-600 dark:text-green-300",
                        purple: "text-purple-600 dark:text-purple-300",
                        orange: "text-orange-600 dark:text-orange-300",
                        blue: "text-blue-600 dark:text-blue-300",
                    }[color]
                )}
            >
                <Icon className="h-4 w-4 md:h-5 md:w-5" />
                <p className="text-xs">{label}</p>
            </div>

            <p
                className={clsx(
                    "text-xl md:text-2xl font-bold",
                    {
                        green: "text-green-700 dark:text-green-300",
                        purple: "text-purple-700 dark:text-purple-300",
                        orange: "text-orange-700 dark:text-orange-300",
                        blue: "text-blue-700 dark:text-blue-300",
                    }[color]
                )}
            >
                {value}
            </p>
        </div>
    );
};
