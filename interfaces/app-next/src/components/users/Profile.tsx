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
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { match } from "ts-pattern";
import { PayloadUserUpdateSchema, UserId } from "@infrastructure/types/user";
import { ClientStatistics } from "./_components/ClientStatistics";
import { AdvisorStatistics } from "./_components/AdvisorStatistics";
import { DirectorStatistics } from "./_components/DirectorStatistics";

export const ProfileComponent = () => {
    const { data: session } = useSession();
    if (!session?.user?.id) return <div>Unauthorized</div>;
    return <Wrapper userId={session.user.id} />

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
                    {Array.from({ length: 4 }).map((_, i) => (
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

const Wrapper = ({ userId }: { userId: UserId }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<PayloadUserUpdateSchema>({
        firstname: "",
        lastname: "",
        email: ""
    });
    const query = useQuery(endpoints.users.me(),
    );

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            firstname: "",
            lastname: "",
            email: ""
        });
    };
    const updateMutation = useMutation(endpoints.users.update({ id: userId }),
    );
    const handleSave = () => {
        updateMutation.mutate({ payload: formData }, {
            onSuccess: () => {
                toast.success("Profil mis à jour avec succès");
                setIsEditing(false);
            },
            onError: (error: any) => {
                toast.error(error.message || "Erreur lors de la mise à jour");
            },
        });
    };

    return match(query)
        .with(({ status: "error" }), () => "errpr")
        .with(({ status: "pending" }), () => <ProfileSkeleton />)
        .with(({ status: "success" }), ({ data: user }) => {
            const handleEdit = () => {
                if (user) {
                    setFormData({
                        firstname: user.firstname,
                        lastname: user.lastname,
                        email: user.email
                    });
                    setIsEditing(true);
                }
            };

            return (
                <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-5xl mx-auto">
                    {/* Header avec Avatar */}
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
                                <p className="text-sm md:text-base text-gray-600">{user.email}</p>
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

                    {/* Informations personnelles */}
                    <Card className="p-4 md:p-6">
                        <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Informations personnelles
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isEditing ? (
                                <>
                                    <div>
                                        <Label htmlFor="firstname" className="mb-2">Prénom</Label>
                                        <Input
                                            id="firstname"
                                            value={formData.firstname}
                                            onChange={(e) => setFormData(prev => ({ ...prev, firstname: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="lastname" className="mb-2">Nom</Label>
                                        <Input
                                            id="lastname"
                                            value={formData.lastname}
                                            onChange={(e) => setFormData(prev => ({ ...prev, lastname: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email" className="mb-2">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        />
                                    </div>
                                    {/* <div className="md:col-span-2">
                                <Label htmlFor="phoneNumber">Téléphone</Label>
                                <Input
                                    id="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                    placeholder="+33 6 12 34 56 78"
                                />
                            </div> */}
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <User className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="text-xs text-gray-500">Prénom</p>
                                            <p className="font-medium">{user.firstname}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <User className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="text-xs text-gray-500">Nom</p>
                                            <p className="font-medium">{user.lastname}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Mail className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="font-medium">{user.email}</p>
                                        </div>
                                    </div>

                                    {/* <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Phone className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Téléphone</p>
                                    <p className="font-medium">{user.phoneNumber || "Non renseigné"}</p>
                                </div>
                            </div> */}
                                </>
                            )}
                        </div>
                    </Card>

                    {/* Statistiques selon le rôle */}
                    {match(user.role)
                        .with("client", () => <ClientStatistics userId={user.id} />)
                        .with("conseiller", () => <AdvisorStatistics userId={user.id} />)
                        .with("directeur", () => <DirectorStatistics userId={user.id} />)
                        .exhaustive()}

                    {/* Informations du compte */}
                    <Card className="p-4 md:p-6">
                        <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Informations du compte
                        </h2>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium">Date de création</p>
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

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium">Dernière modification</p>
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
                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="text-sm font-medium text-green-700">Email confirmé</p>
                                            <p className="text-xs text-green-600">
                                                Le {new Date(user.confirmedAt).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Déconnexion */}
                    <Card className="p-4 md:p-6">
                        <div className="flex flex-col   gap-4">
                            <div>
                                <h3 className="font-semibold">Déconnexion</h3>
                                <p className="text-sm text-gray-500">
                                    Se déconnecter de votre compte
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="w-full md:w-auto"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Se déconnecter
                            </Button>
                        </div>
                    </Card>
                </div>)
        })
        .exhaustive()
}