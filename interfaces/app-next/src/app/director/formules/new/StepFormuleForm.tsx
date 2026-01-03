import FormWrapper, { Field as TField } from '@/components/FromWrapper';
import { useMutation, useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";

type FormuleFormData = {
  interestRate: string;
  insuranceRate: string;
  type: string;
  label: string;
  description: string;
  minAmount?: string;
  maxAmount?: string;
  currency: string;
};

export const StepFormuleForm = ({data, setData, onSubmit, loading}: {data: FormuleFormData, setData: (data: Partial<FormuleFormData>) => void, onSubmit: () => void, loading: boolean}) => {
    const query = useQuery(endpoints.formules.getTypes());
    
    const typeOptions = (query.data || []).map((t) => ({
        label: t.type,
        value: t.type,
    }));

    const fields: TField[] = [
        {
            label: 'Taux d\'interêt',
            type: 'number',
            get: data.interestRate.toString(),
            set: (e) => setData({ interestRate: e as string }),
            numberOptions: {
                min: 0,
                step: 0.01,
            },
        },
        {
            label: 'Taux d\'assurance',
            type: 'number',
            get: data.insuranceRate.toString(),
            set: (e) => setData({ insuranceRate: e as string }),
            numberOptions: {
                min: 0,
                step: 0.01,
            },
        },
        {
            label: "Type de prêt",
            type: "creatable-select",
            placeholder: "Sélectionnez ou créez un type",
            get: data.type,
            set: (value) => setData({ type: value as string }),
            options: typeOptions,
            disabled: query.isLoading,
        },
        {
            label: "Label",
            type: "text",
            get: data.label,
            set: (e) => setData({ label: e as string })
        },
        {
            label: "Description",
            type: "textarea",
            get: data.description,
            set: (e) => setData({ description: e as string })
        },
        {
            label: 'Montant minimum',
            type: 'number',
            get: data.minAmount.toString(),
            set: (e) => setData({ minAmount: e === '' ? undefined : e as string}),
            numberOptions: {
                min: 0,
                step: 1,
            },
        },
        {
            label: 'Montant maximum',
            type: 'number',
            get: data.maxAmount.toString(),
            set: (e) => setData({ maxAmount: e === '' ? undefined : e as string}),
            numberOptions: {
                min: 0,
                step: 1,
            },
        },
        {
            label: "Devise",
            type: "select",
            get: data.currency,
            set: (e) => setData({ currency: e as string }),
            options: [
                { label: "Euro", value: "EUR", icon: "" },
                { label: "Dollar américain", value: "USD", icon: "" },
                { label: "Livre sterling", value: "GBP", icon: "" },
            ]
        },
    ]

    const mutation = useMutation(endpoints.formules.create());

    return (
        <form
        onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
        }}>
            <FormWrapper
                title="Nouveau prêt"
                description="Créer une formule d'un prêt"
                fields={fields}
                button="Enregistrer"
                loading={loading}
            ></FormWrapper>
        </form>
    )
}