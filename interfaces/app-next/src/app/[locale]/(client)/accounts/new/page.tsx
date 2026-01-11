"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormWrapper, { Section } from "@/components/FormWrapper";
import { NewAccount, newAccountSchema } from "@infrastructure/types/account";
import { CreditCard, Palette } from "lucide-react";
import { useTranslations } from "next-intl";

export default function NewAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currenciesQuery = useQuery(endpoints.currencies.getAll());

  const typeParam = searchParams.get("type") as "courant" | "epargne";

  const form = useForm<NewAccount>({
    resolver: zodResolver(newAccountSchema),
    defaultValues: {
      name: "",
      color: "" as "blue",
      type: typeParam ? typeParam : "" as "courant"
    }
  });

  const mutation = useMutation(endpoints.accounts.create());

  const onSubmit = (values: NewAccount) => {
    mutation.mutate(values, {
      onSuccess: (account) => { console.log("test"); console.log(account); router.push(`/accounts/${account.IBAN}`) },
    });
  };

  const t = useTranslations("client.account.new");

  const sections: Section<NewAccount>[] = [
    {
      title: t("form.title"),
      description: t("form.description"),
      icon: CreditCard,
      data: {
        name: {
          label: t("form.fields.name"),
          type: "text",
        },
        type: {
          label: t("form.fields.type"),
          type: "radio",
          options: [
            { label: t("form.fields.options.running"), value: "courant" },
            { label: t("form.fields.options.saving"), value: "epargne" },
          ],
        },
        currency: {
          label: t("form.fields.currency"),
          type: "select",
          options:
            currenciesQuery.status === "success" ?
              currenciesQuery.data.map((d) => ({ label: ` ${d.code} - ${d.name}(${d.symbol})`, value: d.code, })) : [],
        }
      },
    },
    {
      title: t("form.color.title"),
      description: t("form.color.description"),
      icon: Palette,
      data: {
        color: {
          label: t("form.color.label"),
          type: "icon",
          options: [
            { icon: "🔴", label: "", value: "red" },
            { icon: "🔵", label: "", value: "blue" },
            { icon: "🟡", label: "", value: "yellow" },
            { icon: "🟢", label: "", value: "green" },
            { icon: "🟠", label: "", value: "orange" },
            { icon: "🟣", label: "", value: "purple" },
          ],
        },
      }
    },
  ];

  return (
    <FormWrapper<NewAccount>
      title={t("title")}
      description={t("description")}
      form={form}
      data={sections}
      labelButton={t("button")}
      loading={mutation.isPending}
      onSubmit={onSubmit}
      showBackButton
    />
  );
}
