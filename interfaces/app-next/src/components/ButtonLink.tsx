"use client"
import { ReactNode } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

<<<<<<< HEAD:interfaces/app-next/src/components/ButtonLink.tsx
export const ButtonLink = ({ children, path, }: { children: ReactNode, path: string }) => {
    const router = useRouter()
    return <div className="mt-6 w-full flex justify-center">
        <Button
            className=" w-1/3 mx-auto"
=======
export const ButtonLink = ({ children, path }: { children: ReactNode, path: string }) => {
    const router = useRouter()
    return <div className="mt-6 w-full flex justify-center">
        <Button
            className=" w-2/3 mx-auto"
>>>>>>> 2ce9cab (thread):interfaces/web/app-next/src/components/ButtonLink.tsx
            onClick={() => router.push(path)}
        >
            {children}
        </Button>
    </div>
}