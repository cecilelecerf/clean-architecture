"use client";

import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { match } from "ts-pattern";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import {
    TrendingUp,
    TrendingDown,
    Search,
    ShoppingCart,
    Wallet,
    ArrowRight,
    PackageSearch,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ActionsCarousel } from "./_components/ActionCarousel";

export default function ClientActionsPage() {
    const router = useRouter();
    const portfolioQuery = useQuery(endpoints.orders.portfolio.getMe());
    const suggestionsQuery = useQuery(endpoints.actions.getSuggestions());

    return (
        <div className="space-y-6 pb-20">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Mon portefeuille</h1>
                <p className="text-sm text-gray-600">
                    Gérez vos actions et découvrez de nouvelles opportunités
                </p>
            </div>

            {match(portfolioQuery)
                .with({ status: "pending" }, () => <PortfolioStatsSkeleton />)
                .with({ status: "error" }, () => (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-4">
                            <p className="text-sm text-red-600">
                                Erreur lors du chargement du portefeuille
                            </p>
                        </CardContent>
                    </Card>
                ))
                .with({ status: "success" }, ({ data: portfolio }) => {
                    if (!portfolio.positions || portfolio.positions.length === 0) {
                        return (
                            <Card className="overflow-hidden">
                                <CardContent className="p-8 text-center space-y-4">
                                    <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                                        <PackageSearch className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            Aucune action dans votre portefeuille
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Commencez à investir dès aujourd'hui et construisez votre
                                            patrimoine
                                        </p>
                                        <Button
                                            onClick={() => router.push("/actions/explore")}
                                            className="bg-linear-to-r from-blue-600 to-indigo-700"
                                        >
                                            <Search className="w-4 h-4 mr-2" />
                                            Explorer les actions
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    }

                    return (
                        < >
                            <Card className="overflow-hidden py-0">
                                <div className="bg-linear-to-r from-blue-600 to-indigo-700 p-6 text-white">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Wallet className="w-5 h-5" />
                                        <p className="text-sm text-white/80">Valeur totale</p>
                                    </div>
                                    <div className="flex items-baseline gap-3">
                                        <p className="text-4xl font-bold">
                                            {portfolio.totalValue.toLocaleString("fr-FR", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </p>
                                        <p className="text-lg text-white/90">
                                            {portfolio.currency}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 mt-4">
                                        <div
                                            className={`flex items-center gap-1 px-3 py-1 rounded-full ${portfolio.totalGainLoss >= 0
                                                ? "bg-green-500/20 text-green-100"
                                                : "bg-red-500/20 text-red-100"
                                                }`}
                                        >
                                            {portfolio.totalGainLoss >= 0 ? (
                                                <TrendingUp className="w-4 h-4" />
                                            ) : (
                                                <TrendingDown className="w-4 h-4" />
                                            )}
                                            <span className="text-sm font-semibold">
                                                {portfolio.totalGainLoss >= 0 ? "+" : ""}
                                                {portfolio.totalGainLoss.toLocaleString("fr-FR", {
                                                    minimumFractionDigits: 2,
                                                })}{" "}
                                                {portfolio.currency}
                                            </span>
                                        </div>
                                        <div
                                            className={`text-sm font-semibold ${portfolio.totalGainLossPercent >= 0
                                                ? "text-green-100"
                                                : "text-red-100"
                                                }`}
                                        >
                                            {portfolio.totalGainLossPercent >= 0 ? "+" : ""}
                                            {portfolio.totalGainLossPercent.toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Mes actions
                                    </h2>
                                    <Badge variant="outline">
                                        {portfolio.positions.length} position{portfolio.positions.length > 1 ? "s" : ""}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                    {portfolio.positions.map((position) => (
                                        <Card
                                            key={position.ISIN}
                                            className="cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                                            onClick={() => router.push(`/actions/${position.ISIN}`)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-bold text-blue-600 text-lg">
                                                                {position.symbol}
                                                            </h3>
                                                            <Badge variant="outline" className="text-xs">
                                                                {position.quantity} action{position.quantity > 1 ? "s" : ""}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            {position.name}
                                                        </p>
                                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                                            <span>
                                                                Prix moyen: {position.averagePrice.toFixed(2)} {position.currency}
                                                            </span>
                                                            <span>•</span>
                                                            <span>
                                                                Prix actuel: {position.currentPrice.toFixed(2)} {position.currency}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="text-xl font-bold text-gray-900">
                                                            {position.currentValue.toLocaleString("fr-FR", {
                                                                minimumFractionDigits: 2,
                                                            })}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mb-1">
                                                            {position.currency}
                                                        </p>
                                                        <div
                                                            className={`flex items-center gap-1 text-sm font-semibold ${position.gainLoss >= 0
                                                                ? "text-green-600"
                                                                : "text-red-600"
                                                                }`}
                                                        >
                                                            {position.gainLoss >= 0 ? (
                                                                <TrendingUp className="w-3 h-3" />
                                                            ) : (
                                                                <TrendingDown className="w-3 h-3" />
                                                            )}
                                                            <span>
                                                                {position.gainLoss >= 0 ? "+" : ""}
                                                                {position.gainLossPercent.toFixed(2)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </>
                    );
                })
                .exhaustive()}

            <Separator />

            {/* Carousel de suggestions */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Actions populaires
                        </h2>
                        <p className="text-sm text-gray-600">
                            Découvrez les actions les plus performantes
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/actions/explore")}
                        className="text-blue-600 hover:text-blue-700"
                    >
                        Tout voir
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>

                {match(suggestionsQuery)
                    .with({ status: "pending" }, () => <SuggestionsCarouselSkeleton />)
                    .with({ status: "error" }, () => (
                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="p-4">
                                <p className="text-sm text-red-600">
                                    Erreur lors du chargement des suggestions
                                </p>
                            </CardContent>
                        </Card>
                    ))
                    .with({ status: "success" }, ({ data: suggestions }) => (
                        <ActionsCarousel actions={suggestions} />
                    ))
                    .exhaustive()}
            </div>

            {/* CTA Explorer */}
            <Card className="overflow-hidden bg-linear-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto bg-blue-600 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Envie d'investir davantage ?
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Explorez notre catalogue complet d'actions et diversifiez votre
                        portefeuille
                    </p>
                    <Button
                        onClick={() => router.push("/actions/explore")}
                        className="bg-linear-to-r from-blue-600 to-indigo-700"
                    >
                        <Search className="w-4 h-4 mr-2" />
                        Explorer toutes les actions
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

function PortfolioStatsSkeleton() {
    return (
        <div className="space-y-4">
            <Card>
                <CardContent className="p-6">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <Skeleton className="h-12 w-48 mb-2" />
                    <Skeleton className="h-6 w-24" />
                </CardContent>
            </Card>
            <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function SuggestionsCarouselSkeleton() {
    return (
        <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="min-w-[280px]">
                    <CardContent className="p-4">
                        <Skeleton className="h-32 w-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}