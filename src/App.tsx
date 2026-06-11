import { useMemo, useState } from 'react';
import AnalysisStatusPanel from './components/AnalysisStatusPanel';
import AppHeader from './components/AppHeader';
import DownloadGuide from './components/DownloadGuide';
import PrivacyNotice from './components/PrivacyNotice';
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
      <main className="min-h-screen bg-[#f7f7f5] text-[#111827]">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10">
          <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111827] text-sm font-black text-white">
                IS
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">ISeeSocial</p>
                <p className="text-lg font-bold leading-tight text-slate-950">아시셜</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                서버 미전송
              </span>
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
                onClick={() => setActiveMainTab('guide')}
              >
                다운로드 가이드
              </button>
            </div>
          </header>

          <section className="grid flex-1 items-start gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center lg:gap-16 lg:py-12">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-[#e1306c] sm:mb-7">
                언팔로워 후보를 먼저 보여줍니다
              </div>
              <h1 className="text-4xl font-semibold leading-[1.06] tracking-normal text-slate-950 sm:text-5xl lg:text-[56px]">
                인스타 언팔로워
                <br />
                후보를 확인하세요.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Instagram에서 받은 내보내기 ZIP을 브라우저에서만 분석합니다. 로그인도 서버 업로드도
                없이, 내가 팔로우하지만 나를 팔로우하지 않는 계정을 먼저 확인합니다.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-sm font-semibold text-slate-700">
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2">ZIP 우선 지원</span>
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2">로그인 불필요</span>
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2">CSV 내보내기</span>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                ISeeSocial은 Instagram 또는 Meta의 공식 서비스가 아니며, 사용자가 직접 받은 내보내기
                파일만 로컬에서 읽습니다.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm sm:p-5">
              <Uploader
                zipFile={zipFile}
                folderFiles={folderFiles}
                onZipChange={handleZipChange}
                onFolderChange={handleFolderChange}
                onZipRejected={handleZipRejected}
                onAnalyze={handleAnalyze}
                disabled={!canAnalyze}
                framed={false}
                onGuideClick={() => setActiveMainTab('guide')}
              />
            </div>
          </section>
          <div className="pb-8">
            <PrivacyNotice />
          </div>
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
          <div className="grid flex-1 gap-0 lg:grid-cols-[320px_minmax(0,1fr)]">
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

                {status === 'done' ? (
                  <>
                    <ResultsTabs
                      following={results.following}
                      followers={results.followers}
                      mutuals={results.mutuals}
                      unfollowers={results.unfollowers}
                      fans={results.fans}
                      blocked={results.blocked}
                      restricted={results.restricted}
                    />
                    <UsedFilesPanel stats={stats} error={error} lastFileList={lastFileList} />
                  </>
                ) : (
                  <>
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
                    <PrivacyNotice />
                    <UsedFilesPanel stats={stats} error={error} lastFileList={lastFileList} />
                  </>
                )}
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
