import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Percent, Plus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export const EmptyState = ({
    t
}: {
    t: ReturnType<typeof useTranslations>
}) => (
    <Card>
        <CardContent className="py-12 text-center">
            <Percent className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium mb-2">
                {t("nothing")}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
                {t("first")}
            </p>
            <Link href="/director/formules/new">
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    {t("new")}
                </Button>
            </Link>
        </CardContent>
    </Card>
);

