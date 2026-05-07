type StatsChartsProps = {
  followingCount: number;
  followersCount: number;
  mutualsCount: number;
  unfollowersCount: number;
  fansCount: number;
};

function percent(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

type DonutProps = {
  title: string;
  aLabel: string;
  bLabel: string;
  aValue: number;
  bValue: number;
  aColorClass: string;
  bColorClass: string;
};

function Donut({
  title,
  aLabel,
  bLabel,
  aValue,
  bValue,
  aColorClass,
  bColorClass
}: DonutProps) {
  const total = aValue + bValue;
  const aRatio = total > 0 ? aValue / total : 0;
  const circumference = 2 * Math.PI * 42;
  const aArc = aRatio * circumference;

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <div className="mt-4 flex items-center gap-4">
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
            <circle cx="50" cy="50" r="42" stroke="rgba(148,163,184,0.22)" strokeWidth="12" fill="none" />
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${aArc} ${circumference - aArc}`}
              className={aColorClass}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-slate-900">
            {percent(aValue, total)}%
          </div>
        </div>
        <div className="text-xs text-slate-600">
          <p className="mb-2">
            <span className={`${aColorClass} mr-2 inline-block h-2.5 w-2.5 rounded-full`} />
            {aLabel}: {aValue}
          </p>
          <p>
            <span className={`${bColorClass} mr-2 inline-block h-2.5 w-2.5 rounded-full`} />
            {bLabel}: {bValue}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function StatsCharts({
  followingCount,
  followersCount,
  mutualsCount,
  unfollowersCount,
  fansCount
}: StatsChartsProps) {
  const compareMax = Math.max(followingCount, followersCount, 1);
  const nonMutualCount = unfollowersCount + fansCount;

  return (
    <section className="rounded-[30px] border border-slate-200 bg-[#fcfcfb] p-6 shadow-[0_26px_70px_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Overview</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">팔로우 관계 인사이트</h2>
        </div>
        <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
          분석 요약 카드
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-[22px] border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">팔로우</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{followingCount}</p>
        </div>
        <div className="rounded-[22px] border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">팔로워</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{followersCount}</p>
        </div>
        <div className="rounded-[22px] border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">서로 팔로우</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{mutualsCount}</p>
        </div>
        <div className="rounded-[22px] border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">언팔로워</p>
          <p className="mt-2 text-2xl font-semibold text-rose-500">{unfollowersCount}</p>
        </div>
        <div className="rounded-[22px] border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">언팔로우</p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">{fansCount}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 lg:col-span-1">
          <p className="text-sm font-semibold text-slate-900">팔로우 vs 팔로워</p>
          <div className="mt-4 space-y-3 text-xs text-slate-600">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span>팔로우</span>
                <span>{followingCount}</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100">
                <div
                  className="h-2.5 rounded-full bg-slate-900"
                  style={{ width: `${Math.round((followingCount / compareMax) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span>팔로워</span>
                <span>{followersCount}</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100">
                <div
                  className="h-2.5 rounded-full bg-amber-500"
                  style={{ width: `${Math.round((followersCount / compareMax) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <Donut
          title="맞팔 비율"
          aLabel="서로 팔로우"
          bLabel="비맞팔"
          aValue={mutualsCount}
          bValue={nonMutualCount}
          aColorClass="text-slate-900"
          bColorClass="text-slate-300"
        />

        <Donut
          title="비맞팔 구성"
          aLabel="언팔로워"
          bLabel="언팔로우"
          aValue={unfollowersCount}
          bValue={fansCount}
          aColorClass="text-rose-500"
          bColorClass="text-amber-500"
        />
      </div>
    </section>
  );
}
