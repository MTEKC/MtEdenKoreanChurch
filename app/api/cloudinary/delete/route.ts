import { NextResponse } from 'next/server';
import { deleteImageFromCloudinary } from '@/lib/cloudinary';
import { AuthError, requireFirebaseUser } from '@/lib/firebase-auth-server';

export const runtime = 'nodejs';

interface DeleteRequestBody {
  publicIds?: unknown;
}

export async function POST(request: Request) {
  try {
    await requireFirebaseUser(request);

    const body = (await request.json()) as DeleteRequestBody;
    const publicIds = Array.isArray(body.publicIds)
      ? body.publicIds.filter((publicId): publicId is string => typeof publicId === 'string' && publicId.length > 0)
      : [];

    if (publicIds.length === 0) {
      return NextResponse.json({ deleted: [], failed: [] });
    }

    const results = await Promise.allSettled(
      publicIds.map(async (publicId) => ({
        publicId,
        result: await deleteImageFromCloudinary(publicId),
      }))
    );

    const deleted = results
      .filter((result): result is PromiseFulfilledResult<{ publicId: string; result: string }> => result.status === 'fulfilled')
      .map((result) => result.value);
    const failed = results.flatMap((result, index) => {
      if (result.status === 'fulfilled') {
        return [];
      }

      return [{
        publicId: publicIds[index],
        error: result.reason instanceof Error ? result.reason.message : 'Delete failed.',
      }];
    });

    return NextResponse.json({ deleted, failed });
  } catch (error) {
    console.error('Cloudinary delete error:', error);

    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete image.' },
      { status: 500 }
    );
  }
}
