const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

function validVideoId(value: string | null | undefined) {
  const candidate = value?.trim() || '';
  return YOUTUBE_ID_PATTERN.test(candidate) ? candidate : '';
}

export function getYouTubeVideoId(value: string) {
  const trimmedValue = value.trim();
  const directId = validVideoId(trimmedValue);

  if (directId) {
    return directId;
  }

  const valueWithProtocol = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  try {
    const url = new URL(valueWithProtocol);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '');

    if (hostname === 'youtu.be') {
      return validVideoId(url.pathname.split('/').filter(Boolean)[0]);
    }

    if (
      hostname === 'youtube.com'
      || hostname === 'm.youtube.com'
      || hostname === 'music.youtube.com'
    ) {
      const queryId = validVideoId(url.searchParams.get('v'));
      if (queryId) {
        return queryId;
      }

      const pathParts = url.pathname.split('/').filter(Boolean);
      if (['embed', 'shorts', 'live'].includes(pathParts[0])) {
        return validVideoId(pathParts[1]);
      }
    }
  } catch {
    return '';
  }

  return '';
}

export function getYouTubeWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
