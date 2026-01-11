"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const CreditListSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Array.from({ length: 4 }).map((_, j) => (
                            <div key={j} className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 rounded" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="pt-3 border-t space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
);