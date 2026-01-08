"use client";

import { useParams } from "next/navigation";
import { ActionId } from "@infrastructure/types/action";
import ActionDetail from "@/components/actions/ActionDetail";

export default function ActionDetailsPage() {
    const { isin } = useParams<{ isin: ActionId }>();
    return <ActionDetail isin={isin} isAdmin baseHref="/director" />
}