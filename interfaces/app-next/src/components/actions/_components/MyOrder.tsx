import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { endpoints } from "@/utils/endpoint";
import { Action } from "@infrastructure/types/action";
import { useQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp } from "lucide-react";
import { match } from "ts-pattern";
import { PendingOrderCard } from "./PendingOrderCard";
import React from "react";
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

                        const profitLoss = position.currentValue - position.totalInvested;
                        const profitLossPercent = (profitLoss / position.totalInvested) * 100;

                        return (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t("held")}</p>
                                        <p className="text-2xl font-bold">{position.quantity}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t("averagePrice")}</p>
                                        <p className="text-2xl font-bold">{position.averagePrice}€</p>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t("invest")}</p>
                                            <p className="text-lg font-semibold">{position.totalInvested}€</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t("actualValue")}</p>
                                            <p className="text-lg font-semibold">{position.currentValue}€</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <p className="text-sm text-muted-foreground mb-2">{t("value")}</p>
                                    <div className={`flex items-center gap-2 ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {profitLoss >= 0 ? <TrendingUp /> : <TrendingDown />}
                                        <span className="text-3xl font-bold">
                                            {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)}€
                                        </span>
                                        <Badge variant={profitLoss >= 0 ? 'default' : 'destructive'}>
                                            {profitLossPercent >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%
                                        </Badge>
                                    </div>
                                </div>
                            </>
                        );
                    })
                    .otherwise(() => <Skeleton className="h-64" />)}
                {match(orderQuery)
                    .with({ status: "success" }, ({ data: orders }) => {
                        if (orders.length === 0) return <>{t("noneWaiting")}</>
                        return (
                            <>
                                <h1 className=" mt-16 font-semibold text-2xl text-gray-900">{t("waiting")}</h1>
                                <div className="space-y-6">
                                    {orders.map((order, i) =>
                                        <React.Fragment key={i} >
                                            <PendingOrderCard order={order} />
                                        </React.Fragment>
                                    )}</div>
                            </>)
                    })
                    .otherwise(() => <Skeleton className="h-64" />)}
            </CardContent>
        </Card>
    )
}