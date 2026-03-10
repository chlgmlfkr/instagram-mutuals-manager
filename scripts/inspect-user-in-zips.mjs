import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const cwd = process.cwd();
const insDir = path.join(cwd, 'ins');
const target = process.argv[2]?.trim().toLowerCase().replace(/^@/, '');

if (!target) {
  console.error('사용법: npm run inspect:user -- <instagram_username>');
  process.exit(1);
}

const followersCandidates = [
  'connections/followers_and_following/followers_1.json',
  'connections/followers_and_following/followers.json'
];
const followingCandidates = [
  'connections/followers_and_following/following.json',
  'connections/followers_and_following/following_1.json'
];
const blockedCandidates = [
  'connections/followers_and_following/blocked_profiles.json',
  'connections/followers_and_following/blocked_profiles_1.json'
];
const restrictedCandidates = [
  'connections/followers_and_following/restricted_profiles.json',
  'connections/followers_and_following/restricted_profiles_1.json'
];

function zipPathExists(zipFile, innerPath) {
  const result = spawnSync('unzip', ['-l', zipFile, innerPath], { encoding: 'utf8' });
  return result.status === 0 && result.stdout.includes(innerPath);
}

function readZipJson(zipFile, candidates) {
  const innerPath = candidates.find((candidate) => zipPathExists(zipFile, candidate));
  if (!innerPath) return { innerPath: null, json: null };

  const result = spawnSync('unzip', ['-p', zipFile, innerPath], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 512
  });

  if (result.status !== 0 || !result.stdout) {
    return { innerPath, json: null };
  }

  try {
    return { innerPath, json: JSON.parse(result.stdout) };
  } catch {
    return { innerPath, json: null };
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

function extractEntries(data) {
  const entries = [];

  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    if (Array.isArray(node.string_list_data)) {
      entries.push(node);
    }

    Object.values(node).forEach(walk);
  }

  walk(data);
  return entries;
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
    return decodeURIComponent(candidate).replace(/^@/, '').toLowerCase();
  } catch {
    return null;
  }
}

function extractUsernames(entries) {
  const usernames = [];

  for (const item of entries) {
    const listData = item?.string_list_data;
    if (Array.isArray(listData) && listData.length > 0) {
      for (const data of listData) {
        if (typeof data?.value === 'string' && data.value.trim()) {
          usernames.push(data.value.trim().toLowerCase());
          continue;
        }
        const fromHref = extractFromHref(data?.href);
        if (fromHref) usernames.push(fromHref);
      }
      continue;
    }

    const strings = [];
    collectStrings(item, strings);
    for (const str of strings) {
      const fromHref = extractFromHref(str);
      if (fromHref) usernames.push(fromHref);
    }
  }

  return Array.from(new Set(usernames));
}

function inspectSection(label, data) {
  if (!data.json) {
    return {
      label,
      found: false,
      rawHit: false,
      path: data.innerPath,
      entries: 0
    };
  }

  const text = JSON.stringify(data.json).toLowerCase();
  const entries = extractEntries(data.json);
  const usernames = extractUsernames(entries);

  return {
    label,
    found: usernames.includes(target),
    rawHit: text.includes(target),
    path: data.innerPath,
    entries: entries.length
  };
}

function classify(sections) {
  const followers = sections.followers.found;
  const following = sections.following.found;
  const blocked = sections.blocked.found;
  const restricted = sections.restricted.found;

  if (blocked) return '차단';
  if (restricted) return '제한';
  if (followers && following) return '맞팔';
  if (followers) return '언팔로우';
  if (following) return '언팔로워';
  return '미검출';
}

const zipNames = (await readdir(insDir))
  .filter((name) => name.toLowerCase().endsWith('.zip'))
  .sort((a, b) => a.localeCompare(b));

for (const zipName of zipNames) {
  const zipFile = path.join(insDir, zipName);
  const sections = {
    followers: inspectSection('followers', readZipJson(zipFile, followersCandidates)),
    following: inspectSection('following', readZipJson(zipFile, followingCandidates)),
    blocked: inspectSection('blocked', readZipJson(zipFile, blockedCandidates)),
    restricted: inspectSection('restricted', readZipJson(zipFile, restrictedCandidates))
  };

  console.log(`\n[${zipName}] ${classify(sections)}`);
  for (const section of Object.values(sections)) {
    const pathLabel = section.path ?? '없음';
    console.log(
      `- ${section.label}: extracted=${section.found ? 'Y' : 'N'}, raw=${section.rawHit ? 'Y' : 'N'}, entries=${section.entries}, path=${pathLabel}`
    );
  }
}
