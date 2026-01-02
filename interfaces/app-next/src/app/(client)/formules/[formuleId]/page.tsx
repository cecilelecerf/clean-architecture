"use client"
import { useParams } from "next/navigation";
import { FormuleId } from "@infrastructure/types/formule";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { useRouter } from "next/navigation";
import { match } from "ts-pattern";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";
import {
    Bookmark,
    CircleAlert,
    Plus,
    NotebookPen 
} from "lucide-react";

export default function FormulesPage() {
    const { formuleId } = useParams<{ formuleId: FormuleId }>();
    const query = useQuery(endpoints.formules.get({ formuleId: formuleId }))
    const router = useRouter()

    return match(query)
        .with({ status: "pending" }, () => <FormuleHeroSkeleton />)
        .with({ status: "error" }, () => (
        <div className="rounded-2xl bg-red-500/20 p-8 text-center text-white">
            Impossible de charger la formule.
        </div>
        ))
        .with({ status: "success" }, ({ data: formule }) => {
        if (!formule) return null;

        return (
            <>
            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 via-indigo-700 to-purple-800 p-8 md:p-12">
                {/* Motif de fond animé */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-yellow-400/20 blur-3xl animate-pulse" />
                    <div className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl animate-pulse delay-1000" />
                </div>

                {/* Contenu */}
                <div className="relative px-6 py-8 md:px-10 md:py-12 lg:px-16 lg:py-16">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-center">
                        <div className="space-y-6 text-white">
                            <Badge className="bg-white/20 hover:bg-white/25 text-white border-white/30 backdrop-blur-sm text-base px-4 py-1.5 w-fit">
                                <Bookmark  className="w-4 h-4 mr-2" />
                                {formule.type}
                            </Badge>

                            <div className="flex items-center justify-between">
                                <h1 className="text-4xl md:text-5xl font-bold">{formule.label}</h1>
                            </div>
                            <p>{formule.description}</p>
                        </div>

                        <div className="space-y-4 text-white">
                            <FormuleCard label="Taux d'intérêt" value={`${formule.interestRate}%`} highlighted />
                            <FormuleCard label="Taux d'assurance" value={`${formule.insuranceRate}%`} />

                            <div className="flex w-full justify-center gap-2">
                                <Button
                                    size="lg"
                                    className="bg-white text-blue-900 hover:bg-white/90 font-semibold shadow-xl"
                                    onClick={() => router.push(`/credits/request/${formule.id}`)}
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Faire une demande
                                </Button>

                                <Button
                                    size="lg"
                                    className="bg-white text-blue-900 hover:bg-white/90 font-semibold shadow-xl"
                                    onClick={() => router.push("/director/savings-rate/new")}
                                >
                                    <NotebookPen className="w-5 h-5 mr-2" />
                                    Faire une simulation
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <CircleAlert className="w-5 h-5" />
                    Règles (?)
                       
                </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {formule.minAmount && <InfoCard title="Montant minimum" value={`${formule.minAmount.toLocaleString()}${formule.currency}`} badge="" />}
                        {formule.maxAmount && <InfoCard title="Montant minimum" value={`${formule.maxAmount.toLocaleString()}${formule.currency}`} badge="" />}
                        
                    </div>
            </div>
            </>
        );
        })
        .exhaustive();
}

const FormuleCard = ({
  label,
  value,
  highlighted = false,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
}) => {
  return (
    <div
      className={`p-4 rounded-xl border backdrop-blur-sm transition-all ${
        highlighted
          ? "bg-white/25 border-white/40 scale-105 shadow-lg"
          : "bg-white/10 border-white/20 hover:bg-white/15"
      }`}
    >
      <div className="space-y-2">
        {/* Label */}
        <p className="text-sm text-white/80 font-medium">{label}</p>
        {/* Value */}
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

const InfoCard = ({ 
    title, 
    value, 
    badge 
}: {
    title: string,
    value: string,
    badge?: string
    }) => {
  return (
    <Card className="hover:shadow-md hover:scale-105 transition-all">
      <CardContent className="space-y-4">
        {badge && <div>{badge}</div>}
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <div className="text-gray-600">{value}</div>
      </CardContent>
    </Card>
  );
};


const FormuleHeroSkeleton = () => (
  <div className="rounded-2xl bg-gray-200/20 p-8 md:p-12 space-y-6">
    <Skeleton className="h-10 w-64 rounded" />
    <Skeleton className="h-6 w-48 rounded" />
    <Skeleton className="h-6 w-full rounded" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32 rounded" />
        <Skeleton className="h-5 w-32 rounded" />
        <Skeleton className="h-5 w-48 rounded" />
        <Skeleton className="h-4 w-40 rounded" />
      </div>
      <div className="flex flex-col justify-center gap-4">
        <Skeleton className="h-10 w-full rounded" />
        <Skeleton className="h-10 w-full rounded" />
      </div>
    </div>
  </div>
);
