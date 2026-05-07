export type ExtractResult = {
  usernames: string[];
  skipCount: number;
};

const instagramUrlPattern = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([A-Za-z0-9._]{1,30})/i;
const handlePattern = /^[A-Za-z0-9._]{1,30}$/;

function extractFromHref(href: unknown): string | null {
  if (typeof href !== 'string') return null;

  try {
    const normalizedHref = href.startsWith('http') ? href : `https://${href.replace(/^\/+/, '')}`;
    const url = new URL(normalizedHref);
    const host = url.hostname.toLowerCase();
    if (!(host === 'instagram.com' || host.endsWith('.instagram.com'))) return null;

    const segments = url.pathname
      .split('/')
      .map((segment) => segment.trim())
      .filter(Boolean);

    if (segments.length === 0) return null;

    // Instagram export sometimes stores links like /_u/<username>/...
    const candidate = segments[0].toLowerCase() === '_u' && segments[1] ? segments[1] : segments[0];
    const cleaned = decodeURIComponent(candidate).replace(/^@/, '').toLowerCase();

    if (handlePattern.test(cleaned)) return cleaned;
    return null;
  } catch {
    const match = href.match(instagramUrlPattern);
    const fallback = match?.[1]?.toLowerCase() ?? null;
    if (fallback && fallback !== '_u') return fallback;
    return null;
  }
}

function collectStrings(value: unknown, collector: string[]) {
  if (typeof value === 'string') {
    collector.push(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, collector));
    return;
  }
  if (value && typeof value === 'object') {
    Object.values(value as Record<string, unknown>).forEach((item) => collectStrings(item, collector));
  }
}

function findHandlesInObject(item: unknown): string[] {
  const strings: string[] = [];
  collectStrings(item, strings);
  const extracted: string[] = [];
  const seen = new Set<string>();

  for (const str of strings) {
    const fromUrl = extractFromHref(str);
    if (fromUrl && !seen.has(fromUrl)) {
      seen.add(fromUrl);
      extracted.push(fromUrl);
    }
  }

  for (const str of strings) {
    const trimmed = str.trim().replace(/^@/, '');
    const normalized = trimmed.toLowerCase();
    if (handlePattern.test(trimmed) && !seen.has(normalized)) {
      seen.add(normalized);
      extracted.push(normalized);
    }
  }

  return extracted;
}

function extractFromListData(listData: Array<{ value?: unknown; href?: unknown }> | undefined): string[] {
  if (!listData || listData.length === 0) return [];

  const extracted: string[] = [];
  for (const data of listData) {
    const value = data?.value;
    if (typeof value === 'string' && value.trim().length > 0) {
      extracted.push(value.trim().toLowerCase());
      continue;
    }

    const fromHref = extractFromHref(data?.href);
    if (fromHref) {
      extracted.push(fromHref);
    }
  }

  return extracted;
}

export function extractUsernames(entries: unknown[]): ExtractResult {
  const usernames: string[] = [];
  let skipCount = 0;

  for (const item of entries) {
    const listData = (item as { string_list_data?: Array<{ value?: unknown; href?: unknown }> })
      ?.string_list_data;

    const fromListData = extractFromListData(listData);
    if (fromListData.length > 0) {
      usernames.push(...fromListData);
      continue;
    }

    const fallback = findHandlesInObject(item);
    if (fallback.length > 0) {
      usernames.push(...fallback);
    } else {
      skipCount += 1;
    }
  }

  return { usernames, skipCount };
}
