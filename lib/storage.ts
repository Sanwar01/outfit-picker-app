import { createAdminClient } from "@/lib/supabase/admin";

import { WARDROBE_BUCKET } from "@/lib/constants";

const BUCKET = WARDROBE_BUCKET;

export async function getSignedImageUrl(
  path: string,
  expiresIn = 3600
): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}

export async function getSignedImageUrls(
  paths: string[],
  expiresIn = 3600
): Promise<Record<string, string>> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUrls(paths, expiresIn);

  if (error || !data) {
    return {};
  }

  return data.reduce<Record<string, string>>((acc, item) => {
    if (item.signedUrl && item.path) {
      acc[item.path] = item.signedUrl;
    }
    return acc;
  }, {});
}

export { BUCKET };
