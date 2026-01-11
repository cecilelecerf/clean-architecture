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
import { useTranslations } from 'next-intl';


export const AccountDropdownMenu = ({
    account,
}: {
    account: AccountWithUserDTO;
}) => {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
    const t = useTranslations("account");

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
                        {t("update")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setIsCloseDialogOpen(true)}
                        className="text-red-600"
                    >
                        <XCircle className="mr-2 h-4 w-4" />
                        {t("close")}
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
    const t = useTranslations("account.dialog");

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("update.title")}</DialogTitle>
                    <DialogDescription>
                        {t("update.description")}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">{t("update.label")}</Label>
                        <Input
                            id="name"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            placeholder={t("update.placeholder")}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        <X className="mr-2 h-4 w-4" />
                        {t("button.cancel")}                    </Button>
                    <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                        <Check className="mr-2 h-4 w-4" />
                        {t("button.save")}
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
    const t = useTranslations("account.dialog");

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
                    <DialogTitle>{t("dialog.close.title")}</DialogTitle>
                    <DialogDescription>
                        {t("dialog.close.description.start")}                        <strong>
                            {currentAccount.balance.amount.toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: currentAccount.balance.currency
                            })}
                        </strong>{' '}
                        {t("dialog.close.description.end")}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="target-account">
                            {t("dialog.close.label")}
                        </Label>
                        <Select
                            value={transferTargetAccount}
                            onValueChange={setTransferTargetAccount}
                        >
                            <SelectTrigger id="target-account">
                                <SelectValue placeholder={t("dialog.close.placeholder")} />
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
                                        {t("dialog.close.none")}
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t("dialog.button.cancel")}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleCloseAccount}
                        disabled={!transferTargetAccount || currentAccount.balance.amount <= 0 || deleteMutation.isPending}
                    >
                        <XCircle className="mr-2 h-4 w-4" />
                        {t("dialog.button.close")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};