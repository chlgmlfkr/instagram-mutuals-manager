import type { ParsedStats } from '../types/analysis';

type UsedFilesPanelProps = {
  stats: ParsedStats;
  error: string | null;
  lastFileList: string[];
};

function FileGroup({ title, paths }: { title: string; paths: string[] }) {
  if (paths.length === 0) return null;

  return (
    <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
      <p className="font-semibold text-slate-900">{title}</p>
      <ul className="mt-2 space-y-1">
        {paths.map((path) => (
          <li key={`${title}-${path}`} className="truncate" title={path}>
            {path}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function UsedFilesPanel({ stats, error, lastFileList }: UsedFilesPanelProps) {
  const hasUsedFiles =
    stats.usedFollowersFiles.length > 0 ||
    stats.usedFollowingFiles.length > 0 ||
    stats.usedBlockedFiles.length > 0 ||
    stats.usedRestrictedFiles.length > 0;

  if (!hasUsedFiles && !(error && lastFileList.length > 0)) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {hasUsedFiles && (
        <details className="rounded-xl border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer list-none">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">이번 분석에 사용한 파일</p>
                <p className="mt-1 text-xs text-slate-500">
                  결과가 이상해 보이면 어떤 export 파일을 읽었는지 먼저 확인하세요.
                </p>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
                진단
              </span>
            </div>
          </summary>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <FileGroup title="Followers" paths={stats.usedFollowersFiles} />
            <FileGroup title="Following" paths={stats.usedFollowingFiles} />
            <FileGroup title="Blocked" paths={stats.usedBlockedFiles} />
            <FileGroup title="Restricted" paths={stats.usedRestrictedFiles} />
          </div>
        </details>
      )}

      {error && lastFileList.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">ZIP 내 파일 일부</p>
          <ul className="mt-3 max-h-52 space-y-1 overflow-y-auto rounded-lg bg-slate-50 p-4 text-xs text-slate-500">
            {lastFileList.slice(0, 50).map((path) => (
              <li key={path} className="truncate" title={path}>
                {path}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-400">
            followers/following 관련 파일이 실제로 들어있는지 먼저 확인하세요.
          </p>
        </div>
      )}
    </div>
  );
}
