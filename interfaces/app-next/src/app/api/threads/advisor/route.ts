import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { threadsFactory } from '@infrastructure/adapters/db/mysql/factories/threads';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const threads = await threadsFactory().advisorGetAllThread.execute({
      administratorId: session.user.id,
    });
    if (threads instanceof Error) {
      return NextResponse.json(
        { name: threads.name, message: threads.message },
        { status: threads.statusCode ?? 404 },
      );
    }

    return NextResponse.json(threads);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
