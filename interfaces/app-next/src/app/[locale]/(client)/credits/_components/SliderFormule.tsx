"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { endpoints } from "@/utils/endpoint"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { match } from "ts-pattern"
import Autoplay from "embla-carousel-autoplay"
import Link from "next/link"

export const SliderFormule = () => {

    const query = useQuery(endpoints.formules.getAllActive())
    const router = useRouter()
    return (
        <div className="mt-12 ">
            <div className="mb-2 flex justify-between">
                <h1 className="text-xl font-semibold">Crédits disponibles</h1>
                <Button variant="link">
                    <Link href="/credits/formules">
                        Voir +
                    </Link>
                </Button>
            </div>
            {
                match(query)
                    .with(({ status: "error" }), () => "error")
                    .with((({ status: "pending" })), () => "pengin")
                    .with((({ status: "success" })), ({ data: formules }) => (
                        <Carousel
                            opts={{
                                align: "start",
                            }}
                            className="w-full"
                            plugins={[
                                Autoplay({
                                    delay: 2000,
                                }),
                            ]}
                        >
                            <CarouselContent className="py-2">
                                {formules.map((formule, index) => (
                                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                        <Card
                                            key={formule.id}
                                            className="hover:shadow-md transition-shadow cursor-pointer h-full"
                                            onClick={() => router.push(`credits/formules/${formule.id}`)}
                                        >
                                            <CardContent className="p-4 space-y-3">
                                                {/* En-tête */}
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="font-semibold text-lg line-clamp-1 flex-1">
                                                        {formule.label}
                                                    </h3>
                                                    <Badge
                                                        variant={formule.isActive ? "default" : "secondary"}
                                                        className="shrink-0"
                                                    >
                                                        {formule.isActive ? "Active" : "Inactive"}
                                                    </Badge>
                                                </div>

                                                {/* Description */}
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {formule.description}
                                                </p>

                                                {/* Taux */}
                                                <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
                                                    <div className="space-y-1">
                                                        <p className="text-xs text-muted-foreground">Intérêt</p>
                                                        <p className="font-semibold">{formule.interestRate}%</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-xs text-muted-foreground">Assurance</p>
                                                        <p className="font-semibold">{formule.insuranceRate}%</p>
                                                    </div>
                                                </div>

                                                {/* Montants */}
                                                {formule.minAmount !== undefined &&
                                                    formule.maxAmount !== undefined && (
                                                        <div className="text-sm text-muted-foreground pt-2 border-t">
                                                            {formule.minAmount.toLocaleString('fr-FR')}€ - {formule.maxAmount.toLocaleString('fr-FR')}€
                                                        </div>
                                                    )}

                                                {/* Bouton */}
                                                <Button
                                                    variant="outline"
                                                    className="w-full"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/credits/formules/${formule.id}`);
                                                    }}
                                                >
                                                    Voir détails
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    )).exhaustive()
            }
        </div>)
}