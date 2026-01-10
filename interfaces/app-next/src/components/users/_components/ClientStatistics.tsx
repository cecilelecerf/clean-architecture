"use client"

import { useQuery, } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { Card } from "@/components/ui/card";
import {
    CreditCard,
    FileText,
    TrendingUp,
} from "lucide-react";
import { UserId } from "@infrastructure/types/user";
import { StatCard } from "./StatCard";
export const ClientStatistics = ({ userId }: { userId: UserId }) => {
    const { data: accounts } = useQuery(endpoints.accounts.getAllByClient({ userId }));
    const { data: credits } = useQuery(endpoints.credits.getAllByClientId({ userId }));

    const totalBalance = accounts?.reduce((sum, acc) => sum + acc.balance.amount, 0) || 0;
    const activeCredits = credits?.filter(c => c.status === "ACCEPTED").length || 0;
    const pendingCredits = credits?.filter(c => c.status === "PENDING").length || 0;

    return (
        <Card className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Mon activité
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <StatCard
                    label="Comptes"
                    value={accounts?.length || 0}
                    icon={CreditCard}
                    color="blue"
                />

                <StatCard
                    label="Solde total"
                    value={new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                        notation: "compact",
                    }).format(totalBalance)}
                    icon={TrendingUp}
                    color="green"
                />

                <StatCard
                    label="Crédits actifs"
                    value={activeCredits}
                    icon={FileText}
                    color="purple"
                />

                <StatCard
                    label="En attente"
                    value={pendingCredits}
                    icon={FileText}
                    color="orange"
                />
            </div>
        </Card>
    );
}