import { SignOutButton } from "@/components/SignOutButton";
import { Card } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export const LogoutCard = ({
    t
}: {
    t: ReturnType<typeof useTranslations>
}) => (
    <Card className="p-4 md:p-6">
        <div className="flex flex-col gap-4">
            <div>
                <h3 className="font-semibold">{t("logout.title")}</h3>
                <p className="text-sm text-gray-500">{t("logout.text")}</p>
            </div>
            <SignOutButton variant="destructive" className="w-full" />
        </div>
    </Card>
);
