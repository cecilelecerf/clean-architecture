import {
    User,
    Mail,
    Phone,
    MapPin,
    Cake,
    LucideIcon,
} from "lucide-react";
import { User as TUser } from "@infrastructure/types/user";
import { useTranslations } from "next-intl";

export const PersonalInfoReadMode = ({
    user,
    t
}: {
    user: TUser;
    t: ReturnType<typeof useTranslations>
}) => {
    const formatSexe = (sexe: string) => {
        return sexe === "boy" ? "Homme" : sexe === "girl" ? "Femme" : sexe || "Non renseigné";
    };

    return (
        <>
            <InfoField icon={User} label={t("personal.firstname")} value={user.firstname} />
            <InfoField icon={User} label={t("personal.lastname")} value={user.lastname} />
            <InfoField icon={Mail} label={t("personal.email")} value={user.email} />

            {user.role === "client" && (
                <>
                    <InfoField
                        icon={Phone}
                        label={t("personal.phone")}
                        value={user.phoneNumber || "Non renseigné"}
                    />
                    <InfoField
                        icon={Cake}
                        label={t("personal.dateOfBirth")}
                        value={user.dateOfBirth
                            ? new Date(user.dateOfBirth).toLocaleDateString('fr-FR')
                            : "Non renseignée"}
                    />
                    <InfoField
                        icon={User}
                        label={t("personal.sexe")}
                        value={formatSexe(user.sexe)}
                    />
                    {user.address && (
                        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-500/10 rounded-lg md:col-span-2">
                            <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500">{t("personal.address")}</p>
                                <p className="font-medium">
                                    {user.address.address && `${user.address.address}, `}
                                    {user.address.postalCode && `${user.address.postalCode} `}
                                    {user.address.city}
                                    {user.address.country && `, ${user.address.country}`}
                                    {!user.address.address && !user.address.city && "Non renseignée"}
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export const InfoField = ({
    icon: Icon,
    label,
    value
}: {
    icon: LucideIcon;
    label: string;
    value: string
}) => (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-500/10 rounded-lg">
        <Icon className="h-5 w-5 text-gray-500" />
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    </div>
);


