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
  onGuideClick?: () => void;
};

export default function Uploader({
  zipFile,
  folderFiles,
  onZipChange,
  onFolderChange,
  onZipRejected,
  onAnalyze,
  disabled,
  framed = true,
  onGuideClick
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
    <div className={framed ? 'rounded-xl border border-slate-200 bg-white p-4 shadow-sm' : ''}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Export File
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Instagram ZIP 선택</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            ZIP을 먼저 권장합니다. 압축 해제 폴더도 보조로 분석할 수 있습니다.
          </p>
        </div>
        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          Local only
        </div>
      </div>

      <div
        className={`mt-5 rounded-xl border p-4 transition ${
          isDragging
            ? 'border-[#2563eb] bg-blue-50'
            : 'border-slate-200 bg-white'
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
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#111827] text-sm font-semibold text-white">
              ZIP
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              추천
            </span>
          </div>
          <p className="text-lg font-semibold text-slate-950">내보내기 ZIP 업로드</p>
          <p className="text-sm leading-6 text-slate-500">
            다운로드한 Instagram 내보내기 ZIP을 그대로 넣을 수 있습니다.
          </p>
          <div className="rounded-lg border border-slate-200 bg-slate-50">
            <div className="grid gap-2 border-b border-slate-200 px-4 py-3 text-sm sm:grid-cols-[110px_minmax(0,1fr)]">
              <span className="font-medium text-slate-500">선택 파일</span>
              <span className="min-w-0 truncate font-semibold text-slate-800" title={selectedZipLabel}>
                {selectedZipLabel}
              </span>
            </div>
            <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
              <label className="btn-primary cursor-pointer">
                ZIP 선택하기
                <input
                  type="file"
                  accept=".zip"
                  className="hidden"
                  aria-label="ZIP 파일 선택"
                  onChange={(event) => onZipChange(event.target.files?.[0] ?? null)}
                />
              </label>
              {onGuideClick && (
                <button type="button" className="btn-outline" onClick={onGuideClick}>
                  다운로드 방법 보기
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          서버 미전송
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
          로그인 불필요
        </span>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
          브라우저 로컬 분석
        </span>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
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

      <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <summary className="cursor-pointer list-none">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-slate-900">압축 해제 폴더 업로드</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                ZIP이 없을 때만 사용하는 보조 옵션입니다.
              </p>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500">
              보조 옵션
            </span>
          </div>
        </summary>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
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
      </details>
    </div>
  );
}
