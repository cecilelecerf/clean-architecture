"use client";

import FormWrapper, { Section } from "@/components/FormWrapper";
import { endpoints } from "@/utils/endpoint";
import { RegisterAdminPayload, registerAdminPayload, User } from "@infrastructure/types/user";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Mail, User as UserIcon, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

export const isValidUserRole = (value: string | null): value is User["role"] => {
    return value !== null && ["client", "conseiller", "directeur"].includes(value);
};

function AdminNewUsersContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const roleParam = searchParams.get("role");

    const t = useTranslations("director.user.new");
    const tForm = useTranslations("director.user.new.form");

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
            title: tForm("personal.title"),
            description: tForm("personal.description"),
            icon: UserIcon,
            data: {
                firstname: {
                    label: tForm("personal.fields.firstname"),
                    type: "text",
                },
                lastname: {
                    label: tForm("personal.fields.lastname"),
                    type: "text",
                },
            },
        },
        {
            title: tForm("account.title"),
            description: tForm("account.description"),
            icon: Mail,
            data: {
                email: {
                    label: tForm("account.fields.email"),
                    type: "email",
                },
            },
        },

        {
            title: tForm("role.title"),
            description: tForm("role.description"),
            icon: Shield,
            data: {
                role: {
                    label: tForm("role.fields.role.label"),
                    type: "radio",
                    options: [
                        { label: tForm("role.fields.role.options.advisor"), value: "conseiller" },
                        { label: tForm("role.fields.role.options.director"), value: "directeur" },
                    ],
                },
            },
        },
    ];

    return (
        <FormWrapper<RegisterAdminPayload>
            title={t("title")}
            data={sections}
            labelButton={t("button")}
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
