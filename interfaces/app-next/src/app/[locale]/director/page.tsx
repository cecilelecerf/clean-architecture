import { Flex } from "@radix-ui/themes";
import { menuItems } from "./menu-item";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function AdminHomePage() {
    const t = useTranslations("director.menu");

    return (
        <Flex gap="8" className="flex-wrap w-full" justify="center" align="center">
            {menuItems.slice(1).map((item) =>
                <Link
                    href={item.href}
                    key={item.labelKey}
                    className="flex flex-col justify-center items-center gap-2 p-5 w-50 h-50 shadow rounded-lg hover:shadow-xl transition-all font-semibold text-center text-xl dark:shadow-black/30">
                    {item.icon}
                    <p >{t(item.labelKey)}</p>
                </Link>
            )}
        </Flex>)

}
