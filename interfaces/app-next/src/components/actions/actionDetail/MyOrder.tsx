import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { endpoints } from "@/utils/endpoint";
import { Action } from "@infrastructure/types/action";
import { useQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp } from "lucide-react";
import { match } from "ts-pattern";
import { PendingOrderCard } from "./PendingOrderCard";
import React, { memo, useMemo } from "react";
import { useTranslations } from "next-intl";

export function MyOrders({ action }: { action: Action }) {
    const positionsQuery = useQuery(
        endpoints.orders.actions.portfolio({ ISIN: action.ISIN })
    );

    const orderQuery = useQuery(
        endpoints.orders.actions.getAllMeByAction({ ISIN: action.ISIN, status: "pending" })
    );

    const t = useTranslations("director.stocks.details.mine");

    return (
        <Card>
            <CardContent className="p-6 space-y-4">
                {match(positionsQuery)
                    .with({ status: "success" }, ({ data: position }) => {
                        if (!position) {
                            return (
                                <Card>
                                    <CardContent className="p-6 text-center text-muted-foreground">
                                        {t("none")} {action.symbol}
                                    </CardContent>
                                </Card>
                            );
                        }
                        return <PositionDetails position={position} t={t} />
                    })
                    .otherwise(() => <Skeleton className="h-64" />)}
                {match(orderQuery)
                    .with({ status: "success" }, ({ data: orders }) => {
                        if (orders.length === 0) return <>{t("noneWaiting")}</>
                        return <PendingOrdersList orders={orders} t={t} />
                    })
                    .otherwise(() => <Skeleton className="h-64" />)}
            </CardContent>
        </Card>
    )
}


const PositionDetails = memo(({
    position,
    t
}: {
    position: any;
    t: any;
}) => {
    const profitLossData = useMemo(() => {
        const profitLoss = position.currentValue - position.totalInvested;
        const profitLossPercent = (profitLoss / position.totalInvested) * 100;
        const isPositive = profitLoss >= 0;

        return {
            profitLoss,
            profitLossPercent,
            isPositive,
            formattedProfitLoss: `${isPositive ? '+' : ''}${profitLoss.toFixed(2)}€`,
            formattedPercent: `${profitLossPercent >= 0 ? '+' : ''}${profitLossPercent.toFixed(2)}%`
        };
    }, [position.currentValue, position.totalInvested]);

    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <StatItem label={t("held")} value={position.quantity} />
                <StatItem
                    label={t("averagePrice")}
                    value={`${position.averagePrice}€`}
                />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="grid grid-cols-2 gap-4">
                    <StatItem
                        label={t("invest")}
                        value={`${position.totalInvested}€`}
                        size="medium"
                    />
                    <StatItem
                        label={t("actualValue")}
                        value={`${position.currentValue}€`}
                        size="medium"
                    />
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm text-muted-foreground mb-2">{t("value")}</p>
                <div className={`flex items-center gap-2 ${profitLossData.isPositive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                    }`}>
                    {profitLossData.isPositive ? (
                        <TrendingUp className="w-7 h-7" />
                    ) : (
                        <TrendingDown className="w-7 h-7" />
                    )}
                    <span className="text-3xl font-bold">
                        {profitLossData.formattedProfitLoss}
                    </span>
                    <Badge variant={profitLossData.isPositive ? 'default' : 'destructive'}>
                        {profitLossData.formattedPercent}
                    </Badge>
                </div>
            </div>
        </>
    );
});

PositionDetails.displayName = 'PositionDetails';



const StatItem = memo(({
    label,
    value,
    size = "large"
}: {
    label: string;
    value: string | number;
    size?: "large" | "medium";
}) => (
    <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`font-bold ${size === "large" ? "text-2xl" : "text-lg"}`}>
            {value}
        </p>
    </div>
));

StatItem.displayName = 'StatItem';

const PendingOrdersList = memo(({
    orders,
    t
}: {
    orders: any[];
    t: any;
}) => (
    <>
        <h2 className="mt-16 font-semibold text-2xl text-gray-900 dark:text-gray-100">
            {t("waiting")}
        </h2>
        <div className="space-y-6">
            {orders.map((order) => (
                <PendingOrderCard key={order.id} order={order} />
            ))}
        </div>
    </>
));

PendingOrdersList.displayName = 'PendingOrdersList';