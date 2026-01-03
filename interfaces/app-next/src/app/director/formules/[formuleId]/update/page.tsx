"use client";

import { useParams } from "next/navigation";
import { FormuleId } from "@infrastructure/types/formule";
import { UpdateFormuleForm } from "./UpdateFormuleForm";

export default function UpdateFormulePage() {
    const { formuleId } = useParams<{ formuleId: FormuleId }>();

    return <UpdateFormuleForm formuleId={formuleId} />;
}