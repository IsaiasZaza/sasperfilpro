import { cache } from "react";
import { publicApi } from "@/lib/api-client";
import { hydrateBlockLook } from "@/lib/block-look";
import type { PublicPage } from "@/lib/types/profile";

export const loadPublicPage = cache(
  async (username: string): Promise<PublicPage | null> => {
    try {
      const page = await publicApi.getPage(username);
      return {
        ...page,
        blocks: (page.blocks || []).map((block) => hydrateBlockLook(block)),
      };
    } catch {
      return null;
    }
  },
);
