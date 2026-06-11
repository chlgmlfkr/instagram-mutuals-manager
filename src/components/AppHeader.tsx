type MainTab = 'analyze' | 'guide';

type AppHeaderProps = {
  activeMainTab: MainTab;
  onTabChange: (tab: MainTab) => void;
};

export default function AppHeader({ activeMainTab, onTabChange }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
            IS
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-slate-950 sm:text-xl">
              ISeeSocial
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              인스타 언팔로워 후보를 로컬에서 확인하고 검색, 선택, 내보내기합니다.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2" aria-label="주요 화면">
          <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-flex">
            서버 미전송
          </span>
          <button
            type="button"
            aria-pressed={activeMainTab === 'analyze'}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeMainTab === 'analyze'
                ? 'bg-[#2563eb] text-white'
                : 'border border-slate-200 bg-white text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => onTabChange('analyze')}
          >
            분석 화면
          </button>
          <button
            type="button"
            aria-pressed={activeMainTab === 'guide'}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeMainTab === 'guide'
                ? 'bg-[#2563eb] text-white'
                : 'border border-slate-200 bg-white text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => onTabChange('guide')}
          >
            다운로드 가이드
          </button>
        </div>
      </div>
    </header>
  );
}
