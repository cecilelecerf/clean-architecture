import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { AccountEntity } from "@domain/entities/AccountEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { IBAN } from "@domain/values/IBAN";
import { MongoClient } from "../../MongoClient";
import { AccountModel } from "../models/AccountModel";
import { Money } from "@domain/values/Money";
import { Color } from "@domain/values/Color";
import { AccountOwner } from "@domain/values/AccountOwner";

export class AccountRepositoryMongo implements AccountRepository {
    constructor(private readonly client: MongoClient) {}

    async findByUserId(userId: UserEntity["id"]): Promise<AccountEntity[]> {
        await this.client.connect();

        const docs = await AccountModel.find({ userId }).lean();

        return docs.map((doc) => {
            const iban = IBAN.create(doc.iban);
            if (iban instanceof Error) throw iban;

            const owner = AccountOwner.create(doc.owner);
            if (owner instanceof Error) throw owner;

            const balance = Money.create(doc.balance);
            if (balance instanceof Error) throw balance;

            const color = Color.from(doc.color);
            if (color instanceof Error) throw color;

            return AccountEntity.from({
                iban,
                owner,
                name: doc.name,
                type: doc.type,
                color,
                balance,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            });
        });
    }

    async findByIBAN(iban: IBAN): Promise<AccountEntity | null> {
        await this.client.connect();

        const doc = await AccountModel.findOne({ iban: iban.value }).lean();
        if (!doc) return null;

        const owner = AccountOwner.create(doc.owner);
        if (owner instanceof Error) throw owner;

        const balance = Money.create(doc.balance);
        if (balance instanceof Error) throw balance;

        const color = Color.from(doc.color);
        if (color instanceof Error) throw color;

        return AccountEntity.from({
            iban,
            owner,
            name: doc.name,
            type: doc.type,
            color,
            balance,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    async findAllSavingsAccounts(): Promise<AccountEntity[]> {
        await this.client.connect();

        const docs = await AccountModel.find({ type: "epargne" }).lean();

        return docs.map((doc: any) => {
            const iban = IBAN.create(doc.iban);
            if (iban instanceof Error) throw iban;

            const owner = AccountOwner.create(doc.owner);
            if (owner instanceof Error) throw owner;

            const balance = Money.create(doc.balance);
            if (balance instanceof Error) throw balance;

            const color = Color.from(doc.color);
            if (color instanceof Error) throw color;

            return AccountEntity.from({
            iban,
            owner,
            name: doc.name,
            type: doc.type,
            color,
            balance,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            });
        });
    }

    async findBankInterestAccount(): Promise<AccountEntity | null> {
        await this.client.connect();

        const doc = await AccountModel.findOne({
            type: "epargne",
            owner_type: "bank",
        }).lean();
        if (!doc) return null;

        const iban = IBAN.create(doc.iban);
        if (iban instanceof Error) throw iban;

        const owner = AccountOwner.create(doc.owner);
        if (owner instanceof Error) throw owner;

        const balance = Money.create(doc.balance);
        if (balance instanceof Error) throw balance;

        const color = Color.from(doc.color);
        if (color instanceof Error) throw color;

        return AccountEntity.from({
            iban,
            owner,
            name: doc.name,
            type: doc.type,
            color,
            balance,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });

    }

    async save(account: AccountEntity): Promise<void> {
        await this.client.connect();

        await AccountModel.create({
            iban: account.iban.value,
            owner: {
                role: account.owner.role,
                userId: account.owner.userId ?? null,
            },
            name: account.name,
            type: account.type,
            color: account.color.getValue(),
            balance: {
                amount: account.balance.amount,
                currency: account.balance.currency,
            },
            createdAt: account.createdAt
        });
    }

    async update(account: AccountEntity): Promise<void> {
        await this.client.connect();

        await AccountModel.updateOne(
            { iban: account.iban.value },
            {
                $set: {
                    owner: {
                        role: account.owner.role,
                        userId: account.owner.userId ?? null,
                    },
                    name: account.name,
                    type: account.type,
                    color: account.color.getValue(),
                    balance: {
                        amount: account.balance.amount,
                        currency: account.balance.currency,
                    },
                    updatedAt: account.updatedAt || new Date(),
                },
            }
        );
    }

    async delete(iban: IBAN): Promise<void> {
        await this.client.connect();

        await AccountModel.deleteOne({ iban: iban.value });
    }
}