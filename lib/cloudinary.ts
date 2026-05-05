interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder: string;
}

interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
}

interface CloudinaryDestroyResponse {
  result?: string;
}

export interface UploadedCloudinaryImage {
  publicId: string;
  secureUrl: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
}

function getCloudinaryConfig(): CloudinaryConfig {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
  const apiKey = process.env.CLOUDINARY_API_KEY || '';
  const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

  const missing = [
    ['CLOUDINARY_CLOUD_NAME', cloudName],
    ['CLOUDINARY_API_KEY', apiKey],
    ['CLOUDINARY_API_SECRET', apiSecret],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Missing Cloudinary environment variables: ${missing.join(', ')}`);
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
    folder: process.env.CLOUDINARY_GALLERY_FOLDER || 'church-gallery',
  };
}

function getAuthorizationHeader(config: CloudinaryConfig) {
  return `Basic ${Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString('base64')}`;
}

async function parseCloudinaryError(response: Response) {
  try {
    const data = (await response.json()) as { error?: { message?: string } };
    return data.error?.message || response.statusText;
  } catch {
    return response.statusText;
  }
}

export async function uploadImageToCloudinary(file: File): Promise<UploadedCloudinaryImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files can be uploaded.');
  }

  const config = getCloudinaryConfig();
  const formData = new FormData();

  formData.append('file', file, file.name);
  formData.append('folder', config.folder);
  formData.append('use_filename', 'true');
  formData.append('unique_filename', 'true');
  formData.append('overwrite', 'false');

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
    method: 'POST',
    headers: {
      Authorization: getAuthorizationHeader(config),
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Cloudinary upload failed: ${await parseCloudinaryError(response)}`);
  }

  const data = (await response.json()) as CloudinaryUploadResponse;

  return {
    publicId: data.public_id,
    secureUrl: data.secure_url,
    width: data.width,
    height: data.height,
    bytes: data.bytes,
    format: data.format,
  };
}

export async function deleteImageFromCloudinary(publicId: string) {
  const config = getCloudinaryConfig();
  const formData = new FormData();

  formData.append('public_id', publicId);
  formData.append('invalidate', 'true');

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`, {
    method: 'POST',
    headers: {
      Authorization: getAuthorizationHeader(config),
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Cloudinary delete failed: ${await parseCloudinaryError(response)}`);
  }

  const data = (await response.json()) as CloudinaryDestroyResponse;

  return data.result || 'ok';
}
