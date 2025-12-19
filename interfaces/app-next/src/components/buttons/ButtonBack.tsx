"use client"
import { ArrowLeft } from "lucide-react"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"

export const ButtonBack = () => {
    const router = useRouter()
    return (
        <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Retour</h1>
        </div>)
}