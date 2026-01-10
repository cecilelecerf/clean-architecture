import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { Card } from "@/components/ui/card";
import {
    Briefcase,
    Users,
    TrendingUp,
} from "lucide-react";
import { UserId } from "@infrastructure/types/user";
import { match } from "ts-pattern";
import { DirectorStat } from "@infrastructure/types/stat";

export const DirectorStatistics = ({ userId }: { userId: UserId }) => {
    const query = useQuery(endpoints.users.stats({ id: userId }));

    return (
        <Card
            className="
                p-4 md:p-6 
                shadow-sm  
            "
        >
            <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Vue d'ensemble
            </h2>

            {match(query)
                .with(({ status: "error" }), () => "error")
                .with(({ status: "pending" }), () => "pending")
                .with(({ status: "success" }), ({ data }) => {
                    const stats = data as DirectorStat;

                    return (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                            <div className="p-3 md:p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-300">
                                    <Users className="h-4 w-4 md:h-5 md:w-5" />
                                    <p className="text-xs">Conseillers</p>
                                </div>
                                <p className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-300">
                                    {stats.totalAdvisors}
                                </p>
                            </div>

                            <div className="p-3 md:p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                                <div className="flex items-center gap-2 mb-2 text-green-600 dark:text-green-300">
                                    <Users className="h-4 w-4 md:h-5 md:w-5" />
                                    <p className="text-xs">Clients total</p>
                                </div>
                                <p className="text-xl md:text-2xl font-bold text-green-700 dark:text-green-300">
                                    {stats.totalClients}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="p-3 md:p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                                <div className="flex items-center gap-2 mb-2 text-purple-600 dark:text-purple-300">
                                    <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                                    <p className="text-xs">Actions</p>
                                </div>
                                <p className="text-xl md:text-2xl font-bold text-purple-700 dark:text-purple-300">
                                    {stats.totalActions}
                                </p>
                            </div>

                            {/* Disponibles */}
                            <div className="p-3 md:p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                                <div className="flex items-center gap-2 mb-2 text-orange-600 dark:text-orange-300">
                                    <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                                    <p className="text-xs">Disponibles</p>
                                </div>
                                <p className="text-xl md:text-2xl font-bold text-orange-700 dark:text-orange-300">
                                    -
                                </p>
                            </div>
                        </div>
                    );
                })
                .exhaustive()}
        </Card>
    );
};
