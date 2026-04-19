import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely extracts the first image URL from a product's image_url field,
 * which may be a JSON-encoded array of strings.
 */
export function getProductImage(imageUrl: string | null | undefined): string {
  if (!imageUrl) return "";
  
  // If it's a JSON array (starts with [), parse it and take the first item
  if (imageUrl.startsWith("[")) {
    try {
      const urls = JSON.parse(imageUrl);
      return Array.isArray(urls) && urls.length > 0 ? urls[0] : imageUrl;
    } catch (e) {
      return imageUrl;
    }
  }
  
  return imageUrl;
}
