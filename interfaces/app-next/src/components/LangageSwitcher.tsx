"use client";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { useLocale } from "next-intl";
import { useTransition } from "react";
import { Switch } from "./ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { cn } from "@/lib/utils";

export const LangageSwitcher = () => {
    const pathname = usePathname();
    const router = useRouter();
    const locale = useLocale();
    const [isPending, startTransition] = useTransition();

    const handleLocaleChange = (checked: boolean) => {
        const newLocale = checked ? 'en' : 'fr';
        startTransition(() => {
            // @ts-expect-error -- TypeScript will validate that the path matches the route schema at runtime
            router.replace(pathname, { locale: newLocale });
        });
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center gap-3 rounded-full">
                        <div className="flex items-center gap-1.5">
                            <span
                                className={cn(
                                    "text-base transition-all",
                                    locale === 'fr' ? "font-semibold" : "opacity-50"
                                )}
                            >
                                🇫🇷
                            </span>
                        </div>

                        <Switch
                            checked={locale === 'en'}
                            onCheckedChange={handleLocaleChange}
                            disabled={isPending}
                        />

                        <span
                            className={cn(
                                "text-base transition-all",
                                locale === 'en' ? "font-semibold" : "opacity-50"
                            )}
                        >
                            🇬🇧
                        </span>

                        {isPending && (
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="text-xs">
                        {locale === 'fr' ? 'Passer en anglais' : 'Switch to French'}
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};