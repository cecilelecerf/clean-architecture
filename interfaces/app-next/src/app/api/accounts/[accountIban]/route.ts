import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { accountFactory } from '@infrastructure/adapters/db/mysql/factories/account';

export async function GET(req: NextRequest, ctx: RouteContext<'/api/accounts/[accountIban]/transfer'>) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const { accountIban } = await ctx.params;
        if (!accountIban) {
            return NextResponse.json({ message: 'Missing accountIban' }, { status: 400 });
        }
        const result = await accountFactory().client.getAccountByIBAN.execute({ 
            iban: accountIban,
            userId: session.user.id,
        });
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