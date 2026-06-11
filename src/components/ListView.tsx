import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { exportCsv } from '../utils/exportCsv';

export type ListViewProps = {
  title: string;
  items: string[];
  accent: string;
  description?: string;
  emptyMessage?: string;
};

export default function ListView({ title, items, accent, description, emptyMessage }: ListViewProps) {
  const searchId = useId();
  const sortId = useId();
  const [query, setQuery] = useState('');
  const [sortAZ, setSortAZ] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items.filter((item) => (q ? item.toLowerCase().includes(q) : true));
    if (sortAZ) {
      list = [...list].sort((a, b) => a.localeCompare(b));
    }
    return list;
  }, [items, query, sortAZ]);

  useEffect(() => {
    setSelected((current) => {
      const next = new Set(Array.from(current).filter((item) => items.includes(item)));
      return next.size === current.size ? current : next;
    });
  }, [items]);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const scheduleCopyStateReset = (delay: number) => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyState('idle'), delay);
  };

  const copyUsernames = async (usernames: string[]) => {
    if (usernames.length === 0) return;

    try {
      await navigator.clipboard.writeText(usernames.join('\n'));
      setCopyState('copied');
      scheduleCopyStateReset(1200);
    } catch {
      setCopyState('failed');
      scheduleCopyStateReset(1800);
    }
  };

  const hasFilteredItems = filtered.length > 0;
  const selectedItems = filtered.filter((item) => selected.has(item));
  const hasSelectedItems = selectedItems.length > 0;

  const toggleSelected = (username: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(username)) {
        next.delete(username);
      } else {
        next.add(username);
      }
      return next;
    });
  };

  const toggleAllFiltered = () => {
    setSelected((current) => {
      const next = new Set(current);
      const allSelected = filtered.every((item) => next.has(item));
      filtered.forEach((item) => {
        if (allSelected) {
          next.delete(item);
        } else {
          next.add(item);
        }
      });
      return next;
    });
  };

  return (
    <div className="flex min-h-0 flex-col rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="min-w-0">
          <p className={`text-lg font-semibold ${accent}`}>{title}</p>
          {description && <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">{description}</p>}
          <p className="mt-1 text-sm text-slate-500">총 {items.length}명</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-outline"
            onClick={() => copyUsernames(hasSelectedItems ? selectedItems : filtered)}
            disabled={!hasFilteredItems}
          >
            {copyState === 'copied'
              ? '복사됨'
              : copyState === 'failed'
                ? '복사 실패'
                : hasSelectedItems
                  ? `선택 ${selectedItems.length}명 복사`
                  : '필터 결과 복사'}
          </button>
          <button
            type="button"
            className="btn-outline"
            onClick={() => exportCsv(hasSelectedItems ? selectedItems : filtered, `${title}.csv`)}
            disabled={!hasFilteredItems}
          >
            CSV
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="w-full md:w-72">
          <label htmlFor={searchId} className="sr-only">
            {title} 검색
          </label>
          <input
            id={searchId}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="검색"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <label htmlFor={sortId} className="flex items-center gap-2 text-xs text-slate-500">
          <input
            id={sortId}
            type="checkbox"
            checked={sortAZ}
            onChange={(event) => setSortAZ(event.target.checked)}
            className="h-4 w-4 accent-blue-600"
          />
          A-Z 정렬
        </label>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
          필터 {filtered.length}명
        </span>
        <button
          type="button"
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:text-slate-300"
          onClick={toggleAllFiltered}
          disabled={!hasFilteredItems}
        >
          {hasFilteredItems && filtered.every((item) => selected.has(item)) ? '전체 해제' : '필터 전체 선택'}
        </button>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
          선택 {selectedItems.length}명
        </span>
        <span className="sr-only" aria-live="polite">
          {copyState === 'copied'
            ? '목록을 클립보드에 복사했습니다.'
            : copyState === 'failed'
              ? '클립보드 복사에 실패했습니다.'
              : ''}
        </span>
      </div>

      <div className="mt-4 max-h-[min(620px,calc(100vh-420px))] min-h-[320px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/80">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm leading-6 text-slate-500">
            {emptyMessage ?? '표시할 사용자가 없습니다.'}
          </div>
        ) : (
          <ul className="divide-y divide-slate-200/80">
            {filtered.map((user) => (
              <li key={user} className="flex min-h-12 min-w-0 items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selected.has(user)}
                    onChange={() => toggleSelected(user)}
                    className="h-4 w-4 shrink-0 accent-slate-900"
                    aria-label={`${user} 선택`}
                  />
                  <a
                    href={`https://instagram.com/${user}`}
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-0 truncate font-medium text-slate-700 transition hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    aria-label={`${user} Instagram 프로필 열기`}
                  >
                    @{user}
                  </a>
                </div>
                <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-400 ring-1 ring-slate-200">
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
