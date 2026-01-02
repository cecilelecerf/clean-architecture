"use client";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export const StepSelectAccount = ({ selectedAccountId, onSelect, onNext}: { selectedAccountId?: string, onSelect: (accountId: string, currency: string) => void, onNext: () => void}) => {
  const query = useQuery(endpoints.accounts.getAllByMe());

  if (query.isLoading) return <p>Chargement des comptes...</p>;
  if (query.isError) return <p>Erreur lors du chargement des comptes</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Choisissez un compte</h2>

      <div className="grid gap-4">
        {query.data.map((account) => {
          const selected = account.IBAN === selectedAccountId;

          return (
            <Card
              key={account.IBAN}
              onClick={() => onSelect(account.IBAN, account.currency)}
              className={`cursor-pointer transition-all ${
                selected
                  ? "border-blue-500 ring-2 ring-blue-500"
                  : "hover:shadow-md"
              }`}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{account.name}</p>
                  <p className="text-sm text-gray-500">
                    Solde : {account.amount} {account.currency}
                  </p>
                </div>

                {selected && (
                  <CheckCircle className="text-blue-500 w-6 h-6" />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button
        size="lg"
        disabled={!selectedAccountId}
        onClick={onNext}
      >
        Continuer
      </Button>
    </div>
  )
}

