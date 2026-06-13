import imageCompression from 'browser-image-compression';

/** Resize to ~800px on the long edge and re-encode as WebP. */
export async function compressImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxWidthOrHeight: 800,
    maxSizeMB: 0.5,
    fileType: 'image/webp',
    useWebWorker: true,
  });
}
