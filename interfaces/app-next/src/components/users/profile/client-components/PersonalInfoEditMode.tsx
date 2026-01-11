"use client"
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    User,
    Mail,
    Calendar,
    Shield,
    Edit,
    Save,
    X,
    LogOut,
    Phone,
    MapPin,
    Cake,
    LucideIcon,
} from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { match } from "ts-pattern";
import { UpdateClientPayload, User as TUser, UserId } from "@infrastructure/types/user";
import { ClientStatistics } from "../../_components/ClientStatistics";
import { AdvisorStatistics } from "../../_components/AdvisorStatistics";
import { DirectorStatistics } from "../../_components/DirectorStatistics";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { ProfileSkeleton } from "../server-components/ProfileSkeleton";
import { Wrapper } from "./Wrapper";


export const PersonalInfoEditMode = ({
    formData,
    setFormData,
    t
}: {
    formData: UpdateClientPayload;
    setFormData: React.Dispatch<React.SetStateAction<UpdateClientPayload>>;
    t: ReturnType<typeof useTranslations>;
}) => {
    return (
        <>
            <FormField
                id="firstname"
                label={t("personal.firstname")}
                value={formData.firstname}
                onChange={(value) => setFormData(prev => ({ ...prev, firstname: value }))}
            />
            <FormField
                id="lastname"
                label={t("personal.lastname")}
                value={formData.lastname}
                onChange={(value) => setFormData(prev => ({ ...prev, lastname: value }))}
            />
            <FormField
                id="email"
                label={t("personal.email")}
                type="email"
                value={formData.email}
                onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
            />
            <FormField
                id="phoneNumber"
                label={t("personal.phone")}
                value={formData.phoneNumber || ""}
                onChange={(value) => setFormData(prev => ({ ...prev, phoneNumber: value }))}
                placeholder="+33 6 12 34 56 78"
            />
            <FormField
                id="dateOfBirth"
                label={t("personal.dateOfBirth")}
                type="date"
                value={formData.dateOfBirth || ""}
                onChange={(value) => setFormData(prev => ({ ...prev, dateOfBirth: value }))}
            />
            <div>
                <Label htmlFor="sexe" className="mb-2">{t("personal.sexe")}</Label>
                <Select
                    value={formData.sexe}
                    onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        sexe: value as "girl" | "boy" | "other"
                    }))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="boy">Homme</SelectItem>
                        <SelectItem value="girl">Femme</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="md:col-span-2">
                <FormField
                    id="address"
                    label={t("personal.address")}
                    value={formData.address?.address || ""}
                    onChange={(value) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address!, address: value }
                    }))}
                    placeholder="Rue"
                />
            </div>
            <FormField
                id="city"
                label={t("personal.city")}
                value={formData.address?.city || ""}
                onChange={(value) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address!, city: value }
                }))}
                placeholder="Ville"
            />
            <FormField
                id="postalCode"
                label={t("personal.postalCode")}
                value={formData.address?.postalCode || ""}
                onChange={(value) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address!, postalCode: value }
                }))}
                placeholder="75001"
            />
            <FormField
                id="country"
                label={t("personal.country")}
                value={formData.address?.country || ""}
                onChange={(value) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address!, country: value }
                }))}
                placeholder="France"
            />
        </>
    );
}


const FormField = ({
    id,
    label,
    type = "text",
    value,
    onChange,
    placeholder
}: {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}) => (
    <div>
        <Label htmlFor={id} className="mb-2">{label}</Label>
        <Input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
        />
    </div>
);


