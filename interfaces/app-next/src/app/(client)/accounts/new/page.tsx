"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormWrapper, { Section } from "@/components/FormWrapper";
import { NewAccount, newAccountSchema } from "@infrastructure/types/account";
import { CreditCard, Palette } from "lucide-react";


export default function NewAccountPage() {
  const router = useRouter();
  const currenciesQuery = useQuery(endpoints.currencies.getAll());

  const form = useForm<NewAccount>({
    resolver: zodResolver(newAccountSchema),
  });

  const mutation = useMutation(endpoints.accounts.create());

  const onSubmit = (values: NewAccount) => {
    mutation.mutate(values, {
      onSuccess: () => router.push("/accounts"),
    });
  };

  const sections: Section<NewAccount>[] = [
    {
      title: "Informations générales",
      description: "Détails principaux du compte",
      icon: CreditCard,
      data: {
        name: {
          label: "Nom du compte",
          type: "text",
        },
        type: {
          label: "Type de compte",
          type: "radio",
          options: [
            { label: "Courant", value: "courant" },
            { label: "Épargne", value: "epargne" },
          ],
        },
        currency: {
          label: "Devise",
          type: "select",
          options:
            currenciesQuery.status === "success" ?
              currenciesQuery.data.map((d) => ({ label: ` ${d.code} - ${d.name}(${d.symbol})`, value: d.code, })) : [],
        }
      },
    },
    {
      title: "Apparence",
      description: "Personnalisation visuelle du compte",
      icon: Palette,
      data: {
        color: {
          label: "Couleur",
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
      title="Créer un nouveau compte"
      description="Ajoutez un nouveau compte bancaire"
      form={form}
      data={sections}
      labelButton="Créer"
      loading={mutation.isPending}
      onSubmit={onSubmit}
      showBackButton
    />
  );
}
