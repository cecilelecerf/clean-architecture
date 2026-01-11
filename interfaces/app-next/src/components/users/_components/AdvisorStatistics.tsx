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
import { StatCard } from "./StatCard";
import { useTranslations } from "next-intl";
export const AdvisorStatistics = ({ userId }: { userId: UserId }) => {
    const query = useQuery(endpoints.users.stats({ id: userId }));
    const t = useTranslations("advisor.profile");

    return (
        <Card className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                {t("activity.title")}
            </h2>
            {match(query)
                .with(({ status: "error" }), () => "error")
                .with(({ status: "pending" }), () => "pending")
                .with(({ status: "success" }), ({ data }) => {
                    const stats = data as AdvisorStat;
                    return <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                        <StatCard label={t("activity.loan.accepted")} color="green" value={stats.acceptedCreditsCount} icon={FileText} />
                        <StatCard label={t("activity.loan.refused")}  color="purple" value={stats.refusedCreditsCount} icon={FileText} />
                        <StatCard label={t("activity.thread")} color="orange" value={stats.activeThreadsCount} icon={Users} />
                    </div>
                })
                .exhaustive()
            }
        </Card>
    );
}