import { NextRequest, NextResponse } from 'next/server';
import { postsFactory } from '@infrastructure/adapters/db/mysql/factories/posts';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { postSchema } from '@infrastructure/types/feed';
import z from 'zod';
import { newPostSchema, querySchema } from '@/utils/endpoint/feedsEndpoint';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const paramsObj: Record<string, string | boolean | number | string[]> = {};
    searchParams.forEach((val, key) => {
      if (key === 'limit' || key === 'page') return (paramsObj[key] = Number(val));
      if (key === 'status') return (paramsObj[key] = val === 'true');
      if (key === 'tagsId') return (paramsObj[key] = val.split(','));
      paramsObj[key] = val;
    });
    const parsed = querySchema.parse(paramsObj);
    const result = await postsFactory().getPostWithFilter.execute({
      page: parsed.page,
      limit: parsed.limit,
      tagsId: parsed.tagsId,
      title: parsed.title,
      userId: session.user.id,
      fromDate: parsed.fromDate && new Date(parsed.fromDate),
      toDate: parsed.toDate && new Date(parsed.toDate),
      status: parsed.status,
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
