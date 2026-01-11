"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const FormuleInfoSkeleton = () => (
    <div className="p-2 space-y-4">
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="grid gap-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex items-start justify-between py-2 border-b last:border-0"
                        >
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 rounded" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-4 w-24" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
            <Skeleton className="h-10 w-32" />
        </div>
    </div>
);