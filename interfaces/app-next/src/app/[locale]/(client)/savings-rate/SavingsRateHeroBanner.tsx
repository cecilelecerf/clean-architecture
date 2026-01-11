"use client";

import { endpoints } from "@/utils/endpoint";
import { useQuery } from "@tanstack/react-query";
import { match } from "ts-pattern";
import { HeroBannerLayout, HeroBannerSkeleton } from "./_components/HeroBannerLayout";
import { HeroBannerContent } from "./_components/HeroBannerContent";

export function SavingsRateHeroBanner() {
    const query = useQuery(endpoints.savingsRates.getCurrent());


    return <HeroBannerLayout>
        {match(query)
            .with({ status: "pending" }, () => <HeroBannerSkeleton />)
            .with({ status: "error" }, () => null)
            .with({ status: "success" }, ({ data: currentRate }) => {
                if (!currentRate) return null;
                return (
                    <HeroBannerContent currentRate={currentRate} />
                );
            })
            .exhaustive()}
    </HeroBannerLayout>

}




