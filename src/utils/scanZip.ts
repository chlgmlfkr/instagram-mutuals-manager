import JSZip from 'jszip';

export type ScanResult = {
  followersFiles: string[];
  followingFiles: string[];
  blockedFiles: string[];
  restrictedFiles: string[];
  fileList: string[];
};

const followersPattern = /followers(?:_(\d+))?\.json$/i;
const followingPattern = /following(?:_(\d+))?\.json$/i;
const blockedPattern = /blocked_profiles(?:_(\d+))?\.json$/i;
const restrictedPattern = /restricted_profiles(?:_(\d+))?\.json$/i;
const preferredDir = 'connections/followers_and_following/';

function scorePath(path: string) {
  let score = 0;
  if (path.includes('followers_and_following')) score += 2;
  if (path.includes('connections')) score += 1;
  return score;
}

function partNumber(path: string) {
  return Number(path.match(/_(\d+)\.json$/)?.[1] ?? 0);
}

function fileName(path: string) {
  return path.split('/').pop() ?? path;
}

function isFollowersFile(path: string) {
  const name = fileName(path);
  return followersPattern.test(name);
}

function isFollowingFile(path: string) {
  const name = fileName(path);
  return followingPattern.test(name);
}

function isInPreferredDir(path: string) {
  return path.toLowerCase().includes(preferredDir);
}

function isBlockedFile(path: string) {
  const name = fileName(path);
  return blockedPattern.test(name);
}

function isRestrictedFile(path: string) {
  const name = fileName(path);
  return restrictedPattern.test(name);
}

function sortByPriority(a: string, b: string) {
  const scoreDiff = scorePath(b) - scorePath(a);
  if (scoreDiff !== 0) return scoreDiff;
  return partNumber(a) - partNumber(b);
}

export async function scanZip(zip: JSZip): Promise<ScanResult> {
  const fileList = Object.keys(zip.files).filter((name) => !zip.files[name].dir);

  const allFollowersFiles = fileList.filter((path) => isFollowersFile(path)).sort(sortByPriority);
  const allFollowingFiles = fileList.filter((path) => isFollowingFile(path)).sort(sortByPriority);
  const allBlockedFiles = fileList.filter((path) => isBlockedFile(path)).sort(sortByPriority);
  const allRestrictedFiles = fileList.filter((path) => isRestrictedFile(path)).sort(sortByPriority);

  const preferredFollowersFiles = allFollowersFiles.filter((path) => isInPreferredDir(path));
  const preferredFollowingFiles = allFollowingFiles.filter((path) => isInPreferredDir(path));
  const preferredBlockedFiles = allBlockedFiles.filter((path) => isInPreferredDir(path));
  const preferredRestrictedFiles = allRestrictedFiles.filter((path) => isInPreferredDir(path));

  const followersFiles = preferredFollowersFiles.length > 0 ? preferredFollowersFiles : allFollowersFiles;
  const followingFiles = preferredFollowingFiles.length > 0 ? preferredFollowingFiles : allFollowingFiles;
  const blockedFiles = preferredBlockedFiles.length > 0 ? preferredBlockedFiles : allBlockedFiles;
  const restrictedFiles =
    preferredRestrictedFiles.length > 0 ? preferredRestrictedFiles : allRestrictedFiles;

  return {
    followersFiles,
    followingFiles,
    blockedFiles,
    restrictedFiles,
    fileList
  };
}

export type FolderScanResult = {
  followersFiles: File[];
  followingFiles: File[];
  blockedFiles: File[];
  restrictedFiles: File[];
};

export function scanFolderFiles(files: File[]): FolderScanResult {
  const followersFiles = files
    .filter((file) => isFollowersFile(file.name))
    .sort((a, b) => sortByPriority(a.webkitRelativePath || a.name, b.webkitRelativePath || b.name));
  const followingFiles = files
    .filter((file) => isFollowingFile(file.name))
    .sort((a, b) => sortByPriority(a.webkitRelativePath || a.name, b.webkitRelativePath || b.name));
  const blockedFiles = files
    .filter((file) => isBlockedFile(file.name))
    .sort((a, b) => sortByPriority(a.webkitRelativePath || a.name, b.webkitRelativePath || b.name));
  const restrictedFiles = files
    .filter((file) => isRestrictedFile(file.name))
    .sort((a, b) => sortByPriority(a.webkitRelativePath || a.name, b.webkitRelativePath || b.name));

  const preferredFollowersFiles = followersFiles.filter((file) =>
    isInPreferredDir(file.webkitRelativePath || file.name)
  );
  const preferredFollowingFiles = followingFiles.filter((file) =>
    isInPreferredDir(file.webkitRelativePath || file.name)
  );
  const preferredBlockedFiles = blockedFiles.filter((file) =>
    isInPreferredDir(file.webkitRelativePath || file.name)
  );
  const preferredRestrictedFiles = restrictedFiles.filter((file) =>
    isInPreferredDir(file.webkitRelativePath || file.name)
  );

  return {
    followersFiles: preferredFollowersFiles.length > 0 ? preferredFollowersFiles : followersFiles,
    followingFiles: preferredFollowingFiles.length > 0 ? preferredFollowingFiles : followingFiles,
    blockedFiles: preferredBlockedFiles.length > 0 ? preferredBlockedFiles : blockedFiles,
    restrictedFiles:
      preferredRestrictedFiles.length > 0 ? preferredRestrictedFiles : restrictedFiles
  };
}
