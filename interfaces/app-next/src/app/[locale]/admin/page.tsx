import { menuItems, menuItemsClients } from "./menu-item";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export default function AdminHomePage() {
    const t = useTranslations("advisor.menu");

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">{t("header.title")}</h1>
                <p className="text-gray-500">{t("header.text")}</p>
            </div>

            {/* Section Général */}
            <section>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">{t("section.general")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {menuItems.slice(1).map((item) => (
                        <Link href={item.href} key={item.labelKey}>
                            <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
                                <CardContent className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                                    <div className="text-gray-700">
                                        {item.icon}
                                    </div>
                                    <p className="font-semibold text-lg">{t(item.labelKey)}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Section Relation Client */}
            <section>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">{t("section.relation")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {menuItemsClients.map((item) => (
                        <Link href={item.href} key={item.labelKey}>
                            <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
                                <CardContent className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                                    <div className="text-gray-700">
                                        {item.icon}
                                    </div>

                                    <p className="font-semibold text-lg">{t(item.labelKey)}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}