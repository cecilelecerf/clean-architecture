import { Card } from "@/components/ui/card";
import {
    Edit,
    Save,
    X,
} from "lucide-react";
import { User as TUser } from "@infrastructure/types/user";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const ProfileHeader = ({
    user,
    isEditing,
    isPending,
    onEdit,
    onCancel,
    onSave,
    t
}: {
    user: TUser;
    isEditing: boolean;
    isPending: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
    t: ReturnType<typeof useTranslations>;
}) => {
    const roleConfig = {
        client: { color: "border-blue-500 text-blue-700", label: "Client" },
        conseiller: { color: "border-green-500 text-green-700", label: "Conseiller" },
        directeur: { color: "border-purple-500 text-purple-700", label: "Directeur" }
    }

    const currentRole = roleConfig[user.role as keyof typeof roleConfig];

    return (
        <Card className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
                <Avatar className="h-20 w-20 md:h-24 md:w-24">
                    <AvatarFallback className="text-2xl md:text-3xl">
                        {user.firstname[0]}{user.lastname[0]}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                        <h1 className="text-2xl md:text-3xl font-bold">
                            {user.firstname} {user.lastname}
                        </h1>
                        <Badge variant="outline" className={currentRole.color}>
                            {currentRole.label}
                        </Badge>
                    </div>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                        {user.email}
                    </p>
                </div>

                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={onCancel}
                                disabled={isPending}
                            >
                                <X className="h-4 w-4 md:mr-2" />
                                <span className="hidden md:inline">{t("actions.cancel")}</span>
                            </Button>
                            <Button onClick={onSave} disabled={isPending}>
                                <Save className="h-4 w-4 md:mr-2" />
                                <span className="hidden md:inline">
                                    {isPending ? "Enregistrement..." : "Enregistrer"}
                                </span>
                            </Button>
                        </>
                    ) : (
                        <Button variant="outline" onClick={onEdit}>
                            <Edit className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">{t("actions.edit")}</span>
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
};
