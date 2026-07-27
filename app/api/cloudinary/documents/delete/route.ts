import { NextResponse } from 'next/server';
import { deleteDocumentFromCloudinary } from '@/lib/cloudinary';
import { AuthError, requireFirebaseUser } from '@/lib/firebase-auth-server';

export const runtime = 'nodejs';

interface DeleteRequestBody {
  publicId?: unknown;
}

export async function POST(request: Request) {
  try {
    await requireFirebaseUser(request);

    const body = (await request.json()) as DeleteRequestBody;
    if (typeof body.publicId !== 'string' || !body.publicId.trim()) {
      return NextResponse.json({ error: 'Missing document identifier.' }, { status: 400 });
    }

    await deleteDocumentFromCloudinary(body.publicId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cloudinary document delete error:', error);

    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete PDF.' },
      { status: 500 }
    );
  }
}
