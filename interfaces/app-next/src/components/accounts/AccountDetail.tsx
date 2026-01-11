'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, MoreVertical, Edit, XCircle, Check, X } from 'lucide-react';
import { fromColorClasses, textColorClasses, toColorClasses } from '@/utils/color';
import { useRouter } from 'next/navigation';
import { AccountId } from '@infrastructure/types/account';
import { useMutation, useQuery } from '@tanstack/react-query';
import { endpoints } from '@/utils/endpoint';
import { match } from 'ts-pattern';
import { Flex } from '@radix-ui/themes';
import { Skeleton } from '@/components/ui/skeleton';
import { GetAllTransactions } from '@/components/accounts/transactions/GetAllTransactions';
import { Separator } from '../ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';

export const AccountDetail = ({
    accountIban,
    basePath,
    withUserInfo,
    withTransferButton
}: {
    accountIban: AccountId,
    basePath: string,
    withUserInfo?: boolean,
    withTransferButton?: boolean
}) => {
    const router = useRouter();
    const query = useQuery(endpoints.accounts.get({ accountIban }));

    const t = useTranslations("account");

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [transferTargetAccount, setTransferTargetAccount] = useState('');

    const otherAccountsQuery = useQuery({
        ...endpoints.accounts.getAllByMe(),
        enabled: isCloseDialogOpen,
    });
    const updateMutation = useMutation(endpoints.accounts.update({ accountIban }))
    const deelteMutation = useMutation(endpoints.accounts.delete({ accountIban }))

    const handleEditClick = (currentName: string) => {
        setEditedName(currentName);
        setIsEditDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        updateMutation.mutate({ name: editedName }, { onSuccess: () => setIsEditDialogOpen(false) })
        console.log('Sauvegarde du nouveau nom:', editedName);
        ;
    };

    const handleCloseAccount = async () => {
        if (!transferTargetAccount) {
            alert('Veuillez sélectionner un compte de destination');
            return;
        }
        deelteMutation.mutate({ transferToAccountId: transferTargetAccount as AccountId }, {
            onSuccess: () => {
                setIsCloseDialogOpen(false);
                console.log('Fermeture du compte et transfert vers:', transferTargetAccount);
            }
        })
    };

    return (
        <>
            {match(query)
                .with({ status: "pending" }, () => <SkeletonAccount />)
                .with({ status: "error" }, () => <div className="text-red-500">{t("error")}</div>)
                .with({ status: "success" }, ({ data: account }) => {
                    const otherAccounts = otherAccountsQuery.data?.filter(
                        acc => acc.IBAN !== account.IBAN
                    ) || [];

                    return (
                        <div className="flex flex-col gap-6">
                            <Card
                                className={`rounded-2xl text-white shadow-lg border-0 bg-linear-to-br ${fromColorClasses[800][account.color]} ${toColorClasses[500][account.color]} ${textColorClasses[50][account.color]}`}
                            >
                                <CardContent className="flex flex-col justify-between">
                                    <div className="flex justify-between items-center">
                                        <p className="text-lg font-medium">{account.name}</p>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className={`h-5 w-5 ${textColorClasses[50][account.color]}`} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditClick(account.name)}>
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
                                    </div>

                                    <div className="flex gap-2 my-4">
                                        <Copy className="cursor-pointer" onClick={() => navigator.clipboard.writeText(account.IBAN)} />
                                        <p>{account.IBAN}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs opacity-75 mb-1">{account.type}</p>
                                        <p className="text-3xl font-bold">
                                            {account.balance.amount.toLocaleString('fr-FR', {
                                                style: 'currency',
                                                currency: account.balance.currency
                                            })}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {withUserInfo && account.userId && (
                                <>
                                    <Button
                                        onClick={() => router.push(`/admin/users/${account.userId}`)}
                                        className="flex-1 mx-1 bg-gray-100 text-gray-800 hover:bg-gray-200"
                                    >
                                        {t("client")}
                                    </Button>
                                    <Separator />
                                </>
                            )}

                            {withTransferButton && (
                                <>
                                    <Button
                                        onClick={() => router.push(`${basePath}/${account.IBAN}/transactions/new`)}
                                        className="flex-1 mx-1 bg-gray-100 text-gray-800 hover:bg-gray-200"
                                    >
                                        {t("transfer")}
                                    </Button>
                                    <Separator />
                                </>
                            )}

                            <Flex direction="column" gap="4">
                                <Flex justify="between">
                                    <h2 className="font-semibold text-lg">{t("last")}</h2>
                                    <Button
                                        variant="link"
                                        onClick={() => router.push(`${basePath}/${account.IBAN}/transactions`)}
                                    >
                                        {'Voir +'}
                                    </Button>
                                </Flex>


                                <GetAllTransactions
                                    accountIban={accountIban}
                                    filters={{ limit: 4, page: 1 }}
                                    onPaginationChange={() => { }}
                                    hiddePagination
                                    baseHref={`${basePath}/${accountIban}/transactions`}
                                />

                            </Flex>

                            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{t("dialog.update.title")}</DialogTitle>
                                        <DialogDescription>
                                            {t("dialog.update.description")}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">{t("dialog.update.label")}</Label>
                                            <Input
                                                id="name"
                                                value={editedName}
                                                onChange={(e) => setEditedName(e.target.value)}
                                                placeholder={t("dialog.update.placeholder")}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                            <X className="mr-2 h-4 w-4" />
                                            {t("dialog.update.button.cancel")}
                                        </Button>
                                        <Button onClick={handleSaveEdit}>
                                            <Check className="mr-2 h-4 w-4" />
                                            {t("dialog.update.button.save")}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{t("dialog.close.title")}</DialogTitle>
                                        <DialogDescription>
                                            {t("dialog.close.description.start")}{' '}
                                            <strong>
                                                {account.balance.amount.toLocaleString('fr-FR', {
                                                    style: 'currency',
                                                    currency: account.balance.currency
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
                                        <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)}>
                                            {t("dialog.button.cancel")}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleCloseAccount}
                                            disabled={!transferTargetAccount || account.balance.amount <= 0}
                                        >
                                            <XCircle className="mr-2 h-4 w-4" />
                                            {t("dialog.button.close")}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    );
                })
                .exhaustive()}
        </>
    );
};

const SkeletonAccount = () => (
    <>
        <Card className="rounded-2xl shadow-lg border-0">
            <CardContent className="flex flex-col justify-between p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <div className="flex gap-2 my-4">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-64" />
                </div>
                <div>
                    <Skeleton className="h-3 w-24 mb-2" />
                    <Skeleton className="h-9 w-40" />
                </div>
            </CardContent>
        </Card>
        <Skeleton className="h-20 w-full mx-1 mt-10" />
    </>
);