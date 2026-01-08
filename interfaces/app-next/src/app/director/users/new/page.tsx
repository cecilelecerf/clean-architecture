"use client";

import { registerAdminPayload, RegisterAdminPayload } from "@/app/api/users/new/route";
import FormWrapper, { Section } from "@/components/FormWrapper";
import { endpoints } from "@/utils/endpoint";
import { User } from "@infrastructure/types/user";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Mail, User as UserIcon, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const isValidUserRole = (value: string | null): value is User["role"] => {
    return value !== null && ["client", "conseiller", "directeur"].includes(value);
};

function AdminNewUsersContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const roleParam = searchParams.get("role");

    const form = useForm<RegisterAdminPayload>({
        resolver: zodResolver(registerAdminPayload)
    });
    const getRoleFromParam = (param: string | null): User["role"] | undefined => {
        if (param === "advisor") return "conseiller";
        if (param === "director") return "directeur";
        if (isValidUserRole(param)) return param;
        return undefined;
    };

    const role = getRoleFromParam(roleParam);



    const mutate = useMutation(endpoints.users.create());

    const onSubmit = (values: RegisterAdminPayload) => {
        mutate.mutate(
            { payload: values },
            {
                onSuccess: () => {
                    const redirectParam =
                        role === "conseiller"
                            ? "advisor"
                            : role === "directeur"
                                ? "director"
                                : "";

                    router.push(
                        `/director/users${redirectParam ? `?role=${redirectParam}` : ""}`
                    );
                },
            }
        );
    };

    const sections: Section<RegisterAdminPayload>[] = [
        {
            title: "Informations personnelles",
            description: "Identité de l'utilisateur",
            icon: UserIcon,
            data: {
                firstname: {
                    label: "Prénom",
                    type: "text",
                },
                lastname: {
                    label: "Nom de famille",
                    type: "text",
                },
            },
        },
        {
            title: "Compte",
            description: "Informations de connexion",
            icon: Mail,
            data: {
                email: {
                    label: "Email",
                    type: "email",
                },
            },
        },

        {
            title: "Rôle",
            description: "Permissions associées au compte",
            icon: Shield,
            data: {
                role: {
                    label: "Rôle",
                    type: "radio",
                    options: [
                        { label: "Conseiller", value: "conseiller" },
                        { label: "Directeur", value: "directeur" },
                    ],
                },
            },
        },
    ];

    return (
        <FormWrapper<RegisterAdminPayload>
            title="Créer un nouveau compte"
            data={sections}
            labelButton="Générer"
            loading={mutate.isPending}
            onSubmit={onSubmit}
            form={form}
        />
    );
}

export default function AdminNewUsersPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <AdminNewUsersContent />
        </Suspense>
    );
}
