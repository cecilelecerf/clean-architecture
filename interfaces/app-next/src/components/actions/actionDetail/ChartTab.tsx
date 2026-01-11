
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { match } from "ts-pattern";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    TrendingUp,
    Activity,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Action } from "@infrastructure/types/action";
import { useTranslations } from "next-intl";

export const ChartTab = ({ action }: { action: Action }) => {
    const priceHistoryQuery = useQuery(endpoints.orders.actions.getHistory({ isin: action.ISIN }));

    const t = useTranslations("director.stocks.details.chart");

    return (

        match(priceHistoryQuery)
            .with({ status: "pending" }, () => <ChartSkeleton />)
            .with({ status: "error" }, () => (
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500 text-center">
                            {t("unableLoading")}
                        </p>
                    </CardContent>
                </Card>
            ))
            .with({ status: "success" }, ({ data: orders }) => {
                const ordersByDate: Record<
                    string,
                    { transaction: number; price: number; somme: number, volume: number }
                > = orders.reduce((acc, current) => {
                    const dateKey = format(new Date(current.date), "yyyy-MM-dd");

                    if (!acc[dateKey]) {
                        acc[dateKey] = {
                            transaction: 0,
                            somme: 0,
                            price: 0,
                            volume: 0
                        };
                    }

                    acc[dateKey].transaction += 1;
                    acc[dateKey].somme += current.price.amount;
                    acc[dateKey].volume += current.quantity;
                    acc[dateKey].price =
                        acc[dateKey].somme / acc[dateKey].transaction;

                    return acc;
                }, {} as Record<string, { volume: number; price: number; somme: number, transaction: number }>);
                const chartData = Object.entries(ordersByDate).map(
                    ([date, values]) => ({
                        date,
                        price: values.price,
                        transaction: values.transaction,
                        volume: values.volume
                    })
                );

                return (
                    <>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    {t("priceEvol")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <AreaChart data={chartData}>
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
                                            content={<CustomTooltip currency={action.price.currency} />}
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
                                    {t("volume")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={chartData}>
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
                )
            })
            .exhaustive()

    )
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