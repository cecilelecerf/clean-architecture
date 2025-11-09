import { NextRequest, NextResponse } from 'next/server';
import { postsFactory } from '@infrastructure/adapters/db/mysql/factories/posts';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
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
      if (key === 'limit' || key === 'page') return (paramsObj[key] = Number(val));
      paramsObj[key] = val;
    });
    const parsed = querySchema.parse(paramsObj);
    const result = await postsFactory().client.clientFindPostWithFilter.execute({
      page: parsed.page,
      limit: parsed.limit,
      tagsId: parsed.tagsId,
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
