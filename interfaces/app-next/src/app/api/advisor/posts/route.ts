import { NextRequest, NextResponse } from 'next/server';
import { postsFactory } from '@infrastructure/adapters/db/mysql/factories/posts';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { newPostSchema } from '@/utils/endpoint/advisor/feedsEndpoint';
import { postSchema } from '@infrastructure/types/feed';
import z from 'zod';
import { querySchema } from '@/utils/endpoint/client/feedsEndpoint';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const paramsObj: Record<string, string | boolean | number> = {};
    searchParams.forEach((val, key) => {
      if (key === 'status') return (paramsObj[key] = val === 'true');
      if (key === 'limit' || key === 'page') return (paramsObj[key] = Number(val));
      paramsObj[key] = val;
    });
    const parsed = querySchema.parse(paramsObj);
    const result = await postsFactory().admin.adminFindPostWithFilter.execute({
      page: parsed.page,
      limit: parsed.limit,
      tagsId: parsed.tagsId,
      status: parsed.status,
      title: parsed.title,
      administratorId: session.user.id,
      fromDate: parsed.fromDate && new Date(parsed.fromDate),
      toDate: parsed.toDate && new Date(parsed.toDate),
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

    const result = await postsFactory().admin.addPost.execute({
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

    return NextResponse.json(
      postSchema
        .omit({ createdAt: true, modifiedAt: true, publishedAt: true })
        .extend({
          createdAt: z.date(),
          modifiedAt: z.date().optional(),
          publishedAt: z.date().optional(),
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
