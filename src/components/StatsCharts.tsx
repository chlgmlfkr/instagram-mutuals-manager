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
    <div className="rounded-xl border border-white/10 bg-ink-700/50 p-4">
      <p className="text-sm font-semibold text-white">{title}</p>
      <div className="mt-4 flex items-center gap-4">
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
            <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.12)" strokeWidth="12" fill="none" />
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
          <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
            {percent(aValue, total)}%
          </div>
        </div>
        <div className="text-xs text-white/80">
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
    <section className="glass rounded-2xl p-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm text-white/60">통계 요약</p>
          <h2 className="text-xl font-semibold">팔로우 관계 인사이트</h2>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border border-white/10 bg-ink-700/50 p-3">
          <p className="text-xs text-white/60">팔로우</p>
          <p className="text-lg font-semibold">{followingCount}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-ink-700/50 p-3">
          <p className="text-xs text-white/60">팔로워</p>
          <p className="text-lg font-semibold">{followersCount}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-ink-700/50 p-3">
          <p className="text-xs text-white/60">서로 팔로우</p>
          <p className="text-lg font-semibold">{mutualsCount}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-ink-700/50 p-3">
          <p className="text-xs text-white/60">언팔로워</p>
          <p className="text-lg font-semibold text-magenta-500">{unfollowersCount}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-ink-700/50 p-3">
          <p className="text-xs text-white/60">언팔로우</p>
          <p className="text-lg font-semibold text-neon-400">{fansCount}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-ink-700/50 p-4 lg:col-span-1">
          <p className="text-sm font-semibold text-white">팔로우 vs 팔로워</p>
          <div className="mt-4 space-y-3 text-xs text-white/80">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span>팔로우</span>
                <span>{followingCount}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-neon-400"
                  style={{ width: `${Math.round((followingCount / compareMax) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span>팔로워</span>
                <span>{followersCount}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-white/70"
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
          aColorClass="text-neon-400"
          bColorClass="text-white/60"
        />

        <Donut
          title="비맞팔 구성"
          aLabel="언팔로워"
          bLabel="언팔로우"
          aValue={unfollowersCount}
          bValue={fansCount}
          aColorClass="text-magenta-500"
          bColorClass="text-neon-400"
        />
      </div>
    </section>
  );
}
