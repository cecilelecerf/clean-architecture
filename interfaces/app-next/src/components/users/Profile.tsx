"use client";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { match } from "ts-pattern";
import { UpdateClientPayload, UserId } from "@infrastructure/types/user";
import { ClientStatistics } from "./_components/ClientStatistics";
import { AdvisorStatistics } from "./_components/AdvisorStatistics";
import { DirectorStatistics } from "./_components/DirectorStatistics";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

export const ProfileComponent = () => {
    const t = useTranslations("director.profile");
    const { data: session } = useSession();
    if (!session?.user?.id) return <div>Unauthorized</div>;
    return <Wrapper userId={session.user.id} t={t}/>
}

function ProfileSkeleton() {
    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-5xl mx-auto">
            <Card className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
                    <Skeleton className="h-20 w-20 md:h-24 md:w-24 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-10 w-24" />
                </div>
            </Card>

            <Card className="p-4 md:p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </Card>

            <Card className="p-4 md:p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
            </Card>
        </div>
    );
}

const Wrapper = ({ userId, t }: { userId: UserId, t: ReturnType<typeof useTranslations>; }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UpdateClientPayload>({
        firstname: "",
        lastname: "",
        email: "",
        dateOfBirth: "",
        phoneNumber: "",
        address: {
            address: "",
            city: "",
            postalCode: "",
            country: "",
        },
        sexe: undefined
    });

    const query = useQuery(endpoints.users.me());

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            firstname: "",
            lastname: "",
            email: "",
            dateOfBirth: "",
            phoneNumber: "",
            address: {
                address: "",
                city: "",
                postalCode: "",
                country: "",
            },
            sexe: undefined
        });
    };

    const updateMutation = useMutation(endpoints.users.update({ id: userId }));

    const handleSave = () => {
        updateMutation.mutate({ payload: { ...formData, dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : undefined } }, {
            onSuccess: () => {
                toast.success("Profil mis à jour avec succès");
                setIsEditing(false);
                query.refetch();
            },
            onError: (error: any) => {
                toast.error(error.message || "Erreur lors de la mise à jour");
            },
        });
    };

    return match(query)
        .with(({ status: "error" }), () => <div>Erreur lors du chargement du profil</div>)
        .with(({ status: "pending" }), () => <ProfileSkeleton />)
        .with(({ status: "success" }), ({ data: user }) => {
            const handleEdit = () => {
                if (user) {
                    setFormData({
                        firstname: user.firstname,
                        lastname: user.lastname,
                        email: user.email,
                        dateOfBirth: user.role === "client" ? user.dateOfBirth : undefined,
                        phoneNumber: user.role === "client" ? user.phoneNumber : undefined,
                        address: user.role === "client" ? user.address || {
                            address: "",
                            city: "",
                            postalCode: "",
                            country: "",
                        } : undefined,
                        sexe: user.role === "client" ? user.sexe : undefined
                    });
                    setIsEditing(true);
                }
            };

            return (
                <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-5xl mx-auto">
                    <Card className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
                            <Avatar className="h-20 w-20 md:h-24 md:w-24">
                                <AvatarFallback className="text-2xl md:text-3xl">
                                    {user.firstname[0]}{user.lastname[0]}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                                    <h1 className="text-2xl md:text-3xl font-bold">
                                        {user.firstname} {user.lastname}
                                    </h1>
                                    <Badge
                                        variant="outline"
                                        className={match(user.role)
                                            .with("client", () => "border-blue-500 text-blue-700")
                                            .with("conseiller", () => "border-green-500 text-green-700")
                                            .with("directeur", () => "border-purple-500 text-purple-700")
                                            .exhaustive()}
                                    >
                                        {match(user.role)
                                            .with("client", () => "Client")
                                            .with("conseiller", () => "Conseiller")
                                            .with("directeur", () => "Directeur")
                                            .exhaustive()}
                                    </Badge>
                                </div>
                                <p className="text-sm md:text-base text-gray-600 dark:text-gray-500">{user.email}</p>
                            </div>

                            <div className="flex gap-2">
                                {isEditing ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={handleCancel}
                                            disabled={updateMutation.isPending}
                                        >
                                            <X className="h-4 w-4 md:mr-2" />
                                            <span className="hidden md:inline">Annuler</span>
                                        </Button>
                                        <Button
                                            onClick={handleSave}
                                            disabled={updateMutation.isPending}
                                        >
                                            <Save className="h-4 w-4 md:mr-2" />
                                            <span className="hidden md:inline">
                                                {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                                            </span>
                                        </Button>
                                    </>
                                ) : (
                                    <Button variant="outline" onClick={handleEdit}>
                                        <Edit className="h-4 w-4 md:mr-2" />
                                        <span className="hidden md:inline">Modifier</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 md:p-6">
                        <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {t("personal.title")}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isEditing ? (
                                <>
                                    <div>
                                        <Label htmlFor="firstname" className="mb-2">{t("personal.firstname")}</Label>
                                        <Input
                                            id="firstname"
                                            value={formData.firstname}
                                            onChange={(e) => setFormData(prev => ({ ...prev, firstname: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="lastname" className="mb-2">{t("personal.lastname")}</Label>
                                        <Input
                                            id="lastname"
                                            value={formData.lastname}
                                            onChange={(e) => setFormData(prev => ({ ...prev, lastname: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email" className="mb-2">{t("personal.email")}</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phoneNumber" className="mb-2">{t("personal.phone")}</Label>
                                        <Input
                                            id="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                            placeholder="+33 6 12 34 56 78"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="dateOfBirth" className="mb-2">{t("personal.dateOfBirth")}</Label>
                                        <Input
                                            id="dateOfBirth"
                                            type="date"
                                            value={formData.dateOfBirth}
                                            onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="sexe" className="mb-2">{t("personal.sexe")}</Label>
                                        <Select
                                            value={formData.sexe}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, sexe: value as "girl" | "boy" | "other" }))}
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
                                        <Label htmlFor="address" className="mb-2">{t("personal.address")}</Label>
                                        <Input
                                            id="address"
                                            value={formData.address?.address || ""}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                address: { ...prev.address, address: e.target.value }
                                            }))}
                                            placeholder="Rue"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="city" className="mb-2">{t("personal.city")}</Label>
                                        <Input
                                            id="city"
                                            value={formData.address?.city || ""}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                address: { ...prev.address, city: e.target.value }
                                            }))}
                                            placeholder="Ville"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="postalCode" className="mb-2">{t("personal.postalCode")}</Label>
                                        <Input
                                            id="postalCode"
                                            value={formData.address?.postalCode || ""}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                address: { ...prev.address, postalCode: e.target.value }
                                            }))}
                                            placeholder="75001"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="country" className="mb-2">{t("personal.country")}</Label>
                                        <Input
                                            id="country"
                                            value={formData.address?.country || ""}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                address: { ...prev.address, country: e.target.value }
                                            }))}
                                            placeholder="France"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-500/10 rounded-lg">
                                        <User className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="text-xs text-gray-500">{t("personal.firstname")}</p>
                                            <p className="font-medium">{user.firstname}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-500/10 rounded-lg">
                                        <User className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="text-xs text-gray-500">{t("personal.lastname")}</p>
                                            <p className="font-medium">{user.lastname}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-500/10 rounded-lg">
                                        <Mail className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="text-xs text-gray-500">{t("personal.email")}</p>
                                            <p className="font-medium">{user.email}</p>
                                        </div>
                                    </div>
                                    {user.role === "client" &&
                                        <> <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-500/10 rounded-lg">
                                            <Phone className="h-5 w-5 text-gray-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">{t("personal.phonr")}</p>
                                                <p className="font-medium">{user.phoneNumber || "Non renseigné"}</p>
                                            </div>
                                        </div>

                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <Cake className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="text-xs text-gray-500">{t("personal.dateOfBirth")}</p>
                                                    <p className="font-medium">
                                                        {user.dateOfBirth
                                                            ? new Date(user.dateOfBirth).toLocaleDateString('fr-FR')
                                                            : "Non renseignée"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <User className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="text-xs text-gray-500">{t("personal.sexe")}</p>
                                                    <p className="font-medium">
                                                        {user.sexe === "boy" ? "Homme" : user.sexe === "girl" ? "Femme" : user.sexe || "Non renseigné"}
                                                    </p>
                                                </div>
                                            </div>

                                            {user.address && (
                                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                                                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">{t("personal.address")}</p>
                                                        <p className="font-medium">
                                                            {user.address.address && `${user.address.address}, `}
                                                            {user.address.postalCode && `${user.address.postalCode} `}
                                                            {user.address.city}
                                                            {user.address.country && `, ${user.address.country}`}
                                                        </p>
                                                        {!user.address.address && !user.address.city && (
                                                            <p className="font-medium">Non renseignée</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}</>}
                                </>
                            )}
                        </div>
                    </Card>

                    {match(user.role)
                        .with("client", () => <ClientStatistics userId={user.id} />)
                        .with("conseiller", () => <AdvisorStatistics userId={user.id} />)
                        .with("directeur", () => <DirectorStatistics userId={user.id} />)
                        .exhaustive()}

                    <Card className="p-4 md:p-6">
                        <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            {t("account.title")}
                        </h2>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-500/10 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium">{t("account.createdAt")}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-500/10 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium">{t("account.updatedAt")}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(user.updatedAt).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {user.confirmedAt && (
                                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-500/10 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="text-sm font-medium text-green-700">{t("account.confirmedEmail")}</p>
                                            <p className="text-xs text-green-600">
                                                Le {new Date(user.confirmedAt).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className="p-4 md:p-6">
                        <div className="flex flex-col gap-4">
                            <div>
                                <h3 className="font-semibold">{t("logout.title")}</h3>
                                <p className="text-sm text-gray-500">
                                    {t("logout.text")}
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="w-full md:w-auto"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                {t("logout.button")}
                            </Button>
                        </div>
                    </Card>
                </div>
            );
        })
        .exhaustive();
}