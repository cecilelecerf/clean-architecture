import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { creditFactory } from '@infrastructure/adapters/db/mysql/factories/credit';
import { creditResponseSchema, creditSchema } from '@infrastructure/types/credit';
import z from 'zod';

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/credit/[creditId]/advisor'>){
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const { creditId } = await ctx.params;

        const body = await req.json();
        const payload = creditResponseSchema.parse(body); 

        const result = await creditFactory().admin.grantCredit.execute({
            advisorId: session.user.id,
            creditId: creditId,
            accept: payload.accept
        })

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