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

  const folderSummary = useMemo(() => {
    if (folderFiles.length === 0) return '선택된 폴더 없음';
    const topFolder = folderFiles[0].webkitRelativePath?.split('/')[0];
    return `${topFolder ?? '폴더'} (${folderFiles.length}개 파일)`;
  }, [folderFiles]);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = Array.from(event.dataTransfer.files).find((item) => item.name.endsWith('.zip'));
      if (file) {
        onZipChange(file);
        return;
      }
      onZipRejected('ZIP 파일만 업로드할 수 있습니다.');
    },
    [onZipChange, onZipRejected]
  );

  return (
    <div className="glass rounded-2xl p-6">
      <div
        className={`rounded-xl border border-dashed p-6 transition ${
          isDragging ? 'border-neon-400 bg-white/5' : 'border-white/10'
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col gap-3">
          <p className="text-lg font-semibold">ZIP 파일 업로드</p>
          <p className="text-sm text-white/70">
            Instagram Accounts Center에서 받은 내보내기 ZIP을 드래그 앤 드롭하거나 선택하세요.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="btn-ghost">
              ZIP 선택
              <input
                type="file"
                accept=".zip"
                className="hidden"
                onChange={(event) => onZipChange(event.target.files?.[0] ?? null)}
              />
            </label>
            <span className="text-sm text-white/60">
              {zipFile ? zipFile.name : '선택된 ZIP 없음'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-dashed border-white/10 p-6">
        <div className="flex flex-col gap-3">
          <p className="text-lg font-semibold">폴더 업로드 (선택)</p>
          <p className="text-sm text-white/70">
            압축을 푼 폴더를 직접 선택해도 됩니다. ZIP 탐색 실패 시 대체 입력으로 사용됩니다.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="btn-ghost">
              폴더 선택
              <input
                type="file"
                // @ts-expect-error: webkitdirectory is supported in Chromium-based browsers.
                webkitdirectory="true"
                className="hidden"
                onChange={(event) => onFolderChange(Array.from(event.target.files ?? []))}
              />
            </label>
            <span className="text-sm text-white/60">{folderSummary}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button className="btn-primary" onClick={onAnalyze} disabled={!zipFile || disabled}>
          분석 시작
        </button>
        {disabled && <span className="text-sm text-white/50">분석 중...</span>}
      </div>
    </div>
  );
}
