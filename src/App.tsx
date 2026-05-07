import { useMemo, useState } from 'react';
import Uploader from './components/Uploader';
import ResultsTabs from './components/ResultsTabs';
import StatsCharts from './components/StatsCharts';
import DownloadGuide from './components/DownloadGuide';
import { analyzeInstagramExport } from './utils/analyzeInstagramExport';
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

  const statusLabel = useMemo(() => {
    if (status === 'loading') return 'ZIP 읽는 중...';
    if (status === 'parsing') return '데이터 파싱 중...';
    if (status === 'done') return '완료';
    if (status === 'error') return '오류 발생';
    return '대기 중';
  }, [status]);

  const infoCards = useMemo(
    () => [
      {
        label: '팔로워',
        value: stats.followersCount,
        tone: 'text-slate-900'
      },
      {
        label: '팔로우',
        value: stats.followingCount,
        tone: 'text-slate-900'
      },
      {
        label: '해석 실패',
        value: stats.skipCount,
        tone: error ? 'text-rose-500' : 'text-amber-600'
      }
    ],
    [error, stats.followersCount, stats.followingCount, stats.skipCount]
  );

  const handleZipChange = (file: File | null) => {
    if (!file) {
      setZipFile(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('지원되지 않는 파일입니다. Instagram 내보내기 ZIP 파일만 업로드해 주세요.');
      setStatus('error');
      setZipFile(null);
      return;
    }

    setError(null);
    setStatus('idle');
    setZipFile(file);
  };

  const handleFolderChange = (files: File[]) => {
    setFolderFiles(files);
    if (files.length === 0) return;

    const hasJson = files.some((file) => file.name.toLowerCase().endsWith('.json'));
    if (!hasJson) {
      setError('지원되지 않는 폴더입니다. Instagram 내보내기 폴더(JSON 포함)를 선택해 주세요.');
      setStatus('error');
      return;
    }

    setError(null);
    if (status === 'error') setStatus('idle');
  };

  const handleZipRejected = (message: string) => {
    setError(message);
    setStatus('error');
  };

  const handleAnalyze = async () => {
    if (!zipFile && folderFiles.length === 0) return;
    setError(null);
    setStatus('loading');
    setStats((prev) => ({ ...prev, ...EMPTY_STATS, sourceNote: prev.sourceNote }));

    try {
      setStatus('parsing');
      const output = await analyzeInstagramExport(zipFile, folderFiles);
      setLastFileList(output.fileList);
      setStats(output.stats);
      setResults(output.results);
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#2f160d] px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-slate-900 md:px-6 md:py-6">
      <div className="mx-auto max-w-[1460px]">
        <section className="browser-shell overflow-hidden rounded-[32px] border border-white/10 bg-[#f5f1eb] shadow-[0_40px_140px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between border-b border-[#5c3020] bg-[#412218] px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="hidden rounded-full bg-white/10 px-4 py-2 text-sm text-white/75 sm:block">
                127.0.0.1 / Instagram Mutuals Workspace
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium">Design mode</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium">Browser local</span>
            </div>
          </div>

          <div className="p-3 sm:p-5">
            <div className="workspace-shell overflow-hidden rounded-[28px] border border-slate-200 bg-white">
              <header className="border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-lg font-bold text-white shadow-[0_16px_35px_rgba(249,115,22,0.35)]">
                      IM
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                        Social Relationship Dashboard
                      </p>
                      <h1 className="mt-1 text-2xl font-semibold text-slate-900 sm:text-[30px]">
                        Instagram 맞팔 분석 워크스페이스
                      </h1>
                      <p className="mt-1 text-sm text-slate-500">
                        드리블 스타일의 정리된 SaaS 작업 화면으로 업로드, 분석, 검토를 한 곳에 모았습니다.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        activeMainTab === 'analyze'
                          ? 'bg-slate-900 text-white'
                          : 'border border-slate-200 bg-white text-slate-500 hover:text-slate-800'
                      }`}
                      onClick={() => setActiveMainTab('analyze')}
                    >
                      분석 화면
                    </button>
                    <button
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        activeMainTab === 'guide'
                          ? 'bg-slate-900 text-white'
                          : 'border border-slate-200 bg-white text-slate-500 hover:text-slate-800'
                      }`}
                      onClick={() => setActiveMainTab('guide')}
                    >
                      다운로드 가이드
                    </button>
                  </div>
                </div>
              </header>

              <div className="grid gap-0 xl:grid-cols-[320px_minmax(0,1fr)]">
                <aside className="border-b border-slate-200 bg-[#f8f7f4] p-4 sm:p-5 xl:min-h-[980px] xl:border-b-0 xl:border-r">
                  <div className="space-y-4">
                    <div className="rounded-[24px] bg-white p-5 shadow-[0_20px_45px_rgba(15,23,42,0.06)]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                        Workspace Menu
                      </p>
                      <div className="mt-4 space-y-2">
                        <div className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
                          Analysis Dashboard
                        </div>
                        <div className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-500">
                          Export Intake
                        </div>
                        <div className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-500">
                          Results Ledger
                        </div>
                        <div className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-500">
                          Privacy Notes
                        </div>
                      </div>
                    </div>

                    {activeMainTab === 'analyze' ? (
                      <Uploader
                        zipFile={zipFile}
                        folderFiles={folderFiles}
                        onZipChange={handleZipChange}
                        onFolderChange={handleFolderChange}
                        onZipRejected={handleZipRejected}
                        onAnalyze={handleAnalyze}
                        disabled={!canAnalyze}
                      />
                    ) : (
                      <DownloadGuide />
                    )}

                    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_22px_50px_rgba(15,23,42,0.06)]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                        Privacy Policy
                      </p>
                      <p className="mt-3 text-sm font-semibold text-slate-900">개인정보 및 이용 안내</p>
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-500">
                        <li>업로드 파일은 서버로 전송하지 않습니다.</li>
                        <li>로그인 정보나 세션 쿠키를 요구하지 않습니다.</li>
                        <li>분석 결과는 현재 브라우저 메모리 안에서만 처리됩니다.</li>
                        <li>민감한 export ZIP은 타인과 공유하지 않는 것이 안전합니다.</li>
                      </ul>
                    </section>
                  </div>
                </aside>

                <main className="bg-[linear-gradient(180deg,#ffffff_0%,#fbfaf8_100%)] p-4 sm:p-6 lg:p-7">
                  <section className="rounded-[30px] border border-slate-200 bg-gradient-to-r from-[#fbfaf7] via-white to-[#fff8ef] p-5 shadow-[0_26px_70px_rgba(15,23,42,0.08)] sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                          Project Details
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                          팔로우 관계 분석 세션
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          업로드된 export를 기준으로 현재 분류 상태와 파싱 품질을 한 눈에 확인합니다.
                        </p>
                      </div>
                      <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500">
                        상태: <span className="ml-1 text-slate-900">{statusLabel}</span>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                      <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                        <div className="grid gap-4 sm:grid-cols-3">
                          {infoCards.map((item) => (
                            <div key={item.label} className="rounded-[20px] bg-slate-50 p-4">
                              <p className="text-xs text-slate-500">{item.label}</p>
                              <p className={`mt-2 text-3xl font-semibold ${item.tone}`}>{item.value}</p>
                            </div>
                          ))}
                        </div>

                        {stats.sourceNote && (
                          <div className="mt-4 rounded-[18px] bg-slate-50 px-4 py-3 text-sm text-slate-500">
                            {stats.sourceNote}
                          </div>
                        )}

                        {error && (
                          <div className="mt-4 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                            {error}
                          </div>
                        )}
                      </div>

                      <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                        <p className="text-sm font-semibold text-slate-900">분석 메모</p>
                        <div className="mt-4 space-y-3 text-sm text-slate-500">
                          <div className="flex items-center justify-between rounded-[18px] bg-slate-50 px-4 py-3">
                            <span>입력 소스</span>
                            <span className="font-medium text-slate-900">
                              {zipFile ? 'ZIP' : hasFolderInput ? 'Folder' : 'None'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between rounded-[18px] bg-slate-50 px-4 py-3">
                            <span>분석 가능 상태</span>
                            <span className="font-medium text-slate-900">{canAnalyze ? 'Ready' : 'Waiting'}</span>
                          </div>
                          <div className="flex items-center justify-between rounded-[18px] bg-slate-50 px-4 py-3">
                            <span>결과 탭 준비</span>
                            <span className="font-medium text-slate-900">
                              {status === 'done' ? 'Completed' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {(stats.usedFollowersFiles.length > 0 ||
                      stats.usedFollowingFiles.length > 0 ||
                      stats.usedBlockedFiles.length > 0 ||
                      stats.usedRestrictedFiles.length > 0 ||
                      (error && lastFileList.length > 0)) && (
                      <div className="mt-5 grid gap-4 lg:grid-cols-2">
                        {(stats.usedFollowersFiles.length > 0 ||
                          stats.usedFollowingFiles.length > 0 ||
                          stats.usedBlockedFiles.length > 0 ||
                          stats.usedRestrictedFiles.length > 0) && (
                          <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                            <p className="text-sm font-semibold text-slate-900">이번 분석에 사용한 파일</p>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                              {stats.usedFollowersFiles.length > 0 && (
                                <div className="rounded-[18px] bg-slate-50 p-4 text-xs text-slate-500">
                                  <p className="font-semibold text-slate-900">Followers</p>
                                  <ul className="mt-2 space-y-1">
                                    {stats.usedFollowersFiles.map((path) => (
                                      <li key={`follower-${path}`} className="truncate">
                                        {path}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {stats.usedFollowingFiles.length > 0 && (
                                <div className="rounded-[18px] bg-slate-50 p-4 text-xs text-slate-500">
                                  <p className="font-semibold text-slate-900">Following</p>
                                  <ul className="mt-2 space-y-1">
                                    {stats.usedFollowingFiles.map((path) => (
                                      <li key={`following-${path}`} className="truncate">
                                        {path}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {stats.usedBlockedFiles.length > 0 && (
                                <div className="rounded-[18px] bg-slate-50 p-4 text-xs text-slate-500">
                                  <p className="font-semibold text-slate-900">Blocked</p>
                                  <ul className="mt-2 space-y-1">
                                    {stats.usedBlockedFiles.map((path) => (
                                      <li key={`blocked-${path}`} className="truncate">
                                        {path}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {stats.usedRestrictedFiles.length > 0 && (
                                <div className="rounded-[18px] bg-slate-50 p-4 text-xs text-slate-500">
                                  <p className="font-semibold text-slate-900">Restricted</p>
                                  <ul className="mt-2 space-y-1">
                                    {stats.usedRestrictedFiles.map((path) => (
                                      <li key={`restricted-${path}`} className="truncate">
                                        {path}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {error && lastFileList.length > 0 && (
                          <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                            <p className="text-sm font-semibold text-slate-900">ZIP 내 파일 일부</p>
                            <ul className="mt-3 max-h-52 space-y-1 overflow-y-auto rounded-[18px] bg-slate-50 p-4 text-xs text-slate-500">
                              {lastFileList.slice(0, 50).map((path) => (
                                <li key={path} className="truncate">
                                  {path}
                                </li>
                              ))}
                            </ul>
                            <p className="mt-3 text-xs text-slate-400">
                              followers/following 관련 파일이 실제로 들어있는지 먼저 확인하세요.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </section>

                  {activeMainTab === 'analyze' && status === 'done' && (
                    <section className="mt-6 flex flex-col gap-6">
                      <StatsCharts
                        followingCount={results.following.length}
                        followersCount={results.followers.length}
                        mutualsCount={results.mutuals.length}
                        unfollowersCount={results.unfollowers.length}
                        fansCount={results.fans.length}
                      />
                      <ResultsTabs
                        following={results.following}
                        followers={results.followers}
                        unfollowers={results.unfollowers}
                        fans={results.fans}
                        blocked={results.blocked}
                        restricted={results.restricted}
                      />
                    </section>
                  )}
                </main>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
