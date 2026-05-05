export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  imageUrl?: string;
  imageUrls?: string[];
  imagePaths?: string[];
  imageCount?: number;
  coverImageUrl?: string;
}

export function getGalleryImageUrls(item: GalleryItem) {
  if (Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
    return item.imageUrls;
  }

  if (item.imageUrl) {
    return [item.imageUrl];
  }

  return [];
}

export function getGalleryCoverImage(item: GalleryItem) {
  return item.coverImageUrl || getGalleryImageUrls(item)[0] || '';
}

export function getGalleryImageCount(item: GalleryItem) {
  return getGalleryImageUrls(item).length;
}

export function getGalleryStorageRefs(item: GalleryItem) {
  if (Array.isArray(item.imagePaths) && item.imagePaths.length > 0) {
    return item.imagePaths;
  }

  return getGalleryImageUrls(item);
}
