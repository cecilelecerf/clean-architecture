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
import { memo, useCallback, useMemo, useState } from "react";
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
    return <Wrapper userId={session.user.id} t={t} />
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

const getEmptyFormData = (): UpdateClientPayload => ({
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

const Wrapper = ({ userId, t }: { userId: UserId, t: ReturnType<typeof useTranslations>; }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UpdateClientPayload>(getEmptyFormData);

    const query = useQuery(endpoints.users.me());

    const handleCancel = useCallback(() => {
        setIsEditing(false);
        setFormData(getEmptyFormData());
    }, []);

    const updateMutation = useMutation(endpoints.users.update({ id: userId }));

    const handleSave = useCallback(() => {
        updateMutation.mutate({
            payload: {
                ...formData,
                dateOfBirth: formData.dateOfBirth
                    ? new Date(formData.dateOfBirth).toISOString()
                    : undefined
            }
        }, {
            onSuccess: () => {
                toast.success("Profil mis à jour avec succès");
                setIsEditing(false);
                query.refetch();
            },
            onError: (error: any) => {
                toast.error(error.message || "Erreur lors de la mise à jour");
            },
        });
    }, [formData, updateMutation]);


    const handleEdit = useCallback((user: any) => {
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
    }, []);

    const handleLogout = useCallback(() => {
        signOut({ callbackUrl: '/login' });
    }, []);

    return match(query)
        .with(({ status: "error" }), () => <div>Erreur lors du chargement du profil</div>)
        .with(({ status: "pending" }), () => <ProfileSkeleton />)
        .with(({ status: "success" }), ({ data: user }) => (
            <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-5xl mx-auto">
                <ProfileHeader
                    user={user}
                    isEditing={isEditing}
                    isPending={updateMutation.isPending}
                    onEdit={() => handleEdit(user)}
                    onCancel={handleCancel}
                    onSave={handleSave}
                    t={t}
                />

                <PersonalInfoCard
                    user={user}
                    isEditing={isEditing}
                    formData={formData}
                    setFormData={setFormData}
                    t={t}
                />

                {match(user.role)
                    .with("client", () => <ClientStatistics userId={user.id} />)
                    .with("conseiller", () => <AdvisorStatistics userId={user.id} />)
                    .with("directeur", () => <DirectorStatistics userId={user.id} />)
                    .exhaustive()}

                <AccountInfoCard user={user} t={t} />

                <LogoutCard onLogout={handleLogout} t={t} />
            </div>
        ))
        .exhaustive();
}


const ProfileHeader = memo(({
    user,
    isEditing,
    isPending,
    onEdit,
    onCancel,
    onSave,
    t
}: {
    user: any;
    isEditing: boolean;
    isPending: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
    t: ReturnType<typeof useTranslations>;
}) => {
    const roleConfig = useMemo(() => ({
        client: { color: "border-blue-500 text-blue-700", label: "Client" },
        conseiller: { color: "border-green-500 text-green-700", label: "Conseiller" },
        directeur: { color: "border-purple-500 text-purple-700", label: "Directeur" }
    }), []);

    const currentRole = roleConfig[user.role as keyof typeof roleConfig];

    return (
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
                        <Badge variant="outline" className={currentRole.color}>
                            {currentRole.label}
                        </Badge>
                    </div>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                        {user.email}
                    </p>
                </div>

                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={onCancel}
                                disabled={isPending}
                            >
                                <X className="h-4 w-4 md:mr-2" />
                                <span className="hidden md:inline">Annuler</span>
                            </Button>
                            <Button onClick={onSave} disabled={isPending}>
                                <Save className="h-4 w-4 md:mr-2" />
                                <span className="hidden md:inline">
                                    {isPending ? "Enregistrement..." : "Enregistrer"}
                                </span>
                            </Button>
                        </>
                    ) : (
                        <Button variant="outline" onClick={onEdit}>
                            <Edit className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Modifier</span>
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
});

ProfileHeader.displayName = 'ProfileHeader';


const PersonalInfoCard = ({
    user,
    isEditing,
    formData,
    setFormData,
    t
}: {
    user: any;
    isEditing: boolean;
    formData: UpdateClientPayload;
    setFormData: React.Dispatch<React.SetStateAction<UpdateClientPayload>>;
    t: ReturnType<typeof useTranslations>;
}) => {
    return (
        <Card className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                {t("personal.title")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isEditing ? (
                    <PersonalInfoEditMode
                        formData={formData}
                        setFormData={setFormData}
                        t={t}
                    />
                ) : (
                    <PersonalInfoReadMode user={user} t={t} />
                )}
            </div>
        </Card>
    );
};

const PersonalInfoEditMode = memo(({
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
});

PersonalInfoEditMode.displayName = 'PersonalInfoEditMode';

const FormField = memo(({
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
));

FormField.displayName = 'FormField';

const PersonalInfoReadMode = memo(({
    user,
    t
}: {
    user: any;
    t: ReturnType<typeof useTranslations>
}) => {
    const formatSexe = (sexe: string) => {
        return sexe === "boy" ? "Homme" : sexe === "girl" ? "Femme" : sexe || "Non renseigné";
    };

    return (
        <>
            <InfoField icon={User} label={t("personal.firstname")} value={user.firstname} />
            <InfoField icon={User} label={t("personal.lastname")} value={user.lastname} />
            <InfoField icon={Mail} label={t("personal.email")} value={user.email} />

            {user.role === "client" && (
                <>
                    <InfoField
                        icon={Phone}
                        label={t("personal.phone")}
                        value={user.phoneNumber || "Non renseigné"}
                    />
                    <InfoField
                        icon={Cake}
                        label={t("personal.dateOfBirth")}
                        value={user.dateOfBirth
                            ? new Date(user.dateOfBirth).toLocaleDateString('fr-FR')
                            : "Non renseignée"}
                    />
                    <InfoField
                        icon={User}
                        label={t("personal.sexe")}
                        value={formatSexe(user.sexe)}
                    />
                    {user.address && (
                        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-500/10 rounded-lg md:col-span-2">
                            <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500">{t("personal.address")}</p>
                                <p className="font-medium">
                                    {user.address.address && `${user.address.address}, `}
                                    {user.address.postalCode && `${user.address.postalCode} `}
                                    {user.address.city}
                                    {user.address.country && `, ${user.address.country}`}
                                    {!user.address.address && !user.address.city && "Non renseignée"}
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </>
    );
});

PersonalInfoReadMode.displayName = 'PersonalInfoReadMode';

const InfoField = memo(({
    icon: Icon,
    label,
    value
}: {
    icon: any;
    label: string;
    value: string
}) => (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-500/10 rounded-lg">
        <Icon className="h-5 w-5 text-gray-500" />
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    </div>
));

InfoField.displayName = 'InfoField';

const AccountInfoCard = memo(({
    user,
    t
}: {
    user: any;
    t: ReturnType<typeof useTranslations>
}) => {
    const formatDate = useCallback((date: string) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }, []);

    return (
        <Card className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t("account.title")}
            </h2>

            <div className="space-y-3">
                <InfoField
                    icon={Calendar}
                    label={t("account.createdAt")}
                    value={formatDate(user.createdAt)}
                />
                <InfoField
                    icon={Calendar}
                    label={t("account.updatedAt")}
                    value={formatDate(user.updatedAt)}
                />

                {user.confirmedAt && (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-500/10 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="text-sm font-medium text-green-700">
                                    {t("account.confirmedEmail")}
                                </p>
                                <p className="text-xs text-green-600">
                                    Le {formatDate(user.confirmedAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
});

AccountInfoCard.displayName = 'AccountInfoCard';

const LogoutCard = memo(({
    onLogout,
    t
}: {
    onLogout: () => void;
    t: ReturnType<typeof useTranslations>
}) => (
    <Card className="p-4 md:p-6">
        <div className="flex flex-col gap-4">
            <div>
                <h3 className="font-semibold">{t("logout.title")}</h3>
                <p className="text-sm text-gray-500">{t("logout.text")}</p>
            </div>
            <Button
                variant="destructive"
                onClick={onLogout}
                className="w-full md:w-auto"
            >
                <LogOut className="mr-2 h-4 w-4" />
                {t("logout.button")}
            </Button>
        </div>
    </Card>
));

LogoutCard.displayName = 'LogoutCard';