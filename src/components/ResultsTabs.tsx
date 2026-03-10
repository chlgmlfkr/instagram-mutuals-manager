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
  { key: 'following', label: '팔로우', accent: 'text-white' },
  { key: 'followers', label: '팔로워', accent: 'text-white' },
  {
    key: 'fans',
    label: '언팔로우',
    accent: 'text-neon-400',
    description: '상대는 나를 팔로우하고 있지만, 나는 상대를 팔로우하지 않은 상태입니다.'
  },
  {
    key: 'unfollowers',
    label: '언팔로워',
    accent: 'text-magenta-500',
    description: '나는 상대를 팔로우하고 있지만, 상대는 나를 팔로우하지 않은 상태입니다.'
  },
  { key: 'restricted', label: '제한', accent: 'text-neon-400' },
  { key: 'blocked', label: '차단', accent: 'text-magenta-500' }
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
      <div className="-mx-1 overflow-x-auto px-1 no-scrollbar">
        <div className="flex min-w-max gap-2">
        {effectiveTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              active === tab.key
                ? 'bg-gradient-to-r from-neon-400 to-white text-ink-900'
                : 'border border-white/10 bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {tab.label}
            <span
              className={`ml-2 text-xs ${
                active === tab.key ? 'text-ink-700' : 'text-white/70'
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
