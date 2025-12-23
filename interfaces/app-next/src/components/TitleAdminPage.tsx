"use client"
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export const TitleAdminPage = ({ title }: { title?: string }) => {
    const router = useRouter()
    return (
        <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon-lg" onClick={() => router.back()}>
                <ArrowLeft className="w-7 h-7" />
            </Button>
            <h1 className="text-2xl font-bold">{title ?? "Retour"}</h1>
        </div>
    )
}