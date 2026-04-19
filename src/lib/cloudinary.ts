/**
 * Cloudinary Upload Utility
 * This utility handles image uploads to Cloudinary using Unsigned Uploads.
 * For production, consider using a Supabase Edge Function to sign uploads.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "Root";
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "ml_default";

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Échec de l'upload Cloudinary");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error: any) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};

/**
 * Generates an optimized Cloudinary URL with transformations
 */
export const getOptimizedUrl = (url: string, options: { width?: number; height?: number; crop?: string } = {}) => {
  if (!url || !url.includes("cloudinary.com")) return url;
  
  const parts = url.split("/upload/");
  if (parts.length !== 2) return url;
  
  const transformations = [];
  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  transformations.push("f_auto"); // Auto format
  transformations.push("q_auto"); // Auto quality
  
  return `${parts[0]}/upload/${transformations.join(",")}/${parts[1]}`;
};
