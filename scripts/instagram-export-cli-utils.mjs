const preferredDir = 'connections/followers_and_following/';
const followersPattern = /followers(?:_(\d+))?\.json$/i;
const followingPattern = /following(?:_(\d+))?\.json$/i;
const blockedPattern = /blocked_profiles(?:_(\d+))?\.json$/i;
const restrictedPattern = /restricted_profiles(?:_(\d+))?\.json$/i;
const instagramUrlPattern = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([A-Za-z0-9._]{1,30})/i;
const handlePattern = /^[A-Za-z0-9._]{1,30}$/;
const reservedInstagramRoutes = new Set([
  'about',
  'accounts',
  'api',
  'challenge',
  'developer',
  'direct',
  'explore',
  'graphql',
  'legal',
  'oauth',
  'p',
  'privacy',
  'reel',
  'reels',
  'stories',
  'terms',
  'tv'
]);

function fileName(filePath) {
  return filePath.split('/').pop() ?? filePath;
}

function directoryName(filePath) {
  const index = filePath.lastIndexOf('/');
  return index >= 0 ? filePath.slice(0, index + 1) : '';
}

function partNumber(filePath) {
  return Number(filePath.match(/_(\d+)\.json$/)?.[1] ?? 0);
}

function scorePath(filePath) {
  const normalized = filePath.toLowerCase();
  let score = 0;
  if (normalized.includes('followers_and_following')) score += 2;
  if (normalized.includes('connections')) score += 1;
  return score;
}

function sortByPriority(a, b) {
  const scoreDiff = scorePath(b) - scorePath(a);
  if (scoreDiff !== 0) return scoreDiff;
  return partNumber(a) - partNumber(b);
}

function isInPreferredDir(filePath) {
  return filePath.toLowerCase().includes(preferredDir);
}

function isFollowersFile(filePath) {
  return followersPattern.test(fileName(filePath));
}

function isFollowingFile(filePath) {
  return followingPattern.test(fileName(filePath));
}

function isBlockedFile(filePath) {
  return blockedPattern.test(fileName(filePath));
}

function isRestrictedFile(filePath) {
  return restrictedPattern.test(fileName(filePath));
}

function chooseRelationshipDir(followersFiles, followingFiles) {
  const followersDirs = new Set(followersFiles.map(directoryName));
  const followingDirs = new Set(followingFiles.map(directoryName));
  const completeDirs = Array.from(followersDirs)
    .filter((dir) => followingDirs.has(dir))
    .sort((a, b) => {
      const scoreDiff = scorePath(b) - scorePath(a);
      if (scoreDiff !== 0) return scoreDiff;
      return a.localeCompare(b);
    });

  return completeDirs[0];
}

function filterByDir(paths, dir) {
  return dir ? paths.filter((filePath) => directoryName(filePath) === dir) : paths;
}

function selectRelationshipFiles(allFollowersFiles, allFollowingFiles, allBlockedFiles, allRestrictedFiles) {
  const preferredFollowersFiles = allFollowersFiles.filter(isInPreferredDir);
  const preferredFollowingFiles = allFollowingFiles.filter(isInPreferredDir);
  const preferredBlockedFiles = allBlockedFiles.filter(isInPreferredDir);
  const preferredRestrictedFiles = allRestrictedFiles.filter(isInPreferredDir);

  const followersPool = preferredFollowersFiles.length > 0 ? preferredFollowersFiles : allFollowersFiles;
  const followingPool = preferredFollowingFiles.length > 0 ? preferredFollowingFiles : allFollowingFiles;
  const selectedDir = chooseRelationshipDir(followersPool, followingPool);

  return {
    followersFiles: filterByDir(followersPool, selectedDir),
    followingFiles: filterByDir(followingPool, selectedDir),
    blockedFiles: filterByDir(preferredBlockedFiles.length > 0 ? preferredBlockedFiles : allBlockedFiles, selectedDir),
    restrictedFiles: filterByDir(
      preferredRestrictedFiles.length > 0 ? preferredRestrictedFiles : allRestrictedFiles,
      selectedDir
    )
  };
}

export function scanZipFiles(zip) {
  const fileList = Object.keys(zip.files).filter((name) => !zip.files[name].dir);
  const allFollowersFiles = fileList.filter(isFollowersFile).sort(sortByPriority);
  const allFollowingFiles = fileList.filter(isFollowingFile).sort(sortByPriority);
  const allBlockedFiles = fileList.filter(isBlockedFile).sort(sortByPriority);
  const allRestrictedFiles = fileList.filter(isRestrictedFile).sort(sortByPriority);

  return {
    ...selectRelationshipFiles(allFollowersFiles, allFollowingFiles, allBlockedFiles, allRestrictedFiles),
    fileList
  };
}

function normalizeHandle(value) {
  const cleaned = value.trim().replace(/^@/, '').toLowerCase();
  if (reservedInstagramRoutes.has(cleaned)) return null;
  if (handlePattern.test(cleaned)) return cleaned;
  return null;
}

function extractFromHref(href) {
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

    const candidate = segments[0].toLowerCase() === '_u' && segments[1] ? segments[1] : segments[0];
    return normalizeHandle(decodeURIComponent(candidate));
  } catch {
    const match = href.match(instagramUrlPattern);
    const fallback = match?.[1] ?? null;
    if (!fallback || fallback.toLowerCase() === '_u') return null;
    return normalizeHandle(fallback);
  }
}

function collectStrings(value, collector) {
  if (typeof value === 'string') {
    collector.push(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, collector));
    return;
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectStrings(item, collector));
  }
}

function findHandlesInObject(item) {
  const strings = [];
  collectStrings(item, strings);
  const extracted = [];
  const seen = new Set();

  for (const str of strings) {
    const fromUrl = extractFromHref(str);
    if (fromUrl && !seen.has(fromUrl)) {
      seen.add(fromUrl);
      extracted.push(fromUrl);
    }
  }

  for (const str of strings) {
    const normalized = normalizeHandle(str.trim().replace(/^@/, ''));
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      extracted.push(normalized);
    }
  }

  return extracted;
}

function extractFromListData(listData) {
  if (!listData || listData.length === 0) return [];

  const extracted = [];
  for (const data of listData) {
    const value = data?.value;
    if (typeof value === 'string' && value.trim().length > 0) {
      const normalized = normalizeHandle(value);
      if (normalized) {
        extracted.push(normalized);
        continue;
      }
    }

    const fromHref = extractFromHref(data?.href);
    if (fromHref) {
      extracted.push(fromHref);
    }
  }

  return extracted;
}

export function extractEntries(data) {
  const entries = [];

  function walk(node, insideStringListData = false) {
    if (!node || typeof node !== 'object') return;

    if (Array.isArray(node)) {
      node.forEach((item) => walk(item, insideStringListData));
      return;
    }

    if (Array.isArray(node.string_list_data)) {
      entries.push(node);
    } else if (!insideStringListData && typeof node.href === 'string') {
      entries.push(node);
    }

    Object.entries(node).forEach(([key, value]) => {
      walk(value, insideStringListData || key === 'string_list_data');
    });
  }

  walk(data);
  return entries;
}

export function extractUsernames(entries) {
  const usernames = [];
  let skipCount = 0;

  for (const item of entries) {
    const listData = item?.string_list_data;
    const fromListData = extractFromListData(listData);
    if (fromListData.length > 0) {
      usernames.push(...fromListData);
      continue;
    }

    if (Array.isArray(listData)) {
      skipCount += 1;
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

export function normalizeUsernames(list) {
  return Array.from(new Set(list.map((item) => item.trim().toLowerCase()).filter(Boolean)));
}

export function setOps(followers, following) {
  const followersSet = new Set(normalizeUsernames(followers));
  const followingSet = new Set(normalizeUsernames(following));
  const unfollowers = [];
  const fans = [];
  const mutuals = [];

  for (const user of followingSet) {
    if (followersSet.has(user)) mutuals.push(user);
    else unfollowers.push(user);
  }
  for (const user of followersSet) {
    if (!followingSet.has(user)) fans.push(user);
  }

  return { unfollowers, fans, mutuals };
}

export async function readSection(zip, paths) {
  const entries = [];
  const textParts = [];

  for (const filePath of paths) {
    const file = zip.file(filePath);
    if (!file) continue;
    const text = await file.async('string');
    textParts.push(text);
    entries.push(...extractEntries(JSON.parse(text)));
  }

  const result = extractUsernames(entries);
  return {
    paths,
    entries,
    text: textParts.join('\n'),
    usernames: normalizeUsernames(result.usernames),
    skipCount: result.skipCount
  };
}
