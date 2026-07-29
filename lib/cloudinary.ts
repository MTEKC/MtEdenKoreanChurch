import { createHash } from 'node:crypto';

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder: string;
}

interface CloudinaryDestroyResponse {
  result?: string;
}

export interface SignedCloudinaryUpload {
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  allowedFormats: string;
  useFilename: boolean;
  uniqueFilename: boolean;
  overwrite: boolean;
}

function getCloudinaryConfig(folder = process.env.CLOUDINARY_GALLERY_FOLDER || 'church-gallery'): CloudinaryConfig {
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
    folder,
  };
}

function createUploadSignature(
  config: CloudinaryConfig,
  resourceType: 'image' | 'raw',
  allowedFormats: string
): SignedCloudinaryUpload {
  const timestamp = Math.floor(Date.now() / 1000);
  const parameters = {
    allowed_formats: allowedFormats,
    folder: config.folder,
    overwrite: 'false',
    timestamp: String(timestamp),
    unique_filename: 'true',
    use_filename: 'true',
  };
  const stringToSign = Object.entries(parameters)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  const signature = createHash('sha1')
    .update(`${stringToSign}${config.apiSecret}`)
    .digest('hex');

  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`,
    apiKey: config.apiKey,
    timestamp,
    signature,
    folder: config.folder,
    allowedFormats: parameters.allowed_formats,
    useFilename: true,
    uniqueFilename: true,
    overwrite: false,
  };
}

export function createGalleryUploadSignature(): SignedCloudinaryUpload {
  return createUploadSignature(
    getCloudinaryConfig(),
    'image',
    'jpg,jpeg,png,webp,gif'
  );
}

export function createDocumentUploadSignature(): SignedCloudinaryUpload {
  return createUploadSignature(
    getCloudinaryConfig(process.env.CLOUDINARY_DOCUMENTS_FOLDER || 'church-resources'),
    'raw',
    'pdf'
  );
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

async function deleteFromCloudinary(
  publicId: string,
  config: CloudinaryConfig,
  resourceType: 'image' | 'raw'
) {
  if (!publicId.startsWith(`${config.folder}/`)) {
    throw new Error('Refusing to delete a file outside the configured Cloudinary folder.');
  }

  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('invalidate', 'true');

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/destroy`, {
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

export async function deleteImageFromCloudinary(publicId: string) {
  const config = getCloudinaryConfig();
  return deleteFromCloudinary(publicId, config, 'image');
}

export async function deleteDocumentFromCloudinary(publicId: string) {
  const config = getCloudinaryConfig(process.env.CLOUDINARY_DOCUMENTS_FOLDER || 'church-resources');
  return deleteFromCloudinary(publicId, config, 'raw');
}
