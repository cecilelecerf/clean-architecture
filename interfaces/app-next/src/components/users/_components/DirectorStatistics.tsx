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
import { StatCard } from "./StatCard";

export const DirectorStatistics = ({ userId }: { userId: UserId }) => {
    const query = useQuery(endpoints.users.stats({ id: userId }));
    const t = useTranslations("director.profile");

    return (
        <Card
            className="
                p-4 md:p-6 
                shadow-sm  
            "
        >
            <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                {t("overview.title")}
            </h2>

            {match(query)
                .with(({ status: "error" }), () => "error")
                .with(({ status: "pending" }), () => "pending")
                .with(({ status: "success" }), ({ data }) => {
                    const stats = data as DirectorStat;

                    return (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                            <StatCard
                                label={t("overview.advisors")}
                                value={stats.totalAdvisors}
                                icon={Users}
                                color="blue"
                            />

                            <StatCard
                                label={t("overview.client")}
                                value={stats.totalClients}
                                icon={Users}
                                color="green"
                            />

                            <StatCard
                                label={t("overview.stocks")}
                                value={stats.totalActions}
                                icon={TrendingUp}
                                color="purple"
                            />

                            <StatCard
                                label={t("overview.available")}
                                value="-"
                                icon={TrendingUp}
                                color="orange"
                            />
                        </div>
                    );
                })
                .exhaustive()}
        </Card>
    );
};
