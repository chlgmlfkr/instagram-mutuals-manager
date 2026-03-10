import { useMemo, useState } from 'react';
import { exportCsv } from '../utils/exportCsv';

export type ListViewProps = {
  title: string;
  items: string[];
  accent: string;
  description?: string;
};

export default function ListView({ title, items, accent, description }: ListViewProps) {
  const [query, setQuery] = useState('');
  const [sortAZ, setSortAZ] = useState(true);
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items.filter((item) => (q ? item.toLowerCase().includes(q) : true));
    if (sortAZ) {
      list = [...list].sort((a, b) => a.localeCompare(b));
    }
    return list;
  }, [items, query, sortAZ]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(filtered.join('\n'));
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 1200);
    } catch {
      setCopyState('idle');
    }
  };

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className={`text-lg font-semibold ${accent}`}>{title}</p>
          {description && <p className="mt-1 text-xs text-white/60">{description}</p>}
          <p className="text-sm text-white/60">총 {items.length}명</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-ghost" onClick={handleCopy}>
            {copyState === 'copied' ? '복사됨' : '복사'}
          </button>
          <button className="btn-ghost" onClick={() => exportCsv(filtered, `${title}.csv`)}>
            CSV 다운로드
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="검색"
          className="w-full rounded-lg border border-white/10 bg-ink-700/80 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-neon-500/60 md:w-64"
        />
        <label className="flex items-center gap-2 text-xs text-white/70">
          <input
            type="checkbox"
            checked={sortAZ}
            onChange={(event) => setSortAZ(event.target.checked)}
            className="h-4 w-4 accent-neon-400"
          />
          A-Z 정렬
        </label>
        <span className="chip">필터 {filtered.length}명</span>
      </div>

      <div className="mt-4 max-h-[360px] overflow-y-auto rounded-lg border border-white/10 bg-ink-700/50">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-sm text-white/60">표시할 사용자가 없습니다.</div>
        ) : (
          <ul className="divide-y divide-white/5">
            {filtered.map((user) => (
              <li key={user} className="flex items-center justify-between px-4 py-2 text-sm">
                <a
                  href={`https://instagram.com/${user}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/90 hover:text-neon-400"
                >
                  @{user}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
