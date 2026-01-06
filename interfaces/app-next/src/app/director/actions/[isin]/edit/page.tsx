"use client";
import { useParams } from "next/navigation";
import { ActionId } from "@infrastructure/types/action";
import { ActionForm } from "../../_component";


export default function ActionEditFormPage() {
    const { isin } = useParams<{ isin: ActionId }>();
    return <ActionForm isin={isin} />
}