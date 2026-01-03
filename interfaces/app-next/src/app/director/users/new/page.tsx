"use client"
import { RegisterAdminPayload } from "@/app/api/users/new/route";
import FormWrapper, { Field } from "@/components/FromWrapper";
import { endpoints } from "@/utils/endpoint";
import { UserEntity } from "@domain/entities/UserEntity";
import { User } from "@infrastructure/types/user";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

export const isValidUserRole = (value: string | null): value is User["role"] => {
    return value !== null && ["client", "conseiller", "directeur"].includes(value);
}

function AdminNewUsersContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const roleParam = searchParams.get('role');

    const getRoleFromParam = (param: string | null): User["role"] | undefined => {
        if (param === "advisor") return "conseiller";
        if (param === "director") return "directeur";
        if (isValidUserRole(param)) return param;
        return undefined;
    };

    const role = getRoleFromParam(roleParam);

    const [field, setField] = useState<RegisterAdminPayload>({
        firstname: "",
        lastname: "",
        email: "",
        role: role ?? undefined
    });

    const fields: Field[] = [
        {
            label: 'Prénom',
            get: field.firstname,
            set: (e) => setField((prev) => ({
                ...prev,
                firstname: Array.isArray(e) ? e[0] : e
            })),
        },
        {
            label: 'Nom de famille',
            get: field.lastname,
            set: (e) => setField((prev) => ({
                ...prev,
                lastname: Array.isArray(e) ? e[0] : e
            })),
        },
        {
            label: 'Email',
            get: field.email,
            set: (e) => setField((prev) => ({
                ...prev,
                email: Array.isArray(e) ? e[0] : e
            })),
            type: "email"
        },
        {
            label: "Rôles",
            get: field.role,
            set: (e) => setField((prev) => ({
                ...prev,
                role: Array.isArray(e) ? e[0] as UserEntity["role"] : e as UserEntity["role"]
            })),
            type: "radio",
            options: [
                {
                    label: "Conseiller",
                    value: "conseiller" as UserEntity["role"]
                },
                {
                    label: "Directeur",
                    value: "directeur" as UserEntity["role"]
                }
            ]
        }
    ];

    const mutate = useMutation(endpoints.users.create());

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutate.mutate(
            { payload: field },
            {
                onSuccess: () => {
                    const redirectParam = role === "conseiller"
                        ? "advisor"
                        : role === "directeur"
                            ? "director"
                            : "";
                    router.push(`/director/users${redirectParam ? `?role=${redirectParam}` : ""}`);
                }
            }
        );
    };

    const visibleFields = role
        ? fields.filter((field) => field.label !== "Rôles")
        : fields;

    return (
        <form onSubmit={onSubmit}>
            <FormWrapper
                title="Créer un nouveau compte"
                fields={visibleFields}
                button="Générer"
                loading={mutate.isPending}
            />
        </form>
    );
}

export default function AdminNewUsersPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <AdminNewUsersContent />
        </Suspense>
    );
}