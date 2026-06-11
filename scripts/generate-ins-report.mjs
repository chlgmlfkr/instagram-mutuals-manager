import { promises as fs } from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';
import { readSection, scanZipFiles, setOps } from './instagram-export-cli-utils.mjs';

const cwd = process.cwd();
const insDir = path.join(cwd, 'ins');
const outputPath = path.join(insDir, 'CASE_REPORT.md');
const defaultMaxSizeMb = Number(process.env.INS_REPORT_MAX_SIZE_MB ?? 300);

function parseMaxSizeMbArg() {
  const arg = process.argv.find((item) => item.startsWith('--max-size-mb='));
  if (!arg) return defaultMaxSizeMb;
  const value = Number(arg.split('=')[1]);
  return Number.isFinite(value) && value > 0 ? value : defaultMaxSizeMb;
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

      const followersSection = await readSection(zip, scan.followersFiles);
      const followingSection = await readSection(zip, scan.followingFiles);
      const blockedSection = await readSection(zip, scan.blockedFiles);
      const restrictedSection = await readSection(zip, scan.restrictedFiles);

      const followers = followersSection.usernames;
      const following = followingSection.usernames;
      const blocked = blockedSection.usernames;
      const restricted = restrictedSection.usernames;
      const ops = setOps(followers, following);
      const skipCount =
        followersSection.skipCount +
        followingSection.skipCount +
        blockedSection.skipCount +
        restrictedSection.skipCount;

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

| case | status | 팔로우 | 팔로워 | 나를 팔로우함 | 언팔로워 후보 | 제한 | 차단 | note |
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
