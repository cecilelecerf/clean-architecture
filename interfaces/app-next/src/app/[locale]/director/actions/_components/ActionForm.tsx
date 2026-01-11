
import { Building2, FileText, Settings } from "lucide-react";
import { Section } from "@/components/FormWrapper";
import { ActionId, NewAction, UpdateAction } from "@infrastructure/types/action";
import { useTranslations } from "next-intl";
import { CreateActionForm, EditActionForm } from "./client-component";

export const ActionForm = ({ isin }: { isin?: ActionId }) => {
    const tForm = useTranslations("director.stocks.new.form");
    const tFormUpdate = useTranslations("director.stocks.update.form");

    const sections = [
        {
            title: tForm("identification.title"),
            description: tForm("identification.description"),
            icon: FileText,
            data: {
                symbol: { label: tForm("identification.description.fields.symbol"), type: "text" },
                name: { label: tForm("identification.description.fields.name"), type: "text" },
            },
        },
        {
            title: tForm("market.title"),
            description: tForm("market.description"),
            icon: Building2,
            data: {
                market: {
                    label: tForm("identification.description.fields.market.label"), type: "radio",
                    options:
                        [{ label: tForm("identification.description.fields.market.options.NASDAQ"), value: "NASDAQ" },
                        { label: tForm("identification.description.fields.market.options.NYSE"), value: "NYSE" },
                        { label: tForm("identification.description.fields.market.options.EURONEXT_PARIS"), value: "Euronext Paris" },
                        { label: tForm("identification.description.fields.market.options.LSE"), value: "LSE" },
                        { label: tForm("identification.description.fields.market.options.DAX"), value: "DAX" },
                        { label: tForm("identification.description.fields.market.options.OTHER"), value: "Autre" },],
                }, activitySector:
                    { label: tForm("identification.description.fields.activitySector"), type: "text", },
            },
        },
        {
            title: tForm("settings.title"),
            description: tForm("settings.description"),
            icon: Settings,
            data: {
                isAvailable:
                {
                    label: tForm("settings.description.fields.isAvailable"),
                    type: "switch",
                },
            },
        },];
    return isin ? <EditActionForm
        isin={isin}
        sections={sections as Section<UpdateAction>[]}
        t={tFormUpdate} /> : <CreateActionForm
        sections={sections as Section<NewAction>[]}
        tForm={tForm}
        t={tFormUpdate} />;

};

