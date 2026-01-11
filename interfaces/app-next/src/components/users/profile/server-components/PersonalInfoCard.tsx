import { Card } from "@/components/ui/card";
import {
    User,
} from "lucide-react";
import { User as TUser, UpdateClientPayload } from "@infrastructure/types/user";
import { useTranslations } from "next-intl";
import { PersonalInfoReadMode } from "./PersonalInfoReadMode";
import { PersonalInfoEditMode } from "../client-components/PersonalInfoEditMode";

export const PersonalInfoCard = ({
    user,
    isEditing,
    formData,
    setFormData,
    t
}: {
    user: TUser;
    isEditing: boolean;
    formData: UpdateClientPayload;
    setFormData: React.Dispatch<React.SetStateAction<UpdateClientPayload>>;
    t: ReturnType<typeof useTranslations>;
}) => {
    return (
        <Card className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                {t("personal.title")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isEditing ? (
                    <PersonalInfoEditMode
                        formData={formData}
                        setFormData={setFormData}
                        t={t}
                    />
                ) : (
                    <PersonalInfoReadMode user={user} t={t} />
                )}
            </div>
        </Card>
    );
};
