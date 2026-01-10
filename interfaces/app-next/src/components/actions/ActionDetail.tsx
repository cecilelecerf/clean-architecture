"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { match } from "ts-pattern";
import { Button } from "@/components/ui/button";
import { Card, CardContent, } from "@/components/ui/card";
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
import { ActionId } from "@infrastructure/types/action";
import Link from "next/link";
import { useState } from "react";
import { ActionBuy } from "./_components/ActionBuy";
import { ActionTabs } from "./_components/ActionTabs";
import { ActionSellContainer } from "./_components/AciontSell";

export default function ActionDetail({ isin, baseHref, isAdmin }: { isin: ActionId, baseHref: string, isAdmin?: boolean }) {
    const router = useRouter();
    const statsQuery = useQuery(endpoints.actions.getStats({ isin }));

    const actionQuery = useQuery(endpoints.actions.get({ isin }));
    const [open, setOpen] = useState<null | "buy" | "sell">(null)

    return (
        <div className="space-y-4 pb-20 md:pb-8">
            <div className="flex items-center justify-between sticky top-0 py-2 z-10 border-b md:border-none">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="p-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-lg font-semibold md:hidden">Détails</h1>
                <div className="w-10 md:hidden" />
            </div>
            <div className="space-y-4">
                {match(actionQuery)
                    .with({ status: "pending" }, () => <ActionDetailsSkeleton />)
                    .with({ status: "error" }, () => (
                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="p-4">
                                <p className="text-sm text-red-600 font-semibold">
                                    Action introuvable
                                </p>
                            </CardContent>
                        </Card>
                    ))
                    .with({ status: "success" }, ({ data: action }) => (
                        <>
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
                                                                Disponible
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-red-500 hover:bg-red-600 text-xs">
                                                                <XCircle className="w-3 h-3 mr-1" />
                                                                Indisponible
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
                                                <p className="text-white/90 text-sm md:text-base">
                                                    {action.name}
                                                </p>
                                                <p className="text-white/60 text-xs mt-1">
                                                    ISIN: {action.ISIN}
                                                </p>
                                            </div>
                                            {!isAdmin && (
                                                <div className="flex flex-col gap-3">
                                                    <Button
                                                        className="bg-indigo-800/50 hover:bg-indigo-900/50 transition shadow"
                                                        onClick={(() => setOpen((prev) => prev === "buy" ? null : "buy"))}
                                                    >
                                                        <ShoppingCart className="w-5 h-5" /> Acheter des actions
                                                    </Button>
                                                    <Button
                                                        className="bg-indigo-800/50 hover:bg-indigo-900/50 transition shadow"
                                                        onClick={(() => setOpen((prev) => prev === "sell" ? null : "sell"))}
                                                    >
                                                        <ShoppingCart className="w-5 h-5" /> Vendre des actions
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                            <p className="text-white/70 text-xs mb-1">Prix actuel</p>
                                            <div className="flex items-baseline gap-3 flex-wrap">
                                                <p className="text-3xl md:text-4xl font-bold">
                                                    {action.price.amount}
                                                </p>
                                                <p className="text-white/90 text-sm">
                                                    {action.price.currency}
                                                </p>
                                                {match(statsQuery)
                                                    .with({ status: "success" }, ({ data: stats }) => (
                                                        <div
                                                            className={`flex items-center gap-1 text-sm font-semibold ${stats.priceChange24h >= 0
                                                                ? "text-green-300"
                                                                : "text-red-300"
                                                                }`}
                                                        >
                                                            {stats.priceChange24h >= 0 ? (
                                                                <TrendingUp className="w-4 h-4" />
                                                            ) : (
                                                                <TrendingDown className="w-4 h-4" />
                                                            )}
                                                            {stats.priceChange24h >= 0 ? "+" : ""}
                                                            {stats.priceChange24h.toFixed(2)}%
                                                        </div>
                                                    ))
                                                    .otherwise(() => null)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                            {!isAdmin && action.isAvailable && open === "buy" &&
                                <ActionBuy action={action} buyOpen={open === "buy"} closeBuy={() => setOpen(null)} />
                            }
                            {!isAdmin && open === "sell" &&
                                <ActionSellContainer action={action} sellOpen={open === 'sell'} closeSell={() => setOpen(null)} />
                            }
                        </>
                    ))
                    .exhaustive()}

                {match(actionQuery)
                    .with({ status: "pending" }, () => <></>)
                    .with({ status: "error" }, () => (
                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="p-4">
                                <p className="text-sm text-red-600 font-semibold">
                                    Action introuvable
                                </p>
                            </CardContent>
                        </Card>
                    ))
                    .with({ status: "success" }, ({ data: action }) => (
                        <ActionTabs action={action} isAdmin={isAdmin} />

                    ))
                    .exhaustive()}
            </div>

        </div>
    );
}

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


