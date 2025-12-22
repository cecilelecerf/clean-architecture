import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
    try {

    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: err.message || 'Erreur serveur' }, { status: 500 });
    }
}