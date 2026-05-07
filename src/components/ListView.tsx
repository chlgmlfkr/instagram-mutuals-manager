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
    <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <p className={`text-lg font-semibold ${accent}`}>{title}</p>
          {description && <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">{description}</p>}
          <p className="mt-1 text-sm text-slate-500">총 {items.length}명</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-outline" onClick={handleCopy}>
            {copyState === 'copied' ? '복사됨' : '복사'}
          </button>
          <button className="btn-outline" onClick={() => exportCsv(filtered, `${title}.csv`)}>
            CSV 다운로드
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="검색"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-amber-300 focus:bg-white focus:outline-none md:w-72"
        />
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <input
            type="checkbox"
            checked={sortAZ}
            onChange={(event) => setSortAZ(event.target.checked)}
            className="h-4 w-4 accent-amber-500"
          />
          A-Z 정렬
        </label>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
          필터 {filtered.length}명
        </span>
      </div>

      <div className="mt-4 max-h-[420px] overflow-y-auto rounded-[22px] border border-slate-200 bg-slate-50/80">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">표시할 사용자가 없습니다.</div>
        ) : (
          <ul className="divide-y divide-slate-200/80">
            {filtered.map((user) => (
              <li key={user} className="flex items-center justify-between px-4 py-3 text-sm">
                <a
                  href={`https://instagram.com/${user}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-slate-700 transition hover:text-amber-600"
                >
                  @{user}
                </a>
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-400">
                  Instagram
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
