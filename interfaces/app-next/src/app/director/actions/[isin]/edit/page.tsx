"use client";

import { useParams } from "next/navigation";
import { ActionId } from "@infrastructure/types/action";
import { ActionForm } from "../../_component";


export default function ActionFormPage() {
    const { isin } = useParams<{ isin?: ActionId }>();
    <ActionForm isin={isin} />
}