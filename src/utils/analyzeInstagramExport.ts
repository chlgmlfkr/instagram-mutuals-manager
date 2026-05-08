import JSZip from 'jszip';
import { extractEntries } from './extractEntries';
import { extractUsernames } from './extractUsernames';
import { loadJson } from './loadJson';
import { scanFolderFiles, scanZip } from './scanZip';
import { setOps } from './setOps';
import type { AnalysisOutput } from '../types/analysis';

export class InstagramExportAnalysisError extends Error {
  fileList: string[];

  constructor(message: string, fileList: string[] = []) {
    super(message);
    this.name = 'InstagramExportAnalysisError';
    this.fileList = fileList;
  }
}

async function readFolderJson(file: File) {
  const text = await file.text();
  return JSON.parse(text) as unknown;
}

function dedupeUsernames(usernames: string[]) {
  return Array.from(new Set(usernames));
}

async function loadEntriesFromPaths(zip: JSZip, paths: string[]) {
  const batches = await Promise.all(
    paths.map(async (path) => {
      const data = await loadJson(zip, path);
      return extractEntries(data);
    })
  );

  return batches.flat();
}

async function loadEntriesFromFiles(files: File[]) {
  const batches = await Promise.all(
    files.map(async (file) => {
      const data = await readFolderJson(file);
      return extractEntries(data);
    })
  );

  return batches.flat();
}

export async function analyzeInstagramExport(
  zipFile: File | null,
  folderFiles: File[]
): Promise<AnalysisOutput> {
  const zip = zipFile ? await JSZip.loadAsync(zipFile) : null;
  const { followersFiles, followingFiles, blockedFiles, restrictedFiles, fileList } = zip
    ? await scanZip(zip)
    : {
        followersFiles: [],
        followingFiles: [],
        blockedFiles: [],
        restrictedFiles: [],
        fileList: []
      };

  let followersEntries: unknown[] = [];
  let followingEntries: unknown[] = [];
  let blockedEntries: unknown[] = [];
  let restrictedEntries: unknown[] = [];
  let sourceNote = 'ZIP 파일에서 파싱됨';
  let sourceType: 'zip' | 'folder' = 'zip';
  let usedFollowersFiles = followersFiles;
  let usedFollowingFiles = followingFiles;
  let usedBlockedFiles = blockedFiles;
  let usedRestrictedFiles = restrictedFiles;

  if (followersFiles.length > 0 && followingFiles.length > 0) {
    [followersEntries, followingEntries, blockedEntries, restrictedEntries] = await Promise.all([
      loadEntriesFromPaths(zip, followersFiles),
      loadEntriesFromPaths(zip, followingFiles),
      loadEntriesFromPaths(zip, blockedFiles),
      loadEntriesFromPaths(zip, restrictedFiles)
    ]);
  } else if (folderFiles.length > 0) {
    const folderScan = scanFolderFiles(folderFiles);
    if (folderScan.followersFiles.length === 0 || folderScan.followingFiles.length === 0) {
      throw new InstagramExportAnalysisError(
        '지원되지 않는 폴더입니다. followers/following 파일이 포함된 Instagram 내보내기 폴더를 선택해 주세요.',
        fileList
      );
    }

    sourceNote = '폴더 업로드에서 파싱됨 (ZIP 내 파일 미발견)';
    sourceType = 'folder';
    usedFollowersFiles = folderScan.followersFiles.map((file) => file.webkitRelativePath || file.name);
    usedFollowingFiles = folderScan.followingFiles.map((file) => file.webkitRelativePath || file.name);
    usedBlockedFiles = folderScan.blockedFiles.map((file) => file.webkitRelativePath || file.name);
    usedRestrictedFiles = folderScan.restrictedFiles.map((file) => file.webkitRelativePath || file.name);

    [followersEntries, followingEntries, blockedEntries, restrictedEntries] = await Promise.all([
      loadEntriesFromFiles(folderScan.followersFiles),
      loadEntriesFromFiles(folderScan.followingFiles),
      loadEntriesFromFiles(folderScan.blockedFiles),
      loadEntriesFromFiles(folderScan.restrictedFiles)
    ]);
  } else {
    throw new InstagramExportAnalysisError(
      '지원되지 않는 ZIP입니다. followers/following 파일이 포함된 Instagram 내보내기 파일인지 확인해 주세요.',
      fileList
    );
  }

  const followersResult = extractUsernames(followersEntries);
  const followingResult = extractUsernames(followingEntries);
  const blockedResult = extractUsernames(blockedEntries);
  const restrictedResult = extractUsernames(restrictedEntries);

  const uniqueFollowers = dedupeUsernames(followersResult.usernames);
  const uniqueFollowing = dedupeUsernames(followingResult.usernames);
  const uniqueBlocked = dedupeUsernames(blockedResult.usernames);
  const uniqueRestricted = dedupeUsernames(restrictedResult.usernames);
  const ops = setOps(uniqueFollowers, uniqueFollowing);

  return {
    stats: {
      followersCount: uniqueFollowers.length,
      followingCount: uniqueFollowing.length,
      skipCount:
        followersResult.skipCount +
        followingResult.skipCount +
        blockedResult.skipCount +
        restrictedResult.skipCount,
      sourceType,
      sourceNote: `${sourceNote} · entries(followers:${followersEntries.length}, following:${followingEntries.length})`,
      usedFollowersFiles,
      usedFollowingFiles,
      usedBlockedFiles,
      usedRestrictedFiles
    },
    results: {
      following: uniqueFollowing,
      followers: uniqueFollowers,
      ...ops,
      blocked: uniqueBlocked,
      restricted: uniqueRestricted
    },
    fileList
  };
}
