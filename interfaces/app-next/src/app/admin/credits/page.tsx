import { CreditsSkeleton } from "@/components/credits/CreditArraySkeleton";
import { Suspense } from "react";
import { CreditsContent } from "./_components/CreditsContent";

export default function AdminHomePage() {
    return (
        <Suspense fallback={<CreditsSkeleton />}>
            <CreditsContent />
        </Suspense>
    );

}
