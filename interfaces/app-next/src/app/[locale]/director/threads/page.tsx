import { getTranslations } from "next-intl/server";
import ClientsThreadsPageClient from "./page-client";

export default async function ClientsThreadsPage() {
    const t = await getTranslations("director.message");

    const translations = {
        not: t("not"),
        title: "Conversations",
    };

    return (
        <ClientsThreadsPageClient translations={translations} />
    );
}