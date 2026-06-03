import { useCallback, useMemo, useState } from 'react';
import type { DragEvent } from 'react';

type UploaderProps = {
  zipFile: File | null;
  folderFiles: File[];
  onZipChange: (file: File | null) => void;
  onFolderChange: (files: File[]) => void;
  onZipRejected: (message: string) => void;
  onAnalyze: () => void;
  disabled?: boolean;
  framed?: boolean;
};

export default function Uploader({
  zipFile,
  folderFiles,
  onZipChange,
  onFolderChange,
  onZipRejected,
  onAnalyze,
  disabled,
  framed = true
}: UploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const hasInput = zipFile !== null || folderFiles.length > 0;
  const selectedZipLabel = zipFile ? zipFile.name : '선택된 ZIP 없음';

  const folderSummary = useMemo(() => {
    if (folderFiles.length === 0) return '선택된 폴더 없음';
    const topFolder = folderFiles[0].webkitRelativePath?.split('/')[0];
    return `${topFolder ?? '폴더'} (${folderFiles.length}개 파일)`;
  }, [folderFiles]);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = Array.from(event.dataTransfer.files).find((item) =>
        item.name.toLowerCase().endsWith('.zip')
      );
      if (file) {
        onZipChange(file);
        return;
      }
      onZipRejected('ZIP 파일만 업로드할 수 있습니다.');
    },
    [onZipChange, onZipRejected]
  );

  return (
    <div className={framed ? 'rounded-xl border border-slate-200 bg-white p-4' : ''}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Upload
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">내보내기 파일 선택</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            ZIP 또는 압축 해제 폴더를 선택한 뒤 분석을 시작하세요.
          </p>
        </div>
        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          Local only
        </div>
      </div>

      <div
        className={`mt-5 rounded-lg border-2 border-dashed p-4 transition ${
          isDragging
            ? 'border-[#d7372f] bg-red-50'
            : 'border-slate-200 bg-slate-50'
        }`}
        aria-label="ZIP 파일 드롭 영역"
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col gap-4">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
            ZIP
          </div>
          <p className="text-lg font-semibold text-slate-900">ZIP 파일 업로드</p>
          <p className="text-sm leading-6 text-slate-500">
            다운로드한 Instagram 내보내기 ZIP을 그대로 넣을 수 있습니다.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="btn-outline cursor-pointer">
              ZIP 선택
              <input
                type="file"
                accept=".zip"
                className="hidden"
                aria-label="ZIP 파일 선택"
                onChange={(event) => onZipChange(event.target.files?.[0] ?? null)}
              />
            </label>
            <span
              className="min-w-0 truncate rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-600 sm:flex-1"
              title={selectedZipLabel}
            >
              {selectedZipLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#d7372f] text-sm font-semibold text-white">
            DIR
          </div>
          <p className="text-lg font-semibold text-slate-900">폴더 업로드</p>
          <p className="text-sm leading-6 text-slate-500">
            압축을 풀어둔 Instagram export 폴더를 바로 선택할 수 있습니다.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="btn-outline cursor-pointer">
              폴더 선택
              <input
                type="file"
                // @ts-expect-error: webkitdirectory is supported in Chromium-based browsers.
                webkitdirectory="true"
                className="hidden"
                aria-label="내보내기 폴더 선택"
                onChange={(event) => onFolderChange(Array.from(event.target.files ?? []))}
              />
            </label>
            <span
              className="min-w-0 truncate rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-600 sm:flex-1"
              title={folderSummary}
            >
              {folderSummary}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
        <div className="mx-auto max-w-sm text-sm leading-6 text-slate-600">
          {hasInput
            ? '파일 선택 완료. 아래 버튼을 누르면 분석이 시작됩니다.'
            : '먼저 ZIP 또는 폴더를 선택하면 분석 버튼이 활성화됩니다.'}
        </div>
        <button
          type="button"
          className="btn-brand mx-auto mt-4 min-h-14 w-full max-w-[280px] text-base"
          onClick={onAnalyze}
          disabled={!hasInput || disabled}
        >
          {disabled && hasInput ? '분석 중...' : '분석 시작'}
        </button>
      </div>
    </div>
  );
}
