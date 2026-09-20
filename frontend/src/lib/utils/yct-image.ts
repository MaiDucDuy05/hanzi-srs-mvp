/**
 * Resolves any YCT image key or raw S3 URL into an accessible public proxy URL.
 * Because the AWS S3 bucket is private, direct S3 URLs return 403 Forbidden.
 * This utility converts S3 keys/URLs into the /api/v1/resources/public/ endpoint
 * which serves the image with a valid presigned S3 signature.
 */
export function resolveYctImageUrl(imageKey?: string | null): string {
  if (!imageKey) return '';
  // If it already uses the public resource proxy path
  if (imageKey.startsWith('/api/v1/resources/public/')) {
    return imageKey;
  }
  // If it's a direct AWS S3 URL from storage-hsk, rewrite to public proxy
  if (imageKey.includes('.amazonaws.com/')) {
    const key = imageKey.split('.amazonaws.com/')[1];
    return `/api/v1/resources/public/${key}`;
  }
  // If it's an S3 key directly
  if (
    imageKey.startsWith('yct-images/') ||
    imageKey.startsWith('uploads/') ||
    imageKey.startsWith('resources/') ||
    imageKey.startsWith('audio/')
  ) {
    return `/api/v1/resources/public/${imageKey}`;
  }
  return imageKey;
}
