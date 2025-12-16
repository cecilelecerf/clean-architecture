import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { threadsFactory } from '@infrastructure/adapters/db/mysql/factories/threads';

export async function GET(
  req: NextRequest,
 ) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as 'external' | 'internal' | null;

    const thread = await threadsFactory().getThreadsByUserAndTypeUsecase.execute({userId:session.user.id, type : type ??undefined});
    if (thread instanceof Error) {
      return NextResponse.json(
        { name: thread.name, message: thread.message },
        { status: thread.statusCode ?? 404 },
      );
    }

    return NextResponse.json(thread);
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
    const { type, title, participantsId, initialMessage } = body;
     
    if (type === 'external') { 

    const  result = await threadsFactory().startExternalThread.execute({
        clientId: session.user.id,
        title,
        messageContent: initialMessage,
      });
            if (result instanceof Error) {
      return NextResponse.json(
        { name: result.name, message: result.message },
        { status: result.statusCode ??404 }
      );
      
    }
    return NextResponse.json(result, { status: 201 });
    } else if (type === 'internal') { 
    const  result = await threadsFactory().startInternalThread.execute({
        administratorId: session.user.id,
        title,
        participantsId,
      });
      if (result instanceof Error) {
      return NextResponse.json(
        { name: result.name, message: result.message },
        { status: result.statusCode ??404 }
      );
      
    }
    return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(
        { message: 'Invalid thread type' },
        { status: 400 }
      );
    } 



  } catch (err) {
    console.error('Error in POST /api/threads:', err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}

