import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown, ArrowRight } from "lucide-react";

export const TransactionDetailSkeleton = () => (
    <>
        <Card className="rounded-2xl shadow-lg border-0 bg-linear-to-br from-blue-800 to-blue-500">
            <CardContent className="flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-6 w-40 bg-white/20" />
                    <Skeleton className="h-4 w-24 bg-white/20" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-16 bg-white/20" />
                    <Skeleton className="h-9 w-32 bg-white/20" />
                </div>
                <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
                    <Skeleton className="h-3 w-32 bg-white/20" />
                    <Skeleton className="h-4 w-24 bg-white/20" />
                </div>
            </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row items-center gap-4 my-6">
            <Card className="w-full md:flex-1 rounded-xl shadow-md border-2">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-40" />
                        </div>
                    </div>
                    <div className="rounded-lg p-3 bg-gray-50 space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-28" />
                    </div>
                </CardContent>
            </Card>

            <div className="shrink-0">
                <ArrowDown className="w-6 h-6 text-gray-400 md:hidden" />
                <ArrowRight className="w-6 h-6 text-gray-400 hidden md:block" />
            </div>

            <Card className="w-full md:flex-1 rounded-xl shadow-md border-2">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-40" />
                        </div>
                    </div>
                    <div className="rounded-lg p-3 bg-gray-50 space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-28" />
                    </div>
                </CardContent>
            </Card>
        </div>
    </>
);