import type { MediaUpload } from "common/types/inventory";

export async function toMediaUpload(file: File): Promise<MediaUpload> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Выберите PNG, JPEG или WebP");
  if (file.size > 5 * 1024 * 1024)
    throw new Error("Размер файла не должен превышать 5 МБ");
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({ filename: file.name, dataUrl: String(reader.result) });
    reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
    reader.readAsDataURL(file);
  });
}
