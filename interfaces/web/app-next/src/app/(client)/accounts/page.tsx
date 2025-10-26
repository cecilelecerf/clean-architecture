
import { Button, Card } from "@radix-ui/themes";
import mockAccounts from "@infrastructure/data/accounts";

export default function AccountsPage() {
    return (
        <div className="p-8 space-y-4">
            <h1 className="text-3xl font-bold">Mes comptes</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockAccounts.map((account) => (
                    <Card key={account.id} className="p-4 shadow-md rounded-md border border-gray-200">
                        <h2 className="text-xl font-semibold">{account.name}</h2>
                        <p className="text-sm text-gray-500">{account.type === "checking" ? "Compte courant" : "Épargne"}</p>
                        <p className="mt-2 text-lg font-medium">IBAN : {account.IBAN}</p>
                        <p className="mt-2 text-lg font-bold">Solde : {account.balance.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</p>
                        <div className="mt-4 flex space-x-2">
                            <Button onClick={() => alert(`Modifier ${account.name}`)}>Modifier</Button>
                            <Button onClick={() => alert(`Supprimer ${account.name}`)}>Supprimer</Button>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="mt-6">
                <Button onClick={() => alert("Créer un nouveau compte")}>Ajouter un compte</Button>
            </div>
        </div>
    );
}
