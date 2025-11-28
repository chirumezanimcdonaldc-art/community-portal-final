export const CLOUDINARY_UPLOAD_PRESET = 'AppWhatsAppBot';
export const CLOUDINARY_CLOUD_NAME = 'dln1sjqtu';
export const CLOUDINARY_API_KEY = '912472377767219';
export const CLOUDINARY_API_SECRET = '9V6k7UwtY_w2SbtmqM9cGlDqZMk';

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload image to Cloudinary');
  }

  const data = await response.json();
  return data.secure_url;
};
