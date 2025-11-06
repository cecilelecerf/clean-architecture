import { NextRequest, NextResponse } from 'next/server';
import { postsFactory } from '@infrastructure/adapters/db/mysql/factories/posts';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { newPostSchema } from '@/utils/endpoint/advisor/feedsEndpoint';
import { postSchema } from '@infrastructure/types/feed';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page: number | undefined = Number(searchParams.get('page'));
    const limit: number | undefined = Number(searchParams.get('limit'));
    const tagsParam = searchParams.get('tags');
    const tags = tagsParam
      ? tagsParam
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    const published = searchParams.get('published') === 'true';

    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const result = await postsFactory().adminFindPostWithFilter.execute({
      page,
      limit,
      tags,
      published,
      administratorId: session.user.id,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
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

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const payload = newPostSchema.parse(body);

    const result = await postsFactory().addPost.execute({
      advisorId: session.user.id,
      title: payload.title,
      content: payload.content,
      tagsId: payload.tagsId,
    });

    if (result instanceof Error) {
      return NextResponse.json(
        { name: result.name, message: result.message },
        { status: result.statusCode ?? 400 },
      );
    }

    return NextResponse.json(postSchema.parse(result));
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 },
    );
  }
}
