import { useMemo, useState } from 'react';
import AnalysisStatusPanel from './components/AnalysisStatusPanel';
import AppHeader from './components/AppHeader';
import DownloadGuide from './components/DownloadGuide';
import ResultsTabs from './components/ResultsTabs';
import Sidebar from './components/Sidebar';
import Uploader from './components/Uploader';
import UsedFilesPanel from './components/UsedFilesPanel';
import { InstagramExportAnalysisError, analyzeInstagramExport } from './utils/analyzeInstagramExport';
import { EMPTY_RESULTS, EMPTY_STATS, type Status } from './types/analysis';

export default function App() {
  const [activeMainTab, setActiveMainTab] = useState<'analyze' | 'guide'>('analyze');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [folderFiles, setFolderFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [results, setResults] = useState(EMPTY_RESULTS);
  const [lastFileList, setLastFileList] = useState<string[]>([]);

  const hasFolderInput = folderFiles.length > 0;
  const isBusy = status === 'loading' || status === 'parsing';
  const canAnalyze = (zipFile !== null || hasFolderInput) && !isBusy;
  const hasStartedAnalysis = zipFile !== null || hasFolderInput || status !== 'idle' || error !== null;

  const statusLabel = useMemo(() => {
    if (status === 'loading') return 'ZIP 읽는 중...';
    if (status === 'parsing') return '데이터 파싱 중...';
    if (status === 'done') return '완료';
    if (status === 'error') return '오류 발생';
    return '대기 중';
  }, [status]);

  const resetAnalysis = () => {
    setResults(EMPTY_RESULTS);
    setStats(EMPTY_STATS);
    setLastFileList([]);
  };

  const handleZipChange = (file: File | null) => {
    if (!file) {
      setZipFile(null);
      resetAnalysis();
      return;
    }

    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('지원되지 않는 파일입니다. Instagram 내보내기 ZIP 파일만 업로드해 주세요.');
      setStatus('error');
      setZipFile(null);
      setFolderFiles([]);
      resetAnalysis();
      return;
    }

    setError(null);
    setStatus('idle');
    setZipFile(file);
    setFolderFiles([]);
    resetAnalysis();
  };

  const handleFolderChange = (files: File[]) => {
    if (files.length === 0) {
      setFolderFiles([]);
      resetAnalysis();
      return;
    }

    const hasJson = files.some((file) => file.name.toLowerCase().endsWith('.json'));
    if (!hasJson) {
      setError('지원되지 않는 폴더입니다. Instagram 내보내기 폴더(JSON 포함)를 선택해 주세요.');
      setStatus('error');
      setZipFile(null);
      setFolderFiles([]);
      resetAnalysis();
      return;
    }

    setError(null);
    if (status === 'error') setStatus('idle');
    setFolderFiles(files);
    setZipFile(null);
    resetAnalysis();
  };

  const handleZipRejected = (message: string) => {
    setError(message);
    setStatus('error');
    setZipFile(null);
    setFolderFiles([]);
    resetAnalysis();
  };

  const handleAnalyze = async () => {
    if (!zipFile && folderFiles.length === 0) return;
    setError(null);
    setStatus('loading');
    resetAnalysis();

    try {
      setStatus('parsing');
      const output = await analyzeInstagramExport(zipFile, folderFiles);
      setLastFileList(output.fileList);
      setStats(output.stats);
      setResults(output.results);
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      if (err instanceof InstagramExportAnalysisError) {
        setLastFileList(err.fileList);
      }
      setStatus('error');
    }
  };

  if (activeMainTab === 'analyze' && !hasStartedAnalysis) {
    return (
      <main className="min-h-screen bg-[#d7372f] text-white">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-black text-[#d7372f]">
                IM
              </div>
              <div>
                <p className="text-sm font-semibold text-white/80">Instagram Mutuals</p>
                <p className="text-lg font-bold leading-tight">맞팔관리기</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-full border border-white/35 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white hover:text-[#d7372f]"
              onClick={() => setActiveMainTab('guide')}
            >
              가이드라인 및 안내사항
            </button>
          </header>

          <section className="grid flex-1 items-start gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center lg:gap-14 lg:py-10">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 sm:mb-6">
                서버 전송 없이 브라우저에서만 분석
              </div>
              <h1 className="text-3xl font-black leading-[1.08] tracking-normal sm:text-5xl lg:text-6xl">
                인스타 맞팔 관계를
                <br />
                파일 하나로 정리하세요.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/82 sm:mt-6 sm:text-lg sm:leading-8">
                Instagram에서 내려받은 ZIP 또는 압축 해제 폴더를 넣으면 맞팔, 언팔 후보, 팔로워 관계를
                로컬에서 분석합니다. 로그인도, 서버 업로드도 필요 없습니다.
              </p>
              <div className="mt-8 hidden flex-wrap gap-3 text-sm font-semibold text-white/90 sm:flex">
                <span className="rounded-full bg-white/14 px-4 py-2">ZIP / 폴더 지원</span>
                <span className="rounded-full bg-white/14 px-4 py-2">로그인 불필요</span>
                <span className="rounded-full bg-white/14 px-4 py-2">CSV 내보내기</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 text-slate-900 shadow-[0_30px_90px_rgba(69,10,10,0.28)] sm:p-5">
              <Uploader
                zipFile={zipFile}
                folderFiles={folderFiles}
                onZipChange={handleZipChange}
                onFolderChange={handleFolderChange}
                onZipRejected={handleZipRejected}
                onAnalyze={handleAnalyze}
                disabled={!canAnalyze}
                framed={false}
              />
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1840px] flex-col bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.06)]">
        <AppHeader activeMainTab={activeMainTab} onTabChange={setActiveMainTab} />

        {activeMainTab === 'guide' ? (
          <main className="flex-1 bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-5xl">
              <DownloadGuide />
            </div>
          </main>
        ) : (
          <div className="grid flex-1 gap-0 lg:grid-cols-[360px_minmax(0,1fr)]">
            <Sidebar
              zipFile={zipFile}
              folderFiles={folderFiles}
              canAnalyze={canAnalyze}
              onZipChange={handleZipChange}
              onFolderChange={handleFolderChange}
              onZipRejected={handleZipRejected}
              onAnalyze={handleAnalyze}
            />

            <main className="min-w-0 bg-slate-50 p-4 sm:p-5 lg:p-6">
              <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
                <AnalysisStatusPanel
                  status={status}
                  statusLabel={statusLabel}
                  stats={stats}
                  results={results}
                  error={error}
                  zipFile={zipFile}
                  hasFolderInput={hasFolderInput}
                  canAnalyze={canAnalyze}
                />

                <UsedFilesPanel stats={stats} error={error} lastFileList={lastFileList} />

                {status === 'done' ? (
                  <ResultsTabs
                    following={results.following}
                    followers={results.followers}
                    mutuals={results.mutuals}
                    unfollowers={results.unfollowers}
                    fans={results.fans}
                    blocked={results.blocked}
                    restricted={results.restricted}
                  />
                ) : (
                  <section className="rounded-xl border border-slate-200 bg-white p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">분석 전 미리보기</p>
                        <p className="mt-1 text-sm text-slate-500">
                          파일을 분석하면 관계별 목록과 CSV 내보내기 도구가 이 영역에 표시됩니다.
                        </p>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
                        결과 대기 중
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {['언팔로워 후보', '언팔로우', '맞팔', '팔로워'].map((label) => (
                        <div key={label} className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
                          <p className="text-sm font-semibold text-slate-700">{label}</p>
                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            파일 분석 후 이 영역에서 바로 확인할 수 있습니다.
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
