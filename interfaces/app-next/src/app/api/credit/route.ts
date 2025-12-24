import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { creditFactory } from '@infrastructure/adapters/db/mysql/factories/credit';
import { creditSchema } from "@infrastructure/types/credit";
import z from "zod";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const result = await creditFactory().client.listClientCredits.execute(session.user.id);
        if (result instanceof Error) {
        return NextResponse.json(
            { name: result.name, message: result.message },
            { status: result.statusCode ?? 404 },
        );
        }
        return NextResponse.json(result);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: err.message || 'Erreur serveur' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const payload = creditSchema.pick({ initialAmount: true, insuranceRate: true, interestRate: true , durationMonths: true}).partial().parse(body);

        const result = await creditFactory().client.requestCredit.execute({
            clientId: session.user.id,
            amount: payload.initialAmount.amount,
            currency: payload.initialAmount.currency,
            interestRate: payload.interestRate,
            insuranceRate: payload.insuranceRate,
            durationMonths: payload.durationMonths
        });

        if (result instanceof Error) {
            return NextResponse.json(
                { name: result.name, message: result.message },
                { status: result.statusCode ?? 400 },
            );
        }

        return NextResponse.json(
            creditSchema
                .omit({ createdAt: true, updatedAt: true })
                .extend({
                  createdAt: z.date(),
                  updatedAt: z.date().optional(),
                })
                .parse(result),
        );
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { message: err instanceof Error ? err.message : 'Erreur serveur' },
            { status: 500 },
        );
    }
}