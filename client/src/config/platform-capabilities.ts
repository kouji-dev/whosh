export type MediaType = "text" | "image" | "video";

export interface PlatformCapabilities {
  name: string;
  allowedMedia: MediaType[];
  maxTextLength: number;
}

export const PLATFORM_CAPABILITIES: Record<string, PlatformCapabilities> = {
  twitter: {
    name: "Twitter/X",
    allowedMedia: ["text", "image", "video"],
    maxTextLength: 280,
  },
  facebook: {
    name: "Facebook",
    allowedMedia: ["text", "image", "video"],
    maxTextLength: 63206,
  },
  instagram: {
    name: "Instagram",
    allowedMedia: ["text", "image", "video"],
    maxTextLength: 2200,
  },
  linkedin: {
    name: "LinkedIn",
    allowedMedia: ["text", "image", "video"],
    maxTextLength: 3000,
  },
  tiktok: {
    name: "TikTok",
    allowedMedia: ["text", "video"],
    maxTextLength: 150,
  },
  pinterest: {
    name: "Pinterest",
    allowedMedia: ["text", "image"],
    maxTextLength: 500,
  },
}; 