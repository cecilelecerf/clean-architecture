"use client"

import { Plus } from "lucide-react"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

export const GoToAddPage = ({ path }: { path: string }) => {
    const router = useRouter();
    const t = useTranslations("director.message");
    
    return (
        <Button
            className="fixed bottom-3 right-3 group flex items-center justify-center overflow-hidden w-12 h-12 transition-all duration-300 hover:w-auto gap-0"
            onClick={() => router.push(path)}
        >
            <Plus />
            <span className="opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
                {t("add")}
            </span>
        </Button>
    )
}