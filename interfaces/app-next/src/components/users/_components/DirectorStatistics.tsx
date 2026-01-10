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
import { useTranslations } from "next-intl";

export const DirectorStatistics = ({ userId }: { userId: UserId, }) => {
    const query = useQuery(endpoints.users.stats({ id: userId }));
    const t = useTranslations("director.profile");

    return (
        <Card className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                {t("overview.title")}
            </h2>

            {match(query)
                .with(({ status: "error" }), () => "error")
                .with(({ status: "pending" }), () => "pending")
                .with(({ status: "success" }), ({ data }) => {
                    const stats = data as DirectorStat;

                    return (<div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        <div className="p-3 md:p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                                <p className="text-xs text-blue-600">{t("overview.advisors")}</p>
                            </div>
                            <p className="text-xl md:text-2xl font-bold text-blue-700">{stats.totalAdvisors}</p>
                        </div>

                        <div className="p-3 md:p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                                <p className="text-xs text-green-600">{t("overview.client")}</p>
                            </div>
                            <p className="text-xl md:text-2xl font-bold text-green-700">{stats.totalClients}</p>
                        </div>

                        <div className="p-3 md:p-4 bg-purple-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                                <p className="text-xs text-purple-600">{t("overview.stocks")}</p>
                            </div>
                            <p className="text-xl md:text-2xl font-bold text-purple-700">
                                {stats.totalActions}
                            </p>
                        </div>

                        <div className="p-3 md:p-4 bg-orange-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                                <p className="text-xs text-orange-600">{t("overview.available")}</p>
                            </div>
                            <p className="text-xl md:text-2xl font-bold text-orange-700">-
                                {/* {activeActions} */}
                            </p>
                        </div>
                    </div>)
                })
                .exhaustive()}
        </Card>
    );
}
