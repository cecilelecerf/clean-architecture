"use client";

import { useRouter } from "next/navigation";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Action } from "@infrastructure/types/action";
import { ActionCard } from "@/components/actions/actionList/ActionCard";

export const ActionsCarousel = ({ actions }: { actions: Action[] }) => {
    const router = useRouter();

    return (
        <div className="relative group">
            <Carousel
                opts={{
                    align: "start",
                }}
                className="w-full"
                plugins={[
                    Autoplay({
                        delay: 2000,
                    }),
                ]}>
                <CarouselContent className="py-2">
                    {actions.map((action) => (
                        <CarouselItem key={action.ISIN} className="md:basis-1/2 lg:basis-1/3">
                            <ActionCard action={action} onClick={() => router.push(`/actions/${action.ISIN}`)} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div >
    );
}