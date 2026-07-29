import { NextResponse } from 'next/server';
import { createGalleryUploadSignature } from '@/lib/cloudinary';
import { AuthError, requireFirebaseUser } from '@/lib/firebase-auth-server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    await requireFirebaseUser(request);

    return NextResponse.json(createGalleryUploadSignature(), {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Cloudinary gallery signature error:', error);

    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : '갤러리 업로드 준비에 실패했습니다.' },
      { status: 500 }
    );
  }
}
