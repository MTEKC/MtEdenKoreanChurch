import { NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { AuthError, requireFirebaseUser } from '@/lib/firebase-auth-server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    await requireFirebaseUser(request);

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing image file.' }, { status: 400 });
    }

    const uploadedImage = await uploadImageToCloudinary(file);

    return NextResponse.json(uploadedImage);
  } catch (error) {
    console.error('Cloudinary upload error:', error);

    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload image.' },
      { status: 500 }
    );
  }
}
