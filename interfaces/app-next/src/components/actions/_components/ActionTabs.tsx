"use client";

import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { match } from "ts-pattern";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
    Building2,
    Layers,
    Hash,
    TrendingUp,
    TrendingDown,
    Activity,
    BarChart3,
    LineChart as LineChartIcon,
} from "lucide-react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Action, } from "@infrastructure/types/action";
import { formatDateFrench } from "@/utils/date/formatDateFrench";
import { MyOrders } from "./Order";

export const ActionTabs = ({ action }: { action: Action }) => {
    const statsQuery = useQuery(endpoints.actions.getStats({ isin: action.ISIN }));
    const priceHistoryQuery = useQuery(endpoints.actions.getHistory({ isin: action.ISIN }));

    return (
        <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="overview" className="text-xs sm:text-sm">
                    <Activity className="w-4 h-4 mr-1 hidden sm:inline" />
                    Vue d'ensemble
                </TabsTrigger>
                <TabsTrigger value="my-order" className="text-xs sm:text-sm">
                    <LineChartIcon className="w-4 h-4 mr-1 hidden sm:inline" />
                    Mes actions
                </TabsTrigger>
                <TabsTrigger value="chart" className="text-xs sm:text-sm">
                    <LineChartIcon className="w-4 h-4 mr-1 hidden sm:inline" />
                    Graphiques
                </TabsTrigger>
                <TabsTrigger value="stats" className="text-xs sm:text-sm">
                    <BarChart3 className="w-4 h-4 mr-1 hidden sm:inline" />
                    Statistiques
                </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <MobileInfoCard
                        icon={Building2}
                        label="Marché"
                        value={action.market}
                        color="blue"
                    />
                    <MobileInfoCard
                        icon={Layers}
                        label="Secteur"
                        value={action.activitySector}
                        color="purple"
                    />
                    <MobileInfoCard
                        icon={Hash}
                        label="Total actions"
                        value={action.totalNb}
                        color="green"
                    />
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">
                            Informations détaillées
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <MobileDetailRow label="ISIN" value={action.ISIN} />
                        <Separator />
                        <MobileDetailRow label="Symbole" value={action.symbol} />
                        <Separator />
                        <MobileDetailRow
                            label="Prix unitaire"
                            value={`${action.currentPrice.amount} ${action.currentPrice.currency}`}
                        />
                        <Separator />
                        <MobileDetailRow
                            label="Capitalisation"
                            value={`${(
                                action.currentPrice.amount * action.totalNb
                            )} ${action.currentPrice.currency}`}
                            highlight
                        />
                        <Separator />
                        <MobileDetailRow
                            label="Créée le"
                            value={formatDateFrench(action.createdAt)}
                        />
                        {action.updatedAt && (
                            <>
                                <Separator />
                                <MobileDetailRow
                                    label="Maj le"
                                    value={formatDateFrench(action.updatedAt)}
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="my-order" className="space-y-4"><MyOrders action={action} /></TabsContent>
            {/* Chart Tab */}
            <TabsContent value="chart" className="space-y-4">
                {match(priceHistoryQuery)
                    .with({ status: "pending" }, () => <ChartSkeleton />)
                    .with({ status: "error" }, () => (
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-gray-500 text-center">
                                    Impossible de charger l'historique
                                </p>
                            </CardContent>
                        </Card>
                    ))
                    .with({ status: "success" }, ({ data: history }) => (
                        <>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" />
                                        Évolution du prix (30 jours)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <AreaChart data={history}>
                                            <defs>
                                                <linearGradient
                                                    id="colorPrice"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="5%"
                                                        stopColor="#3b82f6"
                                                        stopOpacity={0.3}
                                                    />
                                                    <stop
                                                        offset="95%"
                                                        stopColor="#3b82f6"
                                                        stopOpacity={0}
                                                    />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fontSize: 12 }}
                                                tickFormatter={(date) =>
                                                    format(new Date(date), "dd/MM", { locale: fr })
                                                }
                                            />
                                            <YAxis
                                                tick={{ fontSize: 12 }}
                                                domain={["auto", "auto"]}
                                            />
                                            <Tooltip
                                                content={<CustomTooltip currency={action.currentPrice.currency} />}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="price"
                                                stroke="#3b82f6"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorPrice)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Activity className="w-4 h-4" />
                                        Volume de transactions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={history}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fontSize: 12 }}
                                                tickFormatter={(date) =>
                                                    format(new Date(date), "dd/MM", { locale: fr })
                                                }
                                            />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip />
                                            <Bar
                                                dataKey="volume"
                                                fill="#8b5cf6"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </>
                    ))
                    .exhaustive()}
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats" className="space-y-4">
                {match(statsQuery)
                    .with({ status: "pending" }, () => <StatsSkeleton />)
                    .with({ status: "error" }, () => (
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-gray-500 text-center">
                                    Impossible de charger les statistiques
                                </p>
                            </CardContent>
                        </Card>
                    ))
                    .with({ status: "success" }, ({ data: stats }) => (
                        <>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">
                                        Performance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <PerformanceRow
                                        label="Variation 24h"
                                        value={stats.change24h}
                                        isPercentage
                                    />
                                    <Separator />
                                    <PerformanceRow
                                        label="Variation 7j"
                                        value={stats.change7d}
                                        isPercentage
                                    />
                                    <Separator />
                                    <PerformanceRow
                                        label="Variation 30j"
                                        value={stats.change30d}
                                        isPercentage
                                    />
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-2 gap-3">
                                <StatCard
                                    label="Prix min (30j)"
                                    value={`${stats.minPrice} ${action.currentPrice.currency}`}
                                    icon={TrendingDown}
                                    color="red"
                                />
                                <StatCard
                                    label="Prix max (30j)"
                                    value={`${stats.maxPrice} ${action.currentPrice.currency}`}
                                    icon={TrendingUp}
                                    color="green"
                                />
                            </div>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">
                                        Trading
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <MobileDetailRow
                                        label="Volume total"
                                        value={stats.totalVolume}
                                    />
                                    <Separator />
                                    <MobileDetailRow
                                        label="Prix moyen"
                                        value={`${stats.averagePrice} ${action.currentPrice.currency}`}
                                    />
                                    <Separator />
                                    <MobileDetailRow
                                        label="Transactions"
                                        value={stats.transactionCount}
                                    />
                                </CardContent>
                            </Card>
                        </>
                    ))
                    .exhaustive()}
            </TabsContent>
        </Tabs>
    )
}

interface MobileInfoCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: "blue" | "green" | "purple";
}

function MobileInfoCard({ icon: Icon, label, value, color }: MobileInfoCardProps) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600 border-blue-200",
        green: "bg-green-50 text-green-600 border-green-200",
        purple: "bg-purple-50 text-purple-600 border-purple-200",
    };

    return (
        <Card className={`border ${colorClasses[color]}`}>
            <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" />
                    <p className="text-xs font-medium truncate">{label}</p>
                </div>
                <p className="text-base md:text-lg font-bold truncate">{value}</p>
            </CardContent>
        </Card>
    );
}

function MobileDetailRow({
    label,
    value,
    highlight = false,
}: {
    label: string;
    value: string | number;
    highlight?: boolean;
}) {
    return (
        <div className="flex justify-between items-start gap-3">
            <span className="text-xs text-gray-600  shrink-0">{label}</span>
            <span
                className={`text-sm text-right font-medium ${highlight ? "text-blue-600" : "text-gray-900"
                    }`}
            >
                {value}
            </span>
        </div>
    );
}

function PerformanceRow({
    label,
    value,
    isPercentage = false,
}: {
    label: string;
    value: number;
    isPercentage?: boolean;
}) {
    const isPositive = value >= 0;
    return (
        <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{label}</span>
            <div className="flex items-center gap-1">
                {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span
                    className={`font-semibold ${isPositive ? "text-green-600" : "text-red-600"
                        }`}
                >
                    {isPositive ? "+" : ""}
                    {value}
                    {isPercentage && "%"}
                </span>
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    icon: Icon,
    color,
}: {
    label: string;
    value: string;
    icon: React.ElementType;
    color: "red" | "green";
}) {
    const colorClasses = {
        red: "bg-red-50 text-red-600 border-red-200",
        green: "bg-green-50 text-green-600 border-green-200",
    };

    return (
        <Card className={`border ${colorClasses[color]}`}>
            <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" />
                    <p className="text-xs font-medium">{label}</p>
                </div>
                <p className="text-sm font-bold">{value}</p>
            </CardContent>
        </Card>
    );
}

const CustomTooltip = ({ active, payload, currency }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border rounded-lg shadow-lg">
                <p className="text-xs text-gray-600 mb-1">
                    {format(new Date(payload[0].payload.date), "dd MMMM yyyy", {
                        locale: fr,
                    })}
                </p>
                <p className="text-sm font-bold">
                    {payload[0].value} {currency}
                </p>
            </div>
        );
    }
    return null;
};

function ChartSkeleton() {
    return (
        <Card>
            <CardContent className="p-6">
                <Skeleton className="h-64 w-full" />
            </CardContent>
        </Card>
    );
}

function StatsSkeleton() {
    return (
        <div className="space-y-4">
            <Card>
                <CardContent className="p-6 space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                </CardContent>
            </Card>
        </div>
    );
}