"use client"
import { endpoints } from "@/utils/endpoint";
import { useQuery } from "@tanstack/react-query";
import { AdminSavingsRateHeroBanner } from "./GetCurrentSavingRate";
import { GetAllSavingsRate, SavingsRatesSkeleton } from "./GetAll";
import { match } from "ts-pattern";

export const WrapperDirectorSavingRate = () => {
    const query = useQuery(endpoints.savingsRates.getCurrent());

    return (
        <>
            <AdminSavingsRateHeroBanner query={query} />
            {match(query)
                .with({ status: "error" }, () => "error")
                .with({ status: "pending" }, () => new Array(5).map((i) => <SavingsRatesSkeleton key={i} />))
                .with({ status: "success" }, ({ data: current }) => <GetAllSavingsRate current={current} />
                ).exhaustive()
            }
        </>
    )
}