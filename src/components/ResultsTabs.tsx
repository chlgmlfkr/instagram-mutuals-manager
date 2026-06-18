import { useEffect, useMemo, useState } from 'react';
import ListView from './ListView';

type ResultsTabsProps = {
  following: string[];
  followers: string[];
  mutuals: string[];
  unfollowers: string[];
  fans: string[];
  blocked: string[];
  restricted: string[];
};

type TabKey =
  | 'unfollowers'
  | 'fans'
  | 'mutuals'
  | 'following'
  | 'followers'
  | 'restricted'
  | 'blocked';

type TabDefinition = {
  key: TabKey;
  label: string;
  accent: string;
  description?: string;
};

const tabs: TabDefinition[] = [
  {
    key: 'unfollowers',
    label: '언팔로워 후보',
    accent: 'text-rose-600',
    description: '나는 상대를 팔로우하고 있지만, 상대는 나를 팔로우하지 않은 상태입니다.'
  },
  {
    key: 'fans',
    label: '나를 팔로우함',
    accent: 'text-amber-600',
    description: '상대는 나를 팔로우하고 있지만, 나는 상대를 팔로우하지 않은 상태입니다.'
  },
  { key: 'mutuals', label: '맞팔', accent: 'text-slate-900' },
  { key: 'following', label: '팔로우', accent: 'text-slate-900' },
  { key: 'followers', label: '팔로워', accent: 'text-slate-900' },
  { key: 'restricted', label: '제한', accent: 'text-amber-600' },
  { key: 'blocked', label: '차단', accent: 'text-rose-600' }
];

export default function ResultsTabs({
  following,
  followers,
  mutuals,
  unfollowers,
  fans,
  blocked,
  restricted
}: ResultsTabsProps) {
  const [active, setActive] = useState<TabKey>('unfollowers');

  const dataMap = useMemo<Record<TabKey, string[]>>(
    () => ({
      unfollowers,
      fans,
      mutuals,
      following,
      followers,
      restricted,
      blocked
    }),
    [blocked, fans, followers, following, mutuals, restricted, unfollowers]
  );

  const visibleTabs = useMemo(() => {
    return tabs.filter((tab) => tab.key === 'unfollowers' || dataMap[tab.key].length > 0);
  }, [dataMap]);

  useEffect(() => {
    const activeExists = visibleTabs.some((tab) => tab.key === active);
    if (!activeExists) {
      setActive(visibleTabs[0].key);
    }
  }, [active, visibleTabs]);

  const activeTab = visibleTabs.find((tab) => tab.key === active) ?? visibleTabs[0];
  const activeItems = dataMap[activeTab.key];

  return (
    <section className="flex min-h-0 flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">계정 목록</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">언팔로워 후보</h3>
          <p className="mt-1 text-sm text-slate-500">
            분류된 계정 목록은 언팔로워 후보를 먼저 보여주고, 다른 관계는 탭으로 전환합니다.
          </p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500">
          검색 · 선택 · 일괄 복사 · CSV
        </div>
      </div>

      <div className="-mx-1 overflow-x-auto px-1 no-scrollbar">
        <div className="flex min-w-max gap-2" aria-label="결과 분류">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              aria-pressed={active === tab.key}
              onClick={() => setActive(tab.key)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                active === tab.key
                  ? 'bg-[#2563eb] text-white'
                  : 'border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-[11px] ${
                  active === tab.key
                    ? 'bg-white/15 text-white'
                    : tab.key === 'unfollowers'
                      ? 'bg-rose-50 text-[#e1306c]'
                      : 'bg-slate-100 text-slate-500'
                }`}
              >
                {dataMap[tab.key].length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <ListView
        title={activeTab.label}
        items={activeItems}
        accent={activeTab.accent}
        description={activeTab.description}
        emptyMessage="현재 export에서 이 분류에 표시할 사용자가 없습니다."
      />
    </section>
  );
}
