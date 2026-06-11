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
  const normalized = path.toLowerCase();
  let score = 0;
  if (normalized.includes('followers_and_following')) score += 2;
  if (normalized.includes('connections')) score += 1;
  return score;
}

function partNumber(path: string) {
  return Number(path.match(/_(\d+)\.json$/)?.[1] ?? 0);
}

function fileName(path: string) {
  return path.split('/').pop() ?? path;
}

function directoryName(path: string) {
  const index = path.lastIndexOf('/');
  return index >= 0 ? path.slice(0, index + 1) : '';
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

function chooseRelationshipDir(followersFiles: string[], followingFiles: string[]) {
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

function filterByDir(paths: string[], dir: string | undefined) {
  return dir ? paths.filter((path) => directoryName(path) === dir) : paths;
}

function selectRelationshipFiles(
  allFollowersFiles: string[],
  allFollowingFiles: string[],
  allBlockedFiles: string[],
  allRestrictedFiles: string[]
) {
  const preferredFollowersFiles = allFollowersFiles.filter((path) => isInPreferredDir(path));
  const preferredFollowingFiles = allFollowingFiles.filter((path) => isInPreferredDir(path));
  const preferredBlockedFiles = allBlockedFiles.filter((path) => isInPreferredDir(path));
  const preferredRestrictedFiles = allRestrictedFiles.filter((path) => isInPreferredDir(path));

  const followersPool = preferredFollowersFiles.length > 0 ? preferredFollowersFiles : allFollowersFiles;
  const followingPool = preferredFollowingFiles.length > 0 ? preferredFollowingFiles : allFollowingFiles;
  const selectedDir = chooseRelationshipDir(followersPool, followingPool);

  return {
    followersFiles: filterByDir(followersPool, selectedDir),
    followingFiles: filterByDir(followingPool, selectedDir),
    blockedFiles: filterByDir(
      preferredBlockedFiles.length > 0 ? preferredBlockedFiles : allBlockedFiles,
      selectedDir
    ),
    restrictedFiles: filterByDir(
      preferredRestrictedFiles.length > 0 ? preferredRestrictedFiles : allRestrictedFiles,
      selectedDir
    )
  };
}

export async function scanZip(zip: JSZip): Promise<ScanResult> {
  const fileList = Object.keys(zip.files).filter((name) => !zip.files[name].dir);

  const allFollowersFiles = fileList.filter((path) => isFollowersFile(path)).sort(sortByPriority);
  const allFollowingFiles = fileList.filter((path) => isFollowingFile(path)).sort(sortByPriority);
  const allBlockedFiles = fileList.filter((path) => isBlockedFile(path)).sort(sortByPriority);
  const allRestrictedFiles = fileList.filter((path) => isRestrictedFile(path)).sort(sortByPriority);
  const { followersFiles, followingFiles, blockedFiles, restrictedFiles } = selectRelationshipFiles(
    allFollowersFiles,
    allFollowingFiles,
    allBlockedFiles,
    allRestrictedFiles
  );

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

  const fileByPath = new Map(files.map((file) => [file.webkitRelativePath || file.name, file]));
  const selected = selectRelationshipFiles(
    followersFiles.map((file) => file.webkitRelativePath || file.name),
    followingFiles.map((file) => file.webkitRelativePath || file.name),
    blockedFiles.map((file) => file.webkitRelativePath || file.name),
    restrictedFiles.map((file) => file.webkitRelativePath || file.name)
  );
  const toFiles = (paths: string[]) =>
    paths.map((path) => fileByPath.get(path)).filter((file): file is File => Boolean(file));

  return {
    followersFiles: toFiles(selected.followersFiles),
    followingFiles: toFiles(selected.followingFiles),
    blockedFiles: toFiles(selected.blockedFiles),
    restrictedFiles: toFiles(selected.restrictedFiles)
  };
}
