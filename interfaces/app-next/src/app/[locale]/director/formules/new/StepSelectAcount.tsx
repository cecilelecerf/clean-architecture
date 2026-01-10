"use client";

import { endpoints } from "@/utils/endpoint";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export const StepSelectAccount = ({ selectedAccountId, onSelect, onNext }: { selectedAccountId?: string, onSelect: (accountId: string, currency: string) => void, onNext: () => void }) => {
    const query = useQuery(endpoints.accounts.getAll({ type: "bank" }));
    const t = useTranslations("director.credits.formulas.new.account");

    if (query.isLoading) return <p>{t("loading")}</p>;
    if (query.isError) return <p>{t("error")}</p>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">{t("choose")}</h2>
            <div className="grid gap-4">
                {query.data.map((account) => {
                    const selected = account.IBAN === selectedAccountId;
                    return (
                        <Card
                            key={account.IBAN}
                            onClick={() => onSelect(account.IBAN, account.balance.currency)}
                            className={`cursor-pointer transition-all ${selected
                                ? "border-blue-500 ring-2 ring-blue-500"
                                : "hover:shadow-md"
                                }`}
                        >
                            <CardContent className="flex items-center justify-between p-4">
                                <div>
                                    <p className="font-medium">{account.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {t("balance")} : {account.balance.amount} {account.balance.currency}
                                    </p>
                                </div>

                                {selected && (
                                    <CheckCircle className="text-blue-500 w-6 h-6" />
                                )}
                            </CardContent>
                        </Card>
                    );
                })}

            </div>
            <Button
                size="lg"
                disabled={!selectedAccountId}
                onClick={onNext}
            >
                {t("next")}
            </Button>
        </div>
    )
}