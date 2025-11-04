"use client"
import { ReactNode } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export const ButtonLink = ({ children, path }: { children: ReactNode, path: string }) => {
    const router = useRouter()
    return <div className="mt-6 w-full flex justify-center">
        <Button
            className=" w-1/3 mx-auto"
            onClick={() => router.push(path)}
        >
            {children}
        </Button>
    </div>
}