"use client"
import { ActionId } from "@infrastructure/types/action";
import ActionDetail from "@/components/actions/ActionDetail";
import { useParams } from "next/navigation";

export default function ActionDetailsPage() {
    const { isin } = useParams<{ isin: ActionId }>();
    return <ActionDetail baseHref="" isin={isin} />
}
