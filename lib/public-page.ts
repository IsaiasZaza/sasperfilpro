import { cache } from "react";
import { publicApi } from "@/lib/api-client";
import type { PublicPage } from "@/lib/types/profile";

export const loadPublicPage = cache(
  async (username: string): Promise<PublicPage | null> => {
    try {
      return await publicApi.getPage(username);
    } catch {
      return null;
    }
  },
);
