const uploadLocalImage = (uri: string, folder: string): Promise<string> => {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !preset) {
    return Promise.reject(new Error("Image upload is not configured"));
  }

  const ext = uri.split(".").pop()?.split("?")[0]?.toLowerCase() || "jpg";
  const mimeType = ext === "png" ? "image/png" : "image/jpeg";

  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", { uri, name: `photo.${ext}`, type: mimeType } as any);
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
