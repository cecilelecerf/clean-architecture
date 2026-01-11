import { UserDto } from "@infrastructure/types/user";
import { CheckCircle, Mail, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "../ui/skeleton";
import { useTranslations } from "next-intl";


export const CardUserDetail = ({ user }: { user: UserDto }) => {
    const t = useTranslations("director.user.card");
    return (
        <Card className="p-6">
            <div className="flex items-start gap-6 flex-col sm:flex-row">
                <Avatar className="h-10 w-10 sm:h-24 sm:w-24">
                    <AvatarFallback className="sm:text-3xl">
                        {user.firstname[0]}{user.lastname[0]}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                {user.firstname} {user.lastname}
                            </h1>

                            <div className="flex gap-2 mb-4">
                                <Badge variant={user.isActiveField ? "default" : "secondary"}>
                                    {user.isActiveField ? "Actif" : "Inactif"}
                                </Badge>
                                <Badge variant="outline">
                                    {user.role === "conseiller" ? "Conseiller" :
                                        user.role === "directeur" ? "Directeur" : "Client"}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">{user.email}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {user.confirmedAt ? (
                                <>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-green-700">{t("corfirm")}</span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-4 w-4 text-orange-500" />
                                    <span className="text-orange-700">{t("not")}</span>
                                </>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </Card>
    )
}

export const SkeletonCardUserDetail = () =>
    <Card className="p-6">
        <div className="flex items-start gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-64" />
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-52" />
                </div>
            </div>
        </div>
    </Card>