import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface EmptyActionsStateProps {
    hasSearch: boolean;
    isAdmin?: boolean;
    onAddNew: () => void;
    t: ReturnType<typeof useTranslations>;
}

export const EmptyActionsState = ({
    hasSearch,
    isAdmin,
    onAddNew,
    t
}: EmptyActionsStateProps) => (
    <Card>
        <CardContent className="p-8 text-center space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {hasSearch ? t("notfound") : t("notsave")}
            </p>

            {!hasSearch && isAdmin && (
                <Button
                    onClick={onAddNew}
                    variant="outline"
                    size="sm"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {t("add")}
                </Button>
            )}
        </CardContent>
    </Card>
);

