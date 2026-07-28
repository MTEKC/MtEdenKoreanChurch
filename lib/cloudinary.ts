import { createHash } from 'node:crypto';

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
  original_filename?: string;
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

export interface SignedCloudinaryDocumentUpload {
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

export function createDocumentUploadSignature(): SignedCloudinaryDocumentUpload {
  const config = getCloudinaryConfig(process.env.CLOUDINARY_DOCUMENTS_FOLDER || 'church-resources');
  const timestamp = Math.floor(Date.now() / 1000);
  const parameters = {
    allowed_formats: 'pdf',
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
    uploadUrl: `https://api.cloudinary.com/v1_1/${config.cloudName}/raw/upload`,
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

async function uploadToCloudinary(
  file: File,
  config: CloudinaryConfig,
  resourceType: 'image' | 'raw'
) {
  const formData = new FormData();

  formData.append('file', file, file.name);
  formData.append('folder', config.folder);
  formData.append('use_filename', 'true');
  formData.append('unique_filename', 'true');
  formData.append('overwrite', 'false');

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`, {
    method: 'POST',
    headers: {
      Authorization: getAuthorizationHeader(config),
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Cloudinary upload failed: ${await parseCloudinaryError(response)}`);
  }

  return (await response.json()) as CloudinaryUploadResponse;
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

export async function uploadImageToCloudinary(file: File): Promise<UploadedCloudinaryImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files can be uploaded.');
  }

  const config = getCloudinaryConfig();
  const data = await uploadToCloudinary(file, config, 'image');

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
  return deleteFromCloudinary(publicId, config, 'image');
}

export async function deleteDocumentFromCloudinary(publicId: string) {
  const config = getCloudinaryConfig(process.env.CLOUDINARY_DOCUMENTS_FOLDER || 'church-resources');
  return deleteFromCloudinary(publicId, config, 'raw');
}
