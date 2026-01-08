import { Card } from "@/components/ui/card";
import { endpoints } from "@/utils/endpoint";
import { AdvisorStat } from "@infrastructure/types/stat";
import { UserId } from "@infrastructure/types/user";
import { useQuery } from "@tanstack/react-query";
import {
    Briefcase,
    Users,
    FileText,
} from "lucide-react";
import { match } from "ts-pattern";
export const AdvisorStatistics = ({ userId }: { userId: UserId }) => {
    const query = useQuery(endpoints.users.stats({ id: userId }));

    return (
        <Card className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Mon activité
            </h2>
            {match(query)
                .with(({ status: "error" }), () => "error")
                .with(({ status: "pending" }), () => "pending")
                .with(({ status: "success" }), ({ data }) => {
                    const stats = data as AdvisorStat;
                    return <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">

                        <div className="p-3 md:p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                                <p className="text-xs text-green-600">Crédits acceptés</p>
                            </div>
                            <p className="text-xl md:text-2xl font-bold text-green-700">{stats.acceptedCreditsCount}</p>
                        </div>

                        <div className="p-3 md:p-4 bg-purple-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                                <p className="text-xs text-purple-600">Crédits refusés</p>
                            </div>
                            <p className="text-xl md:text-2xl font-bold text-purple-700">{stats.refusedCreditsCount}</p>
                        </div>

                        <div className="p-3 md:p-4 bg-orange-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                                <p className="text-xs text-orange-600">Threads actifs</p>
                            </div>
                            <p className="text-xl md:text-2xl font-bold text-orange-700">{stats.activeThreadsCount}</p>
                        </div>
                    </div>
                })
                .exhaustive()
            }
        </Card>
    );
}