import Uploader from './Uploader';

type SidebarProps = {
  zipFile: File | null;
  folderFiles: File[];
  canAnalyze: boolean;
  onZipChange: (file: File | null) => void;
  onFolderChange: (files: File[]) => void;
  onZipRejected: (message: string) => void;
  onAnalyze: () => void;
};

export default function Sidebar({
  zipFile,
  folderFiles,
  canAnalyze,
  onZipChange,
  onFolderChange,
  onZipRejected,
  onAnalyze
}: SidebarProps) {
  return (
    <aside className="border-b border-slate-200 bg-white p-4 lg:border-b-0 lg:border-r lg:p-4">
      <div className="space-y-4 lg:sticky lg:top-[76px]">
        <Uploader
          zipFile={zipFile}
          folderFiles={folderFiles}
          onZipChange={onZipChange}
          onFolderChange={onFolderChange}
          onZipRejected={onZipRejected}
          onAnalyze={onAnalyze}
          disabled={!canAnalyze}
        />

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Local Trust
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-950">브라우저 안에서만 처리</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-500">
            <li>업로드 파일은 서버로 전송하지 않습니다.</li>
            <li>로그인 정보나 세션 쿠키를 요구하지 않습니다.</li>
            <li>분석 결과는 현재 브라우저 메모리 안에서만 처리됩니다.</li>
            <li>ISeeSocial은 Instagram 또는 Meta의 공식 서비스가 아닙니다.</li>
          </ul>
        </section>
      </div>
    </aside>
  );
}
