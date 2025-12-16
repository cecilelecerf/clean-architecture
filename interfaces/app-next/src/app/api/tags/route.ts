import { NextRequest, NextResponse } from 'next/server';
import { tagsFactory } from '@infrastructure/adapters/db/mysql/factories/tags';
import { getServerSession } from 'next-auth';
import { tagSchema } from '@infrastructure/types/feed';
import { authOptions } from '../auth/[...nextauth]/route';
import { newTagSchema } from '@/utils/endpoint/advisor/feedsEndpoint';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const result = await tagsFactory().getAllTags.execute();
    if (result instanceof Error) {
      return NextResponse.json({ name: result.name, message: result.message }, { status: 404 });
    }

    return NextResponse.json(tagSchema.array().parse(result));
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 },
    );
  }
}
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const payload = newTagSchema.parse(body);

    const result = await tagsFactory().createTag.execute({
      advisorId: session.user.id,
      ...payload,
    });

    if (result instanceof Error)
      return NextResponse.json(
        { name: result.name, message: result.message },
        { status: result.statusCode ?? 400 },
      );

    return NextResponse.json(tagSchema.parse(result));
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 },
    );
  }
}
