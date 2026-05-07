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
};

export default function Uploader({
  zipFile,
  folderFiles,
  onZipChange,
  onFolderChange,
  onZipRejected,
  onAnalyze,
  disabled
}: UploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const hasInput = zipFile !== null || folderFiles.length > 0;

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
    <div className="panel-surface rounded-[28px] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Data Intake
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Export 업로드</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            ZIP 또는 압축 해제 폴더를 넣으면 브라우저에서 바로 팔로우 관계를 정리합니다.
          </p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
          Local only
        </div>
      </div>

      <div
        className={`mt-6 rounded-[24px] border-2 border-dashed p-6 transition ${
          isDragging
            ? 'border-amber-400 bg-amber-50/80'
            : 'border-slate-200 bg-gradient-to-br from-white to-slate-50'
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
            ZIP
          </div>
          <p className="text-lg font-semibold text-slate-900">ZIP 파일 업로드</p>
          <p className="text-sm leading-6 text-slate-500">
            Instagram Accounts Center에서 받은 내보내기 ZIP을 드래그 앤 드롭하거나 선택하세요.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="btn-outline cursor-pointer">
              ZIP 선택
              <input
                type="file"
                accept=".zip"
                className="hidden"
                onChange={(event) => onZipChange(event.target.files?.[0] ?? null)}
              />
            </label>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
              {zipFile ? zipFile.name : '선택된 ZIP 없음'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[24px] border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700">
            DIR
          </div>
          <p className="text-lg font-semibold text-slate-900">폴더 업로드</p>
          <p className="text-sm leading-6 text-slate-500">
            압축을 푼 폴더를 직접 선택해도 됩니다. 파일 구조가 애매한 export를 점검할 때 유용합니다.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="btn-outline cursor-pointer">
              폴더 선택
              <input
                type="file"
                // @ts-expect-error: webkitdirectory is supported in Chromium-based browsers.
                webkitdirectory="true"
                className="hidden"
                onChange={(event) => onFolderChange(Array.from(event.target.files ?? []))}
              />
            </label>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
              {folderSummary}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="rounded-[20px] bg-slate-50 px-4 py-3 text-sm text-slate-500">
          {hasInput
            ? '입력 준비 완료. 분석을 시작하면 서버 전송 없이 브라우저에서만 계산합니다.'
            : '먼저 ZIP 또는 폴더를 선택해 주세요.'}
        </div>
        <button className="btn-primary" onClick={onAnalyze} disabled={!hasInput || disabled}>
          {disabled ? '분석 중...' : '분석 시작'}
        </button>
      </div>
    </div>
  );
}
