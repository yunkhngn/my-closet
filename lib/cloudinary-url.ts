const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/**
 * Return a Cloudinary URL cropped to 3:4 portrait with AI gravity.
 * width is the rendered CSS pixel width; we request 2× for retina.
 */
export function portraitUrl(publicId: string, width = 400): string {
  const w = width * 2;
  return `https://res.cloudinary.com/${CLOUD}/image/upload/c_fill,g_auto,ar_3:4,w_${w},q_auto,f_auto/${publicId}`;
}
