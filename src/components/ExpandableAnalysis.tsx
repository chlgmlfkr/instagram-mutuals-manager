type ExpandableAnalysisProps = {
  following: string[];
  followers: string[];
  mutuals: string[];
  unfollowers: string[];
  fans: string[];
  blocked: string[];
  restricted: string[];
};

function DistributionBar({
  label,
  value,
  total,
  tone = 'bg-slate-300'
}: {
  label: string;
  value: number;
  total: number;
  tone?: string;
}) {
  const percent = total > 0 ? Math.max(4, Math.round((value / total) * 100)) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="tabular-nums text-slate-500">{value.toLocaleString()}명</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function ExpandableAnalysis({
  following,
  followers,
  mutuals,
  unfollowers,
  fans,
  blocked,
  restricted
}: ExpandableAnalysisProps) {
  const relationshipTotal = Math.max(
    new Set([...following, ...followers, ...blocked, ...restricted]).size,
    1
  );

  return (
    <details className="rounded-xl border border-slate-200 bg-white p-4">
      <summary className="cursor-pointer list-none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-950">관계 분석 보기</p>
            <p className="mt-1 text-sm text-slate-500">
              표를 먼저 확인한 뒤, 전체 관계 분포를 가볍게 비교할 수 있습니다.
            </p>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
            선택 분석
          </span>
        </div>
      </summary>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-950">관계 분포</p>
          <div className="mt-4 space-y-4">
            <DistributionBar label="팔로우" value={following.length} total={relationshipTotal} tone="bg-blue-500" />
            <DistributionBar label="팔로워" value={followers.length} total={relationshipTotal} tone="bg-slate-400" />
            <DistributionBar label="맞팔" value={mutuals.length} total={relationshipTotal} tone="bg-emerald-500" />
            <DistributionBar label="언팔로워 후보" value={unfollowers.length} total={relationshipTotal} tone="bg-[#e1306c]" />
            <DistributionBar label="나를 팔로우함" value={fans.length} total={relationshipTotal} tone="bg-amber-500" />
            <DistributionBar label="제한" value={restricted.length} total={relationshipTotal} tone="bg-orange-400" />
            <DistributionBar label="차단" value={blocked.length} total={relationshipTotal} tone="bg-rose-500" />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-950">팔로우 기간 분포</p>
          <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm leading-6 text-slate-500">
            현재 결과 데이터는 사용자명 중심으로 저장되어 있어 날짜별 분포는 후속 스키마 확장 후 정확히 표시합니다.
            날짜 데이터가 연결되면 최근, 6개월, 1년, 2년 이상 구간으로 나눠 보여줍니다.
          </div>
        </section>
      </div>
    </details>
  );
}
