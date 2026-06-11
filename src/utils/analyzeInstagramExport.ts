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

function folderFilePath(file: File) {
  return file.webkitRelativePath || file.name;
}

function folderFileList(files: File[]) {
  return files.map(folderFilePath);
}

function jsonParseError(path: string, fileList: string[]) {
  return new InstagramExportAnalysisError(`JSON 파싱 실패: ${path}`, fileList);
}

async function loadEntriesFromPaths(zip: JSZip, paths: string[], fileList: string[]) {
  const batches = await Promise.all(
    paths.map(async (path) => {
      let data: unknown;
      try {
        data = await loadJson(zip, path);
      } catch (err) {
        if (err instanceof SyntaxError) throw jsonParseError(path, fileList);
        throw err;
      }
      return extractEntries(data);
    })
  );

  return batches.flat();
}

async function loadEntriesFromFiles(files: File[], fileList: string[]) {
  const batches = await Promise.all(
    files.map(async (file) => {
      let data: unknown;
      try {
        data = await readFolderJson(file);
      } catch (err) {
        if (err instanceof SyntaxError) throw jsonParseError(folderFilePath(file), fileList);
        throw err;
      }
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
  let sourceFileList = fileList;

  if (zip && followersFiles.length > 0 && followingFiles.length > 0) {
    [followersEntries, followingEntries, blockedEntries, restrictedEntries] = await Promise.all([
      loadEntriesFromPaths(zip, followersFiles, sourceFileList),
      loadEntriesFromPaths(zip, followingFiles, sourceFileList),
      loadEntriesFromPaths(zip, blockedFiles, sourceFileList),
      loadEntriesFromPaths(zip, restrictedFiles, sourceFileList)
    ]);
  } else if (folderFiles.length > 0) {
    const folderScan = scanFolderFiles(folderFiles);
    sourceFileList = folderFileList(folderFiles);
    if (folderScan.followersFiles.length === 0 || folderScan.followingFiles.length === 0) {
      throw new InstagramExportAnalysisError(
        '지원되지 않는 폴더입니다. followers/following 파일이 포함된 Instagram 내보내기 폴더를 선택해 주세요.',
        sourceFileList
      );
    }

    sourceNote = '폴더 업로드에서 파싱됨 (ZIP 내 파일 미발견)';
    sourceType = 'folder';
    usedFollowersFiles = folderScan.followersFiles.map(folderFilePath);
    usedFollowingFiles = folderScan.followingFiles.map(folderFilePath);
    usedBlockedFiles = folderScan.blockedFiles.map(folderFilePath);
    usedRestrictedFiles = folderScan.restrictedFiles.map(folderFilePath);

    [followersEntries, followingEntries, blockedEntries, restrictedEntries] = await Promise.all([
      loadEntriesFromFiles(folderScan.followersFiles, sourceFileList),
      loadEntriesFromFiles(folderScan.followingFiles, sourceFileList),
      loadEntriesFromFiles(folderScan.blockedFiles, sourceFileList),
      loadEntriesFromFiles(folderScan.restrictedFiles, sourceFileList)
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
    fileList: sourceFileList
  };
}
