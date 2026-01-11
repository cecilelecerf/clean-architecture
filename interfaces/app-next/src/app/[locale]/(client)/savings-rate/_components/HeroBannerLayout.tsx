import { Skeleton } from '@/components/ui/skeleton';
import { ReactNode } from 'react';

export function HeroBannerLayout({ children }: { children: ReactNode }) {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-cyan-700 via-blue-600 to-indigo-700">
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-yellow-400/20 blur-3xl animate-pulse" />
                <div className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative p-6">
                {children}
            </div>
        </div>
    );
}
export const HeroBannerSkeleton = () => (
    <div className="rounded-2xl bg-linear-to-br from-gray-200 to-gray-300 px-6 py-8 md:px-10 md:py-12 lg:px-16 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <Skeleton className="h-8 w-48 rounded-full" />
                <Skeleton className="h-24 w-64" />
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-20 w-full max-w-xl" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
            </div>
        </div>
    </div>
);