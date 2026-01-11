"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { match } from "ts-pattern";
import { UpdateClientPayload, User as TUser, UserId } from "@infrastructure/types/user";
import { ClientStatistics } from "../../_components/ClientStatistics";
import { AdvisorStatistics } from "../../_components/AdvisorStatistics";
import { DirectorStatistics } from "../../_components/DirectorStatistics";
import { useTranslations } from "next-intl";
import { PersonalInfoCard } from "../server-components/PersonalInfoCard";
import { ProfileHeader } from "../server-components/ProfileHeader";
import { AccountInfoCard } from "../server-components/AccountInfoCard";
import { LogoutCard } from "../server-components/LogoutCard";
import { ProfileSkeleton } from "../server-components/ProfileSkeleton";

const getEmptyFormData = (): UpdateClientPayload => ({
    firstname: "",
    lastname: "",
    email: "",
    dateOfBirth: "",
    phoneNumber: "",
    address: {
        address: "",
        city: "",
        postalCode: "",
        country: "",
    },
    sexe: undefined
});

export const Wrapper = ({ userId }: { userId: UserId, }) => {
    const t = useTranslations("director.profile");

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UpdateClientPayload>(getEmptyFormData);

    const query = useQuery(endpoints.users.me());

    const handleCancel = useCallback(() => {
        setIsEditing(false);
        setFormData(getEmptyFormData());
    }, []);

    const updateMutation = useMutation(endpoints.users.update({ id: userId }));

    const handleSave = () => {
        updateMutation.mutate({
            payload: {
                ...formData,
                dateOfBirth: formData.dateOfBirth
                    ? new Date(formData.dateOfBirth).toISOString()
                    : undefined
            }
        }, {
            onSuccess: () => {
                toast.success("Profil mis à jour avec succès");
                setIsEditing(false);
                query.refetch();
            },
            onError: (error) => {
                toast.error(error.message);
            },
        });
    };


    const handleEdit = (user: TUser) => {
        setFormData({
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            dateOfBirth: user.role === "client" ? user.dateOfBirth : undefined,
            phoneNumber: user.role === "client" ? user.phoneNumber : undefined,
            address: user.role === "client" ? user.address || {
                address: "",
                city: "",
                postalCode: "",
                country: "",
            } : undefined,
            sexe: user.role === "client" ? user.sexe : undefined
        });
        setIsEditing(true);
    }

    return match(query)
        .with(({ status: "error" }), () => <div>Erreur lors du chargement du profil</div>)
        .with(({ status: "pending" }), () => <ProfileSkeleton />)
        .with(({ status: "success" }), ({ data: user }) => (
            <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-5xl mx-auto">
                <ProfileHeader
                    user={user}
                    isEditing={isEditing}
                    isPending={updateMutation.isPending}
                    onEdit={() => handleEdit(user)}
                    onCancel={handleCancel}
                    onSave={handleSave}
                    t={t}
                />

                <PersonalInfoCard
                    user={user}
                    isEditing={isEditing}
                    formData={formData}
                    setFormData={setFormData}
                    t={t}
                />

                {match(user.role)
                    .with("client", () => <ClientStatistics userId={user.id} />)
                    .with("conseiller", () => <AdvisorStatistics userId={user.id} />)
                    .with("directeur", () => <DirectorStatistics userId={user.id} />)
                    .exhaustive()}

                <AccountInfoCard user={user} t={t} />

                <LogoutCard t={t} />
            </div>
        ))
        .exhaustive();
}
