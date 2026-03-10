import { promises as fs } from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';

const cwd = process.cwd();
const insDir = path.join(cwd, 'ins');
const outputPath = path.join(insDir, 'CASE_REPORT.md');
const preferredDir = 'connections/followers_and_following/';
const followersPattern = /followers(?:_(\d+))?\.json$/i;
const followingPattern = /following(?:_(\d+))?\.json$/i;
const blockedPattern = /blocked_profiles(?:_(\d+))?\.json$/i;
const restrictedPattern = /restricted_profiles(?:_(\d+))?\.json$/i;
const instagramUrlPattern = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([A-Za-z0-9._]{1,30})/i;
const handlePattern = /^[A-Za-z0-9._]{1,30}$/;
const defaultMaxSizeMb = Number(process.env.INS_REPORT_MAX_SIZE_MB ?? 300);

function parseMaxSizeMbArg() {
  const arg = process.argv.find((item) => item.startsWith('--max-size-mb='));
  if (!arg) return defaultMaxSizeMb;
  const value = Number(arg.split('=')[1]);
  return Number.isFinite(value) && value > 0 ? value : defaultMaxSizeMb;
}

function fileName(filePath) {
  return filePath.split('/').pop() ?? filePath;
}

function partNumber(filePath) {
  return Number(filePath.match(/_(\d+)\.json$/)?.[1] ?? 0);
}

function scorePath(filePath) {
  let score = 0;
  if (filePath.includes('followers_and_following')) score += 2;
  if (filePath.includes('connections')) score += 1;
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

function scanZipFiles(zip) {
  const fileList = Object.keys(zip.files).filter((name) => !zip.files[name].dir);
  const allFollowersFiles = fileList.filter(isFollowersFile).sort(sortByPriority);
  const allFollowingFiles = fileList.filter(isFollowingFile).sort(sortByPriority);
  const allBlockedFiles = fileList.filter(isBlockedFile).sort(sortByPriority);
  const allRestrictedFiles = fileList.filter(isRestrictedFile).sort(sortByPriority);

  const followersFiles = (() => {
    const preferred = allFollowersFiles.filter(isInPreferredDir);
    return preferred.length > 0 ? preferred : allFollowersFiles;
  })();
  const followingFiles = (() => {
    const preferred = allFollowingFiles.filter(isInPreferredDir);
    return preferred.length > 0 ? preferred : allFollowingFiles;
  })();
  const blockedFiles = (() => {
    const preferred = allBlockedFiles.filter(isInPreferredDir);
    return preferred.length > 0 ? preferred : allBlockedFiles;
  })();
  const restrictedFiles = (() => {
    const preferred = allRestrictedFiles.filter(isInPreferredDir);
    return preferred.length > 0 ? preferred : allRestrictedFiles;
  })();

  return { fileList, followersFiles, followingFiles, blockedFiles, restrictedFiles };
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
    const cleaned = decodeURIComponent(candidate).replace(/^@/, '').toLowerCase();
    return handlePattern.test(cleaned) ? cleaned : null;
  } catch {
    const match = href.match(instagramUrlPattern);
    const fallback = match?.[1]?.toLowerCase() ?? null;
    if (fallback && fallback !== '_u') return fallback;
    return null;
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
    const trimmed = str.trim().replace(/^@/, '');
    const normalized = trimmed.toLowerCase();
    if (handlePattern.test(trimmed) && !seen.has(normalized)) {
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
      extracted.push(value.trim().toLowerCase());
      continue;
    }
    const fromHref = extractFromHref(data?.href);
    if (fromHref) extracted.push(fromHref);
  }

  return extracted;
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

function extractUsernames(entries) {
  const usernames = [];
  let skipCount = 0;

  for (const item of entries) {
    const fromListData = extractFromListData(item?.string_list_data);
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

function normalize(list) {
  return Array.from(new Set(list.map((item) => item.trim().toLowerCase()).filter(Boolean)));
}

function setOps(followers, following) {
  const followersSet = new Set(normalize(followers));
  const followingSet = new Set(normalize(following));
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

async function readEntries(zip, targetFiles) {
  let entries = [];
  for (const filePath of targetFiles) {
    const file = zip.file(filePath);
    if (!file) continue;
    const text = await file.async('string');
    const json = JSON.parse(text);
    entries = entries.concat(extractEntries(json));
  }
  return entries;
}

function toMb(bytes) {
  return (bytes / (1024 * 1024)).toFixed(1);
}

async function createReport() {
  const maxSizeMb = parseMaxSizeMbArg();
  const maxBytes = maxSizeMb * 1024 * 1024;
  const files = await fs.readdir(insDir);
  const zipNames = files.filter((name) => name.toLowerCase().endsWith('.zip')).sort((a, b) => a.localeCompare(b));
  const createdAt = new Date().toISOString();
  const rows = [];
  const details = [];

  for (const zipName of zipNames) {
    const fullPath = path.join(insDir, zipName);
    const stat = await fs.stat(fullPath);
    if (stat.size > maxBytes) {
      rows.push(`| ${zipName} | SKIPPED | - | - | - | - | - | - | 파일 크기 ${toMb(stat.size)}MB > 제한 ${maxSizeMb}MB |`);
      continue;
    }

    try {
      const buffer = await fs.readFile(fullPath);
      const zip = await JSZip.loadAsync(buffer);
      const scan = scanZipFiles(zip);

      if (scan.followersFiles.length === 0 || scan.followingFiles.length === 0) {
        rows.push(`| ${zipName} | FAILED | 0 | 0 | 0 | 0 | 0 | 0 | followers/following 파일 없음 |`);
        continue;
      }

      const followersEntries = await readEntries(zip, scan.followersFiles);
      const followingEntries = await readEntries(zip, scan.followingFiles);
      const blockedEntries = await readEntries(zip, scan.blockedFiles);
      const restrictedEntries = await readEntries(zip, scan.restrictedFiles);

      const followersResult = extractUsernames(followersEntries);
      const followingResult = extractUsernames(followingEntries);
      const blockedResult = extractUsernames(blockedEntries);
      const restrictedResult = extractUsernames(restrictedEntries);

      const followers = normalize(followersResult.usernames);
      const following = normalize(followingResult.usernames);
      const blocked = normalize(blockedResult.usernames);
      const restricted = normalize(restrictedResult.usernames);
      const ops = setOps(followers, following);
      const skipCount =
        followersResult.skipCount +
        followingResult.skipCount +
        blockedResult.skipCount +
        restrictedResult.skipCount;

      rows.push(
        `| ${zipName} | OK | ${following.length} | ${followers.length} | ${ops.fans.length} | ${ops.unfollowers.length} | ${restricted.length} | ${blocked.length} | skip=${skipCount} |`
      );

      details.push(
        `### ${zipName}
- followers files: ${scan.followersFiles.length}
- following files: ${scan.followingFiles.length}
- restricted files: ${scan.restrictedFiles.length}
- blocked files: ${scan.blockedFiles.length}
- zip entries: ${scan.fileList.length}
- skip count: ${skipCount}
`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      rows.push(`| ${zipName} | FAILED | - | - | - | - | - | - | ${message.replace(/\|/g, '/')} |`);
    }
  }

  const report = `# INS Case Report

- created at: ${createdAt}
- max zip size: ${maxSizeMb}MB (change with \`--max-size-mb=NNN\` or \`INS_REPORT_MAX_SIZE_MB\`)

| case | status | 팔로우 | 팔로워 | 언팔로우 | 언팔로워 | 제한 | 차단 | note |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
${rows.join('\n')}

## Details
${details.length > 0 ? details.join('\n') : '- 없음'}
`;

  await fs.writeFile(outputPath, report, 'utf8');
  console.log(`리포트 생성 완료: ${outputPath}`);
}

createReport().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
