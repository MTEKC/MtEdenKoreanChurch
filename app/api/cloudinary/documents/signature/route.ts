import { NextResponse } from 'next/server';
import { createDocumentUploadSignature } from '@/lib/cloudinary';
import { AuthError, requireFirebaseUser } from '@/lib/firebase-auth-server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    await requireFirebaseUser(request);

    return NextResponse.json(createDocumentUploadSignature(), {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Cloudinary document signature error:', error);

    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to prepare PDF upload.' },
      { status: 500 }
    );
  }
}
