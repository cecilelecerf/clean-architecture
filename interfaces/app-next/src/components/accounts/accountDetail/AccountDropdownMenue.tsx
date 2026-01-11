'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, XCircle } from 'lucide-react';
import { textColorClasses } from '@/utils/color';
import { AccountId, AccountWithUserDTO } from '@infrastructure/types/account';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, X } from 'lucide-react';
import { endpoints } from '@/utils/endpoint';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';


export const AccountDropdownMenu = ({
    account,
}: {
    account: AccountWithUserDTO;
}) => {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className={`h-5 w-5 ${textColorClasses[50][account.color]}`} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier le nom
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setIsCloseDialogOpen(true)}
                        className="text-red-600"
                    >
                        <XCircle className="mr-2 h-4 w-4" />
                        Fermer le compte
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditAccountDialog
                accountIban={account.IBAN}
                currentName={account.name}
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
            />

            <CloseAccountDialog
                accountIban={account.IBAN}
                currentAccount={account}
                isOpen={isCloseDialogOpen}
                onOpenChange={setIsCloseDialogOpen}
            />
        </>
    );
};

const EditAccountDialog = ({
    accountIban,
    currentName,
    isOpen,
    onOpenChange
}: {
    accountIban: AccountId;
    currentName: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) => {
    const [editedName, setEditedName] = useState(currentName);
    const updateMutation = useMutation(endpoints.accounts.update({ accountIban }));

    const handleSaveEdit = async () => {
        updateMutation.mutate(
            { name: editedName },
            {
                onSuccess: () => {
                    onOpenChange(false);
                    setEditedName(currentName);
                }
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Modifier le nom du compte</DialogTitle>
                    <DialogDescription>
                        Changez le nom de votre compte pour mieux l'identifier.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nom du compte</Label>
                        <Input
                            id="name"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            placeholder="Entrez le nouveau nom"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        <X className="mr-2 h-4 w-4" />
                        Annuler
                    </Button>
                    <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                        <Check className="mr-2 h-4 w-4" />
                        Enregistrer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export const CloseAccountDialog = ({
    accountIban,
    currentAccount,
    isOpen,
    onOpenChange
}: {
    accountIban: AccountId;
    currentAccount: AccountWithUserDTO;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) => {
    const [transferTargetAccount, setTransferTargetAccount] = useState('');

    const otherAccountsQuery = useQuery({
        ...endpoints.accounts.getAllByMe(),
        enabled: isOpen,
    });

    const deleteMutation = useMutation(endpoints.accounts.delete({ accountIban }));

    const otherAccounts = otherAccountsQuery.data?.filter(
        acc => acc.IBAN !== currentAccount.IBAN
    ) || [];

    const handleCloseAccount = async () => {
        if (!transferTargetAccount) {
            alert('Veuillez sélectionner un compte de destination');
            return;
        }

        deleteMutation.mutate(
            { transferToAccountId: transferTargetAccount as AccountId },
            {
                onSuccess: () => {
                    onOpenChange(false);
                    setTransferTargetAccount('');
                }
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Fermer le compte</DialogTitle>
                    <DialogDescription>
                        Cette action est irréversible. Le solde restant de{' '}
                        <strong>
                            {currentAccount.balance.amount.toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: currentAccount.balance.currency
                            })}
                        </strong>{' '}
                        sera transféré vers le compte sélectionné.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="target-account">
                            Compte de destination pour le transfert
                        </Label>
                        <Select
                            value={transferTargetAccount}
                            onValueChange={setTransferTargetAccount}
                        >
                            <SelectTrigger id="target-account">
                                <SelectValue placeholder="Sélectionnez un compte" />
                            </SelectTrigger>
                            <SelectContent>
                                {otherAccounts.map((acc) => (
                                    <SelectItem key={acc.IBAN} value={acc.IBAN}>
                                        {acc.name} - {acc.IBAN} ({acc.balance.amount.toLocaleString('fr-FR', {
                                            style: 'currency',
                                            currency: acc.balance.currency
                                        })})
                                    </SelectItem>
                                ))}
                                {otherAccounts.length === 0 && (
                                    <SelectItem value="none" disabled>
                                        Aucun autre compte disponible
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Annuler
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleCloseAccount}
                        disabled={!transferTargetAccount || currentAccount.balance.amount <= 0 || deleteMutation.isPending}
                    >
                        <XCircle className="mr-2 h-4 w-4" />
                        Fermer définitivement
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};