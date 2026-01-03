"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { Card } from "@/components/ui/card";
import {
    CreditCard,
    FileText,
    TrendingUp,
} from "lucide-react";
import { UserId } from "@infrastructure/types/user";
export const ClientStatistics = ({ userId }: { userId: UserId }) => {
    const { data: accounts } = useQuery(endpoints.accounts.getAllByClient({ userId }));
    const { data: credits } = useQuery(endpoints.credits.getAllByClientId({ userId }));

    const totalBalance = accounts?.reduce((sum, acc) => sum + acc.amount, 0) || 0;
    const activeCredits = credits?.filter(c => c.status === "ACCEPTED").length || 0;
    const pendingCredits = credits?.filter(c => c.status === "PENDING").length || 0;

    return (
        <Card className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Mon activité
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="p-3 md:p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                        <p className="text-xs text-blue-600">Comptes</p>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-blue-700">
                        {accounts?.length || 0}
                    </p>
                </div>

                <div className="p-3 md:p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                        <p className="text-xs text-green-600">Solde total</p>
                    </div>
                    <p className="text-base md:text-xl font-bold text-green-700">
                        {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                            notation: 'compact',
                        }).format(totalBalance)}
                    </p>
                </div>

                <div className="p-3 md:p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                        <p className="text-xs text-purple-600">Crédits actifs</p>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-purple-700">
                        {activeCredits}
                    </p>
                </div>

                <div className="p-3 md:p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                        <p className="text-xs text-orange-600">En attente</p>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-orange-700">
                        {pendingCredits}
                    </p>
                </div>
            </div>
        </Card>
    );
}