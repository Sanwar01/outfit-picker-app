import { Image, type ImageProps } from "expo-image";

type CachedImageProps = Omit<ImageProps, "cachePolicy">;

export function CachedImage(props: CachedImageProps) {
  return (
    <Image
      {...props}
      cachePolicy="memory-disk"
      transition={0}
    />
  );
}
