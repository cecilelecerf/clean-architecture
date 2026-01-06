"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Action } from "@infrastructure/types/action";



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
                            <Card
                                key={action.ISIN}
                                className="min-w-[280px] md:min-w-[320px] cursor-pointer hover:shadow-lg transition-all snap-start shrink-0 py-0"
                                onClick={() => router.push(`/actions/${action.ISIN}`)}
                            >
                                <CardContent className="p-5">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-blue-600 text-xl mb-1">
                                                    {action.symbol}
                                                </h3>
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {action.name}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                                        </div>

                                        {/* Prix */}
                                        <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg p-3">
                                            <p className="text-xs text-gray-600 mb-1">Prix actuel</p>
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {action.price.amount.toLocaleString("fr-FR", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {action.price.currency}
                                                </p>
                                            </div>
                                            {/* {action.priceChange !== undefined && (
                                                <div
                                                    className={`flex items-center gap-1 mt-2 text-sm font-semibold ${action.priceChange >= 0
                                                        ? "text-green-600"
                                                        : "text-red-600"
                                                        }`}
                                                >
                                                    {action.priceChange >= 0 ? (
                                                        <TrendingUp className="w-4 h-4" />
                                                    ) : (
                                                        <TrendingDown className="w-4 h-4" />
                                                    )}
                                                    <span>
                                                        {action.priceChange >= 0 ? "+" : ""}
                                                        {action.priceChange.toFixed(2)}%
                                                    </span>
                                                </div>
                                            )} */}
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline" className="text-xs">
                                                {action.market}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                                {action.activitySector}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>



        </div >
    );
}