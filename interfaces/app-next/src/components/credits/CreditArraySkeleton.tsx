import { Card, CardContent, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export const CreditsSkeleton = () => (
    <>
        {/* Mobile Skeleton */}
        <div className="md:hidden space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between">
                            <Skeleton className="h-6 w-24 rounded-full" />
                        </div>
                        <Skeleton className="h-8 w-32" />
                        <div className="grid grid-cols-2 gap-3">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Skeleton className="h-9 flex-1" />
                            <Skeleton className="h-9 flex-1" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>

        {/* Desktop Skeleton */}
        <Card className="hidden md:block">
            <CardHeader>
                <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="p-0">
                <div className="space-y-2 p-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </CardContent>
        </Card>
    </>
);