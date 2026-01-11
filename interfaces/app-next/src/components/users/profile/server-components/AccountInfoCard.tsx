import { Card } from "@/components/ui/card";
import {
    Mail,
    Calendar,
    Shield,
} from "lucide-react";
import { User as TUser } from "@infrastructure/types/user";
import { useTranslations } from "next-intl";
import { InfoField } from "./PersonalInfoReadMode";

export const AccountInfoCard = ({
    user,
    t
}: {
    user: TUser;
    t: ReturnType<typeof useTranslations>
}) => {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    return (
        <Card className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t("account.title")}
            </h2>

            <div className="space-y-3">
                <InfoField
                    icon={Calendar}
                    label={t("account.createdAt")}
                    value={formatDate(user.createdAt)}
                />
                <InfoField
                    icon={Calendar}
                    label={t("account.updatedAt")}
                    value={formatDate(user.updatedAt)}
                />

                {user.confirmedAt && (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-500/10 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="text-sm font-medium text-green-700">
                                    {t("account.confirmedEmail")}
                                </p>
                                <p className="text-xs text-green-600">
                                    Le {formatDate(user.confirmedAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};