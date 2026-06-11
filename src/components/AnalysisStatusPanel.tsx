import type { AnalysisResults, ParsedStats, Status } from '../types/analysis';

type AnalysisStatusPanelProps = {
  status: Status;
  statusLabel: string;
  stats: ParsedStats;
  results: AnalysisResults;
  error: string | null;
  zipFile: File | null;
  hasFolderInput: boolean;
  canAnalyze: boolean;
};

export default function AnalysisStatusPanel({
  status,
  statusLabel,
  stats,
  results,
  error,
  zipFile,
  hasFolderInput,
  canAnalyze
}: AnalysisStatusPanelProps) {
  const infoCards =
    status === 'done'
      ? [
          {
            label: '언팔로워 후보',
            value: results.unfollowers.length,
            tone: 'text-[#e1306c]',
            help: '나는 팔로우하지만 상대는 나를 팔로우하지 않음'
          },
          {
            label: '언팔로우',
            value: results.fans.length,
            tone: 'text-amber-600',
            help: '상대는 나를 팔로우하지만 나는 팔로우하지 않음'
          },
          {
            label: '맞팔',
            value: results.mutuals.length,
            tone: 'text-slate-900',
            help: '서로 팔로우 중'
          },
          {
            label: '해석 실패',
            value: stats.skipCount,
            tone: error ? 'text-rose-600' : 'text-slate-700',
            help: '파싱하지 못한 엔트리'
          }
        ]
      : [
          {
            label: '팔로워',
            value: stats.followersCount,
            tone: 'text-slate-900',
            help: '분석 전에는 0으로 표시됩니다'
          },
          {
            label: '팔로우',
            value: stats.followingCount,
            tone: 'text-slate-900',
            help: '분석 전에는 0으로 표시됩니다'
          },
          {
            label: '해석 실패',
            value: stats.skipCount,
            tone: error ? 'text-rose-600' : 'text-slate-700',
            help: '파싱하지 못한 엔트리'
          }
        ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Analysis Status
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            {status === 'done' ? '언팔로워 후보 요약' : '파일을 선택하고 분석을 시작하세요'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {status === 'done'
              ? '분석 기준은 Instagram 내보내기 파일 생성 시점입니다. 후보 목록을 먼저 확인하세요.'
              : '왼쪽에서 ZIP 파일을 선택한 뒤 분석 시작 버튼을 누르면 됩니다.'}
          </p>
        </div>
        <div
          className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-500"
          aria-live="polite"
        >
          상태: <span className="ml-1 text-slate-900">{statusLabel}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className={`grid gap-3 ${status === 'done' ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-3'}`}>
            {infoCards.map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className={`mt-2 text-3xl font-semibold tabular-nums ${item.tone}`}>{item.value}</p>
                <p className="mt-2 min-h-8 text-xs leading-4 text-slate-400">{item.help}</p>
              </div>
            ))}
          </div>

          {stats.sourceNote && (
            <div className="mt-4 rounded-lg bg-white px-4 py-3 text-sm text-slate-500">
              {stats.sourceNote}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">분석 메모</p>
          <div className="mt-4 space-y-3 text-sm text-slate-500">
            <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-4 py-3">
              <span>입력 소스</span>
              <span className="text-right font-medium text-slate-900">
                {stats.sourceType === 'zip'
                  ? 'ZIP'
                  : stats.sourceType === 'folder'
                    ? 'Folder'
                    : zipFile
                      ? 'ZIP 선택됨'
                      : hasFolderInput
                        ? '폴더 선택됨'
                        : '없음'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-4 py-3">
              <span>분석 가능 상태</span>
              <span className="text-right font-medium text-slate-900">{canAnalyze ? '준비됨' : '대기 중'}</span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-4 py-3">
              <span>결과 탭 준비</span>
              <span className="text-right font-medium text-slate-900">
                {status === 'done' ? '완료' : '대기 중'}
              </span>
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-slate-600">
              ISeeSocial은 Instagram 또는 Meta의 공식 서비스가 아니며, 내보내기 파일 생성 시점의
              데이터만 분석합니다.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
