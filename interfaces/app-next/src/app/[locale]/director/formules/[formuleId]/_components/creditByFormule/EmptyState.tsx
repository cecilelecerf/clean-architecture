
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCardIcon } from 'lucide-react';
import { useTranslations } from "next-intl";

export const EmptyState = ({
    onBack,
    t
}: {
    onBack: () => void;
    t: ReturnType<typeof useTranslations>
}) => (
    <Card>
        <CardContent className="py-12 text-center">
            <CreditCardIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
                {t("none")}
            </h3>
            <p className="text-muted-foreground mb-6">
                {t("nothingAssociate")}
            </p>
            <Button onClick={onBack}>
                {t("back")}
            </Button>
        </CardContent>
    </Card>
);
