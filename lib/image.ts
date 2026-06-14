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

/** Remove background via remove.bg (server-side API key, ~2-5s). Returns a transparent PNG. */
export async function removeBg(file: File): Promise<File> {
  const form = new FormData();
  form.append('image_file', file);

  const res = await fetch('/api/remove-bg', { method: 'POST', body: form });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: 'Xóa nền thất bại' }));
    throw new Error(error ?? 'Xóa nền thất bại');
  }

  const blob = await res.blob();
  return new File([blob], file.name.replace(/\.[^.]+$/, '.png'), { type: 'image/png' });
}
