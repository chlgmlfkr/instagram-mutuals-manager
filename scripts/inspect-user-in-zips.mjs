import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import JSZip from 'jszip';
import { readSection, scanZipFiles } from './instagram-export-cli-utils.mjs';

const cwd = process.cwd();
const insDir = path.join(cwd, 'ins');
const target = process.argv[2]?.trim().toLowerCase().replace(/^@/, '');

if (!target) {
  console.error('사용법: npm run inspect:user -- <instagram_username>');
  process.exit(1);
}

async function inspectSection(label, sectionPromise) {
  const section = await sectionPromise;
  const rawHit = section.text.toLowerCase().includes(target);

  return {
    label,
    found: section.usernames.includes(target),
    rawHit,
    paths: section.paths,
    entries: section.entries.length
  };
}

function pathLabel(paths) {
  return paths.length > 0 ? paths.join(', ') : '없음';
}

function classify(sections) {
  const followers = sections.followers.found;
  const following = sections.following.found;
  const blocked = sections.blocked.found;
  const restricted = sections.restricted.found;

  if (blocked) return '차단';
  if (restricted) return '제한';
  if (followers && following) return '맞팔';
  if (followers) return '나를 팔로우함';
  if (following) return '언팔로워 후보';
  return '미검출';
}

const zipNames = (await readdir(insDir))
  .filter((name) => name.toLowerCase().endsWith('.zip'))
  .sort((a, b) => a.localeCompare(b));

for (const zipName of zipNames) {
  const zipFile = path.join(insDir, zipName);
  const zip = await JSZip.loadAsync(await readFile(zipFile));
  const scan = scanZipFiles(zip);
  const sections = {
    followers: await inspectSection('followers', readSection(zip, scan.followersFiles)),
    following: await inspectSection('following', readSection(zip, scan.followingFiles)),
    blocked: await inspectSection('blocked', readSection(zip, scan.blockedFiles)),
    restricted: await inspectSection('restricted', readSection(zip, scan.restrictedFiles))
  };

  console.log(`\n[${zipName}] ${classify(sections)}`);
  for (const section of Object.values(sections)) {
    console.log(
      `- ${section.label}: extracted=${section.found ? 'Y' : 'N'}, raw=${section.rawHit ? 'Y' : 'N'}, entries=${section.entries}, path=${pathLabel(section.paths)}`
    );
  }
}
