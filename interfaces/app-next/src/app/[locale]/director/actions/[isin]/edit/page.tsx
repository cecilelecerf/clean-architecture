"use client";
import { useParams } from "next/navigation";
import { ActionId } from "@infrastructure/types/action";
import { ActionForm } from "../../_components/ActionForm";


export default function ActionEditFormPage() {
    const { isin } = useParams<{ isin: ActionId }>();
    return <ActionForm isin={isin} />
}