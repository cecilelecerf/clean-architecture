// POST

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { threadsFactory } from "@infrastructure/adapters/db/mysql/factories/threads";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest,  ctx: RouteContext<'/api/threads/[threadId]'>,
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { threadId } = await ctx.params;

    const body = await req.json();
    const {  title} = body;
     
    const thread = await threadsFactory().closeThread.execute({userId:session.user.id, threadId :threadId });
    if (thread instanceof Error) {
      return NextResponse.json(
        { name: thread.name, message: thread.message },
        { status: thread.statusCode ?? 404 },
      );
    }
    
    return NextResponse.json(thread);
    



  } catch (err) {
    console.error('Error in POST /api/threads:', err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}