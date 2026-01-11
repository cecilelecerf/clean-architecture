"use client";

import { useParams } from "next/navigation";
import { FormuleId } from "@infrastructure/types/formule";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { useRouter } from "next/navigation";
import { match } from "ts-pattern";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Bookmark,
  CircleAlert,
  Plus,
  Calculator,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  Shield,
  Percent,
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function FormulesPage() {
  const { formuleId } = useParams<{ formuleId: FormuleId }>();
  const formuleQuery = useQuery(endpoints.formules.get({ formuleId }));
  const router = useRouter();
  const t = useTranslations("client.formulas");

  return match(formuleQuery)
    .with({ status: "pending" }, () => <FormulePageSkeleton />)
    .with({ status: "error" }, () => (
      <div className="rounded-2xl bg-red-500/20 p-8 text-center">
        <p className="text-red-600 font-semibold">
          {t("error")}
        </p>
      </div>
    ))
    .with({ status: "success" }, ({ data: formule }) => {
      if (!formule) return null;

      return (
        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 via-indigo-700 to-purple-800 p-8 md:p-12">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
              <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-yellow-400/20 blur-3xl animate-pulse" />
              <div className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-center">
                <div className="space-y-6 text-white">
                  <Badge className="bg-white/20 hover:bg-white/25 text-white border-white/30 backdrop-blur-sm text-base px-4 py-1.5 w-fit">
                    <Bookmark className="w-4 h-4 mr-2" />
                    {formule.type}
                  </Badge>

                  <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                    {formule.label}
                  </h1>

                  <p className="text-lg text-white/90 leading-relaxed">
                    {formule.description}
                  </p>

                  {formule.isActive ? (
                    <Badge className="bg-green-500/20 text-green-100 border-green-400/30">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t("status.active")}
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/20 text-red-100 border-red-400/30">
                      <Clock className="w-4 h-4 mr-2" />
                      {t("status.inactive")}
                    </Badge>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <RateCard
                      icon={Percent}
                      label={t("rateCard.interest")}
                      value={`${formule.interestRate}%`}
                      highlighted
                    />
                    <RateCard
                      icon={Shield}
                      label={t("rateCard.insurance")}
                      value={`${formule.insuranceRate}%`}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      size="lg"
                      className="flex-1 bg-white text-blue-900 hover:bg-white/90 font-semibold shadow-xl"
                      onClick={() => router.push(`/credits/request/${formule.id}`)}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      {t("ask")}
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      className="flex-1 bg-white/10 text-white border-white/30 hover:bg-white/20 font-semibold backdrop-blur-sm"
                      onClick={() => router.push(`/credits/simulate/${formule.id}`)}
                    >
                      <Calculator className="w-5 h-5 mr-2" />
                      {t("simulate")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conditions & Limits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CircleAlert className="w-5 h-5" />
                {t("conditions.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formule.minAmount && (
                  <ConditionCard
                    icon={ArrowRight}
                    title={t("conditions.minAmount.title")}
                    value={`${formule.minAmount.toLocaleString('fr-FR')} ${formule.currency}`}
                    description={t("conditions.minAmount.description")}
                  />
                )}
                {formule.maxAmount && (
                  <ConditionCard
                    icon={ArrowRight}
                    title={t("conditions.maxAmount.title")}
                    value={`${formule.maxAmount.toLocaleString('fr-FR')} ${formule.currency}`}
                    description={t("conditions.maxAmount.description")}
                  />
                )}
              </div>

              {!formule.minAmount && !formule.maxAmount && (
                <p className="text-center text-gray-500 py-8">
                  {t("conditions.none")}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="bg-linear-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">
                {t("benefits.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BenefitItem
                  icon={CheckCircle}
                  text={t("benefits.rate")}
                />
                <BenefitItem
                  icon={Shield}
                  text={t("benefits.insurance")}
                />
                <BenefitItem
                  icon={Clock}
                  text={t("benefits.fast")}
                />
                <BenefitItem
                  icon={Users}
                  text={t("benefits.support")}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* CTA Final */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center py-8">
            <Button
              size="lg"
              className="bg-linear-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold shadow-lg px-8"
              onClick={() => router.push(`/credits/request/${formule.id}`)}
            >
              <Plus className="w-5 h-5 mr-2" />
              {t("button")}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      );
    })
    .exhaustive();
}

const RateCard = ({
  icon: Icon,
  label,
  value,
  highlighted = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlighted?: boolean;
}) => {
  return (
    <div
      className={`p-6 rounded-xl border backdrop-blur-sm transition-all ${highlighted
        ? "bg-white/25 border-white/40 scale-105 shadow-lg"
        : "bg-white/10 border-white/20 hover:bg-white/15"
        }`}
    >
      <div className="space-y-3">
        <Icon className="w-6 h-6 text-white/80" />
        <p className="text-sm text-white/80 font-medium">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: "blue" | "green" | "purple" | "orange";
}

const StatCard = ({ icon: Icon, label, value, color }: StatCardProps) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
  };

  const textColorClasses = {
    blue: "text-blue-700",
    green: "text-green-700",
    purple: "text-purple-700",
    orange: "text-orange-700",
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5" />
        <p className="text-xs font-medium uppercase tracking-wide opacity-80">
          {label}
        </p>
      </div>
      <p className={`text-2xl font-bold ${textColorClasses[color]}`}>
        {value}
      </p>
    </div>
  );
};

const ConditionCard = ({
  icon: Icon,
  title,
  value,
  description,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  description: string;
}) => {
  return (
    <div className="flex gap-4 p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="shrink-0">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-2xl font-bold text-blue-600">{value}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
};

const BenefitItem = ({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
      <Icon className="w-5 h-5 text-green-600 shrink-0" />
      <p className="text-gray-700 font-medium">{text}</p>
    </div>
  );
};


const FormulePageSkeleton = () => (
  <div className="space-y-8">
    <div className="rounded-2xl bg-gray-200 p-8 md:p-12 space-y-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-12 w-96" />
      <Skeleton className="h-6 w-full max-w-2xl" />
      <div className="grid grid-cols-2 gap-4 mt-8">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <div className="flex gap-4 mt-6">
        <Skeleton className="h-12 flex-1" />
        <Skeleton className="h-12 flex-1" />
      </div>
    </div>
    <StatsSkeleton />
  </div>
);

const StatsSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-48" />
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </CardContent>
  </Card>
);