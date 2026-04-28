/**
 * Convert a Vimeo or YouTube URL to an embeddable URL.
 * vimeo.com/123456789 → player.vimeo.com/video/123456789
 * youtube.com/watch?v=xxx → youtube.com/embed/xxx
 * youtu.be/xxx → youtube.com/embed/xxx
 */
export function getEmbedUrl(url: string): string | null {
  if (!url) return null;

  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);

    // Vimeo
    if (u.hostname.includes("vimeo.com")) {
      // Already an embed URL
      if (u.hostname === "player.vimeo.com") return url;
      // Extract video ID from path
      const match = u.pathname.match(/\/(\d+)/);
      if (match) return `https://player.vimeo.com/video/${match[1]}`;
    }

    // YouTube
    if (u.hostname.includes("youtube.com")) {
      // Already an embed URL
      if (u.pathname.startsWith("/embed/")) return url;
      // Watch URL
      const videoId = u.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    // YouTube short URL
    if (u.hostname === "youtu.be") {
      const videoId = u.pathname.slice(1);
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Get thumbnail URL for a video.
 */
export function getVideoThumbnail(url: string): string | null {
  if (!url) return null;

  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);

    // YouTube thumbnail
    if (u.hostname.includes("youtube.com") || u.hostname === "youtu.be") {
      const videoId =
        u.hostname === "youtu.be"
          ? u.pathname.slice(1)
          : u.searchParams.get("v");
      if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

    // Vimeo thumbnails require API call, skip for MVP
    return null;
  } catch {
    return null;
  }
}
