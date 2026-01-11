"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { CurrencyCode } from "@infrastructure/types/currency";
import { useTranslations } from "next-intl";
import { CurrencyCard } from "./_components/CurrencyCard";
import { match } from "ts-pattern";

export default function CurrenciesPage() {
    const query = useQuery(endpoints.currencies.getAll());
    const [editingCode, setEditingCode] = useState<CurrencyCode | null>(null);
    const [newRate, setNewRate] = useState("");

    const t = useTranslations("director.currency");

    const updateMutation = useMutation(
        endpoints.currencies.update({ currencyCode: editingCode })
    );

    const handleUpdate = useCallback(() => (code: CurrencyCode, currentRate: number) => {
        setEditingCode(code);
        setNewRate(currentRate.toString());
    }, []);

    const handleSave = () => useCallback(() => {
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
    }, [editingCode, newRate, updateMutation]);

    const handleCancel = useCallback(() => {
        setEditingCode(null);
        setNewRate("");
    }, []);
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{t("title")}</h1>
                <p className="text-sm text-gray-600">
                    {t("text")}
                </p>
            </div>
            {match(query)
                .with(({ status: "error" }), () => "error")
                .with(({ status: 'pending' }), () => "pending")
                .with(({ status: "success" }), ({ data: currencies }) =>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {currencies.map((currency) => (
                            <CurrencyCard
                                key={currency.code}
                                currency={currency}
                                isEditing={editingCode === currency.code}
                                newRate={newRate}
                                onRateChange={setNewRate}
                                onEdit={handleUpdate}
                                onSave={handleSave}
                                onCancel={handleCancel}
                                isPending={updateMutation.isPending}
                                t={t}
                            />
                        ))}
                    </div>
                ).exhaustive()}

        </div>
    );
}