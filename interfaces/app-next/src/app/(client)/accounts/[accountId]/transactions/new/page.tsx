// 'use client';

// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { ArrowLeft } from 'lucide-react';
// import { useParams, useRouter } from 'next/navigation';
// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import z from 'zod';
// import { v4 as uuid } from 'uuid';
// import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input';
// import { AccountId } from '@infrastructure/types/account';

// const newTransactionSchema = z.object({
//   label: z.string().min(2, 'Le libellé est obligatoire'),
//   amount: z.number().refine((val) => val !== 0, 'Le montant ne peut pas être nul'),
//   type: z.enum(['credit', 'debit']),
//   fromAccountId: z.string().uuid('Compte source invalide'),
//   toAccountId: z.string().uuid('Compte cible invalide'),
// });

// type NewTransactionForm = z.infer<typeof newTransactionSchema>;
export default function AccountNewPage() { return <></> }

// export default function NewTransactionPage() {
//   const { accountId } = useParams<{ accountId: AccountId }>();
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);

//   const form = useForm<NewTransactionForm>({
//     resolver: zodResolver(newTransactionSchema),
//     defaultValues: {
//       label: '',
//       amount: 0,
//       type: 'debit',
//       fromAccountId: accountId,
//       toAccountId: '',
//     },
//   });
//   const onSubmit = async (data: NewTransactionForm) => {
//     setLoading(true);
//     console.log('✅ Transaction créée :', { id: uuid(), ...data });
//     router.push('/transactions');
//   };
//   return (
//     <div className="">
//       {/* Formulaire */}
//       <Card className="rounded-2xl shadow-lg border-0 bg-linear-to-br from-gray-50 to-gray-100">
//         <CardHeader>
//           <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
//             <Button variant="ghost" size="icon" onClick={() => router.back()}>
//               <ArrowLeft className="w-5 h-5" />
//             </Button>
//             <h1>Nouvelle transaction</h1>
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 text-gray-700">
//             {/* Label */}
//             <div>
//               <Label htmlFor="label">Libellé</Label>
//               <Input id="label" placeholder="Ex: Supermarché" {...form.register('label')} />
//               {form.formState.errors.label && (
//                 <p className="text-sm text-red-600 mt-1">{form.formState.errors.label.message}</p>
//               )}
//             </div>

//             {/* Amount */}
//             <div>
//               <Label htmlFor="amount">Montant (€)</Label>
//               <Input
//                 id="amount"
//                 type="number"
//                 step="0.01"
//                 placeholder="Ex: 45.90"
//                 {...form.register('amount', { valueAsNumber: true })}
//               />
//               {form.formState.errors.amount && (
//                 <p className="text-sm text-red-600 mt-1">{form.formState.errors.amount.message}</p>
//               )}
//             </div>

//             {/* Accounts */}
//             <div>
//               <Label>Depuis le compte</Label>
//               <Input placeholder="ID du compte source" {...form.register('fromAccountId')} />
//               {form.formState.errors.fromAccountId && (
//                 <p className="text-sm text-red-600 mt-1">
//                   {form.formState.errors.fromAccountId.message}
//                 </p>
//               )}
//             </div>

//             <div>
//               <Label>Vers le compte</Label>
//               <Input placeholder="ID du compte cible" {...form.register('toAccountId')} />
//               {form.formState.errors.toAccountId && (
//                 <p className="text-sm text-red-600 mt-1">
//                   {form.formState.errors.toAccountId.message}
//                 </p>
//               )}
//             </div>

//             {/* Submit */}
//             <Button type="submit" className="w-full mt-4" disabled={loading}>
//               {loading ? 'Création en cours...' : 'Créer la transaction'}
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
