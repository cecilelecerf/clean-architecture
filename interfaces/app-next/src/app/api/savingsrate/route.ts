import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import z from "zod";
import { savingRateSchema } from "@infrastructure/types/savingsrate";
import { savingsrateFactory } from '@infrastructure/adapters/db/mysql/factories/savingsrate';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const payload = savingRateSchema.pick({ rate:true, effectiveDate:true }).partial().parse(body);
        const result = await savingsrateFactory().admin.setSavingsRate.execute({
            rate: payload.rate,
            effectiveDate: payload.effectiveDate,
            userId: session.user.id
        })

        if (result instanceof Error) {
            return NextResponse.json(
                { name: result.name, message: result.message },
                { status: result.statusCode ?? 400 },
            );
        }

        return NextResponse.json(
            savingRateSchema
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