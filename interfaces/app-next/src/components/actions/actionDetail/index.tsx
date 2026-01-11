"use client";

import { useRouter } from "next/navigation";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { match } from "ts-pattern";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    TrendingUp,
    TrendingDown,
    Pencil,
    ShoppingCart,
} from "lucide-react";
import { Action, ActionId, ActionStats } from "@infrastructure/types/action";
import Link from "next/link";
import { useState, useCallback, useMemo, memo } from "react";
import { ActionBuy } from "./ActionBuy";
import { ActionTabs } from "./ActionTabs";
import { ActionSellContainer } from "./AciontSell";
import { useTranslations } from "next-intl";

interface ActionDetailProps {
    isin: ActionId;
    baseHref: string;
    isAdmin?: boolean;
}

export default function ActionDetail({ isin, baseHref, isAdmin }: ActionDetailProps) {
    const router = useRouter();
    const statsQuery = useQuery(endpoints.actions.getStats({ isin }));
    const actionQuery = useQuery(endpoints.actions.get({ isin }));
    const [open, setOpen] = useState<null | "buy" | "sell">(null);

    const t = useTranslations("director.stocks.details");

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    const toggleBuy = useCallback(() => {
        setOpen((prev) => prev === "buy" ? null : "buy");
    }, []);

    const toggleSell = useCallback(() => {
        setOpen((prev) => prev === "sell" ? null : "sell");
    }, []);

    const closeBuy = useCallback(() => setOpen(null), []);
    const closeSell = useCallback(() => setOpen(null), []);

    return (
        <div className="space-y-4 pb-20 md:pb-8">
            <ActionHeader onBack={handleBack} t={t} />

            <div className="space-y-4">
                {match(actionQuery)
                    .with({ status: "pending" }, () => <ActionDetailsSkeleton />)
                    .with({ status: "error" }, () => (
                        <ErrorState message={t("notfound")} />
                    ))
                    .with({ status: "success" }, ({ data: action }) => (
                        <>
                            <ActionInfoCard
                                action={action}
                                statsQuery={statsQuery}
                                isAdmin={isAdmin}
                                baseHref={baseHref}
                                onBuy={toggleBuy}
                                onSell={toggleSell}
                                t={t}
                            />

                            {!isAdmin && action.isAvailable && open === "buy" && (
                                <ActionBuy action={action} buyOpen={open === "buy"} closeBuy={closeBuy} />
                            )}

                            {!isAdmin && open === "sell" && (
                                <ActionSellContainer action={action} sellOpen={open === 'sell'} closeSell={closeSell} />
                            )}

                            <ActionTabs action={action} isAdmin={isAdmin} />
                        </>
                    ))
                    .exhaustive()}
            </div>
        </div>
    );
}

const ActionHeader = memo(({ onBack, t }: { onBack: () => void; t: ReturnType<typeof useTranslations> }) => (
    <div className="flex items-center justify-between sticky top-0 py-2 z-10 border-b md:border-none">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold md:hidden">{t("title")}</h1>
        <div className="w-10 md:hidden" />
    </div>
));

ActionHeader.displayName = 'ActionHeader';


type ActionInfoCardProps = {
    action: Action,
    t: ReturnType<typeof useTranslations>,
    onSell: () => void,
    onBuy: () => void,
    isAdmin?: boolean,
    baseHref: string,
    statsQuery: UseQueryResult<ActionStats>
}
const ActionInfoCard = memo(({
    action,
    statsQuery,
    isAdmin,
    baseHref,
    onBuy,
    onSell,
    t
}: ActionInfoCardProps) => {
    const priceChange = useMemo(() => {
        if (statsQuery.status !== "success") return null;
        const change = statsQuery.data.priceChange24h;
        return {
            value: change,
            isPositive: change >= 0,
            formatted: `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`
        };
    }, [statsQuery.status, statsQuery.data]);

    return (
        <Card className="overflow-hidden p-0">
            <div className="bg-linear-to-br from-blue-600 to-indigo-700 p-6 text-white">
                <div className="space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="w-full flex justify-between">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h2 className="text-2xl md:text-3xl font-bold">
                                        {action.symbol}
                                    </h2>
                                    {action.isAvailable ? (
                                        <Badge className="bg-green-500 hover:bg-green-600 text-xs">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            {t("available")}
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-red-500 hover:bg-red-600 text-xs">
                                            <XCircle className="w-3 h-3 mr-1" />
                                            {t("unavailable")}
                                        </Badge>
                                    )}
                                </div>
                                {isAdmin && (
                                    <Link href={`${baseHref}/actions/${action.ISIN}/edit`}>
                                        <Button variant="ghost" size="icon">
                                            <Pencil />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                            <p className="text-white/90 text-sm md:text-base">{action.name}</p>
                            <p className="text-white/60 text-xs mt-1">ISIN: {action.ISIN}</p>
                        </div>
                        {!isAdmin && (
                            <div className="flex flex-col gap-3">
                                <Button
                                    className="bg-indigo-800/50 hover:bg-indigo-900/50 dark:text-white transition shadow"
                                    onClick={onBuy}
                                >
                                    <ShoppingCart className="w-5 h-5" /> {t("buy")}
                                </Button>
                                <Button
                                    className="bg-indigo-800/50 hover:bg-indigo-900/50 transition shadow dark:text-white"
                                    onClick={onSell}
                                >
                                    <ShoppingCart className="w-5 h-5" /> {t("sell")}
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <p className="text-white/70 text-xs mb-1">{t("current")}</p>
                        <div className="flex items-baseline gap-3 flex-wrap">
                            <p className="text-3xl md:text-4xl font-bold">
                                {action.price.amount}
                            </p>
                            <p className="text-white/90 text-sm">
                                {action.price.currency}
                            </p>
                            {priceChange && (
                                <div className={`flex items-center gap-1 text-sm font-semibold ${priceChange.isPositive ? "text-green-300" : "text-red-300"
                                    }`}>
                                    {priceChange.isPositive ? (
                                        <TrendingUp className="w-4 h-4" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4" />
                                    )}
                                    {priceChange.formatted}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
});

ActionInfoCard.displayName = 'ActionInfoCard';

const ErrorState = memo(({ message }: { message: string }) => (
    <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
        <CardContent className="p-4">
            <p className="text-sm text-red-600 dark:text-red-400 font-semibold">
                {message}
            </p>
        </CardContent>
    </Card>
));

ErrorState.displayName = 'ErrorState';

function ActionDetailsSkeleton() {
    return (
        <div className="space-y-4">
            <Card>
                <CardContent className="p-6">
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-4 w-48 mb-4" />
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
            <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-64" />
        </div>
    );
}