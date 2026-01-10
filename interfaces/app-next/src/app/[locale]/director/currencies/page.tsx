"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { CurrencyCode } from "@infrastructure/types/currency";
import { useTranslations } from "next-intl";

export default function CurrenciesPage() {
    const query = useQuery(endpoints.currencies.getAll());
    const [editingCode, setEditingCode] = useState<CurrencyCode | null>(null);
    const [newRate, setNewRate] = useState("");

    const t = useTranslations("director.currency");

    const updateMutation = useMutation(
        endpoints.currencies.update({ currencyCode: editingCode })
    );

    const handleUpdate = (code: CurrencyCode, currentRate: number) => {
        setEditingCode(code);
        setNewRate(currentRate.toString());
    };

    const handleSave = () => {
        if (!editingCode) return;

        updateMutation.mutate(
            { exchangeRate: parseFloat(newRate) },
            {
                onSuccess: () => {
                    toast.success(t("success"));
                    setEditingCode(null);
                    query.refetch();
                },
                onError: (error) => {
                    toast.error(error.message || t("error"));
                },
            }
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{t("title")}</h1>
                <p className="text-sm text-gray-600">
                    {t("text")}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {query.data?.map((currency) => (
                    <Card key={currency.code} className="justify-between">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{currency.symbol}</span>
                                    <div>
                                        <CardTitle className="text-lg">{currency.code}</CardTitle>
                                        <p className="text-xs text-gray-600">{currency.name}</p>
                                    </div>
                                </div>
                                {currency.code === "USD" && (
                                    <Badge variant="secondary">{t("ref")}</Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {editingCode === currency.code ? (
                                <div className="space-y-2">
                                    <Input
                                        type="number"
                                        step="0.000001"
                                        value={newRate}
                                        onChange={(e) => setNewRate(e.target.value)}
                                        placeholder={t("new")}
                                    />
                                    <div className="flex gap-2">
                                        <Button onClick={handleSave} size="sm" className="flex-1">
                                            {t("save")}
                                        </Button>
                                        <Button
                                            onClick={() => setEditingCode(null)}
                                            variant="outline"
                                            size="sm"
                                        >
                                            {t("cancel")}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="text-2xl font-bold">
                                        {currency.exchangeRate.toFixed(6)}
                                    </div>
                                    <p className="text-xs text-gray-600">
                                        {t("usd")} {currency.exchangeRate.toFixed(6)} {currency.code}
                                    </p>
                                    {currency.code !== "USD" && (
                                        <Button
                                            onClick={() =>
                                                handleUpdate(currency.code, currency.exchangeRate)
                                            }
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                        >
                                            {t("update")}
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}