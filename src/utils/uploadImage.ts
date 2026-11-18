import { Platform } from "react-native";

/**
 * The "file" value for a Cloudinary upload form. On phones React Native's FormData takes
 * { uri, name, type }; in a browser that object would be sent as the text "[object Object]",
 * so there a data: URL is sent as-is (Cloudinary accepts it) and a blob: URL is read into a Blob.
 */
export const imageFileField = async (uri: string, name: string, type: string): Promise<any> => {
  if (Platform.OS !== "web") return { uri, name, type };
  if (uri.startsWith("data:")) return uri;
  const blob = await (await fetch(uri)).blob();
  return new File([blob], name, { type: blob.type || type });
};

const uploadLocalImage = async (uri: string, folder: string): Promise<string> => {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !preset) {
    throw new Error("Image upload is not configured");
  }

  const ext = uri.split(".").pop()?.split("?")[0]?.toLowerCase() || "jpg";
  const mimeType = ext === "png" ? "image/png" : "image/jpeg";
  const file = await imageFileField(uri, `photo.${ext}`, mimeType);

  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", preset);
    form.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/upload`);
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
          resolve(data.secure_url);
        } else {
          reject(new Error(data?.error?.message || "Image upload failed"));
        }
      } catch {
        reject(new Error("Failed to read the image upload response"));
      }
    };
    xhr.onerror = () => reject(new Error("Network error while uploading the image"));
    xhr.send(form);
  });
};

export async function resolveImageUrl(imageUrl: string | undefined, folder: string) {
  if (!imageUrl || imageUrl.startsWith("https")) return imageUrl;
  return uploadLocalImage(imageUrl, folder);
}
