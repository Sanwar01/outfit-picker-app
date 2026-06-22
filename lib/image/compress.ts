import imageCompression from "browser-image-compression";

export async function compressImage(file: File): Promise<File> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: "image/webp",
  });

  return new File([compressed], file.name.replace(/\.[^.]+$/, ".webp"), {
    type: "image/webp",
  });
}
