"use client";

import { useParams } from "next/navigation";
import { FormuleId } from "@infrastructure/types/formule";
import { UpdateFormuleForm } from "./UpdateFormuleForm";
import { useQueries } from "@tanstack/react-query";
import { match } from "ts-pattern";
import { endpoints } from "@/utils/endpoint";

export default function UpdateFormulePage() {
    const { formuleId } = useParams<{ formuleId: FormuleId }>();
    const queries = useQueries({
        queries: [
            endpoints.formules.get({ formuleId }),
            endpoints.formules.getTypes()]
    })


    return match(queries)
        .when(
            (queries) => queries.some((q) => q.status === "error"),
            () => "errors"
        )
        .when(
            (queries) => queries.every((q) => q.status === "success"),
            ([{ data: formule }, { data: types }],) => (
                <UpdateFormuleForm formule={formule} types={types} />)
        )
        .otherwise(() => "pending")


}