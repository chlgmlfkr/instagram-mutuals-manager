import { useEffect, useMemo, useState } from 'react';
import ListView from './ListView';

type ResultsTabsProps = {
  following: string[];
  followers: string[];
  unfollowers: string[];
  fans: string[];
  blocked: string[];
  restricted: string[];
};

const tabs = [
  { key: 'following', label: '팔로우', accent: 'text-slate-900' },
  { key: 'followers', label: '팔로워', accent: 'text-slate-900' },
  {
    key: 'fans',
    label: '언팔로우',
    accent: 'text-amber-600',
    description: '상대는 나를 팔로우하고 있지만, 나는 상대를 팔로우하지 않은 상태입니다.'
  },
  {
    key: 'unfollowers',
    label: '언팔로워',
    accent: 'text-rose-500',
    description: '나는 상대를 팔로우하고 있지만, 상대는 나를 팔로우하지 않은 상태입니다.'
  },
  { key: 'restricted', label: '제한', accent: 'text-amber-600' },
  { key: 'blocked', label: '차단', accent: 'text-rose-500' }
] as const;

type TabKey = (typeof tabs)[number]['key'];

export default function ResultsTabs({
  following,
  followers,
  unfollowers,
  fans,
  blocked,
  restricted
}: ResultsTabsProps) {
  const [active, setActive] = useState<TabKey>('following');

  const dataMap: Record<TabKey, string[]> = {
    following,
    followers,
    unfollowers,
    fans,
    blocked,
    restricted
  };

  const visibleTabs = useMemo(() => {
    return tabs.filter((tab) => dataMap[tab.key].length > 0);
  }, [dataMap]);

  const effectiveTabs = visibleTabs.length > 0 ? visibleTabs : tabs;

  useEffect(() => {
    const activeExists = effectiveTabs.some((tab) => tab.key === active);
    if (!activeExists) {
      setActive(effectiveTabs[0].key);
    }
  }, [active, effectiveTabs]);

  const activeTab = effectiveTabs.find((tab) => tab.key === active) ?? effectiveTabs[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Relationship Ledger
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">분류된 계정 목록</h3>
        </div>
        <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
          빈 항목 자동 숨김
        </div>
      </div>

      <div className="-mx-1 overflow-x-auto px-1 no-scrollbar">
        <div className="flex min-w-max gap-2">
          {effectiveTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                active === tab.key
                  ? 'bg-slate-900 text-white shadow-[0_14px_34px_rgba(15,23,42,0.16)]'
                  : 'border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-[11px] ${
                  active === tab.key
                    ? 'bg-white/15 text-white'
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
        items={dataMap[activeTab.key]}
        accent={activeTab.accent}
        description={activeTab.description}
      />
    </div>
  );
}
