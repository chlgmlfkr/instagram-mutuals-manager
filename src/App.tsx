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

  const canAnalyze = !!zipFile && status !== 'loading' && status !== 'parsing';

  const statusLabel = useMemo(() => {
    if (status === 'loading') return 'ZIP 읽는 중...';
    if (status === 'parsing') return '데이터 파싱 중...';
    if (status === 'done') return '완료';
    if (status === 'error') return '오류 발생';
    return '대기 중';
  }, [status]);

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
    if (!zipFile) return;
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
    <div className="min-h-screen px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] text-white md:py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="inline-block rounded-full border border-neon-400/40 bg-neon-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neon-400">
                Local-Only Analyzer
              </p>
              <h1 className="text-2xl font-bold sm:text-3xl">Instagram 맞팔 탐지기</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="chip">다크모드</span>
              <span className="chip">로그인 불필요</span>
              <span className="chip">서버 전송 없음</span>
            </div>
          </div>
          <p className="text-sm text-white/70">
            Instagram 내보내기 ZIP에서 팔로워/팔로우 목록을 찾아 서로 팔로우, 언팔로워, 언팔로우를 분석합니다.
          </p>
          <div className="grid gap-2 text-xs text-white/70 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              1. ZIP 또는 폴더 업로드
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              2. 브라우저 로컬 파싱
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              3. 팔로우 관계 6분류 확인
            </div>
          </div>
          <div className="mt-1 flex flex-wrap gap-2">
            <button
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeMainTab === 'analyze'
                  ? 'bg-white text-ink-900'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
              onClick={() => setActiveMainTab('analyze')}
            >
              분석
            </button>
            <button
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeMainTab === 'guide'
                  ? 'bg-white text-ink-900'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
              onClick={() => setActiveMainTab('guide')}
            >
              다운로드 가이드
            </button>
          </div>
        </header>

        {activeMainTab === 'analyze' ? (
          <>
            <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
              <Uploader
                zipFile={zipFile}
                folderFiles={folderFiles}
                onZipChange={handleZipChange}
                onFolderChange={handleFolderChange}
                onZipRejected={handleZipRejected}
                onAnalyze={handleAnalyze}
                disabled={!canAnalyze}
              />
              <div className="glass rounded-2xl p-6">
                <p className="text-sm text-white/60">상태</p>
                <p className="mt-2 text-2xl font-semibold">{statusLabel}</p>
                {error && <p className="mt-2 text-sm text-magenta-500">{error}</p>}
                {stats.sourceNote && <p className="mt-2 text-xs text-white/50">{stats.sourceNote}</p>}
                {(stats.usedFollowersFiles.length > 0 ||
                  stats.usedFollowingFiles.length > 0 ||
                  stats.usedBlockedFiles.length > 0 ||
                  stats.usedRestrictedFiles.length > 0) && (
                  <div className="mt-4 rounded-lg border border-white/10 bg-ink-700/50 p-3 text-xs text-white/70">
                    <p className="font-semibold text-white">이번 분석에 사용한 파일</p>
                    {stats.usedFollowersFiles.length > 0 && (
                      <div className="mt-2">
                        <p className="text-white/80">Followers</p>
                        <ul className="mt-1 max-h-24 overflow-y-auto space-y-1">
                          {stats.usedFollowersFiles.map((path) => (
                            <li key={`follower-${path}`} className="truncate">
                              {path}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {stats.usedFollowingFiles.length > 0 && (
                      <div className="mt-2">
                        <p className="text-white/80">Following</p>
                        <ul className="mt-1 max-h-24 overflow-y-auto space-y-1">
                          {stats.usedFollowingFiles.map((path) => (
                            <li key={`following-${path}`} className="truncate">
                              {path}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {stats.usedBlockedFiles.length > 0 && (
                      <div className="mt-2">
                        <p className="text-white/80">Blocked</p>
                        <ul className="mt-1 max-h-24 overflow-y-auto space-y-1">
                          {stats.usedBlockedFiles.map((path) => (
                            <li key={`blocked-${path}`} className="truncate">
                              {path}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {stats.usedRestrictedFiles.length > 0 && (
                      <div className="mt-2">
                        <p className="text-white/80">Restricted</p>
                        <ul className="mt-1 max-h-24 overflow-y-auto space-y-1">
                          {stats.usedRestrictedFiles.map((path) => (
                            <li key={`restricted-${path}`} className="truncate">
                              {path}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {error && lastFileList.length > 0 && (
                  <div className="mt-4 rounded-lg border border-white/10 bg-ink-700/50 p-3 text-xs text-white/70">
                    <p className="font-semibold text-white">ZIP 내 파일 일부 (최대 50개)</p>
                    <ul className="mt-2 max-h-32 overflow-y-auto space-y-1">
                      {lastFileList.slice(0, 50).map((path) => (
                        <li key={path} className="truncate">
                          {path}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-white/50">
                      위 목록에 followers/following 관련 파일이 있는지 확인해 주세요.
                    </p>
                  </div>
                )}

                <div className="mt-6 grid gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">나를 팔로우 중</span>
                    <span className="font-semibold">{stats.followersCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">내가 팔로우 중</span>
                    <span className="font-semibold">{stats.followingCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Skip</span>
                    <span className="font-semibold">{stats.skipCount}</span>
                  </div>
                </div>
              </div>
            </section>

            {status === 'done' && (
              <section className="flex flex-col gap-6">
                <ResultsTabs
                  following={results.following}
                  followers={results.followers}
                  unfollowers={results.unfollowers}
                  fans={results.fans}
                  blocked={results.blocked}
                  restricted={results.restricted}
                />
                <StatsCharts
                  followingCount={results.following.length}
                  followersCount={results.followers.length}
                  mutualsCount={results.mutuals.length}
                  unfollowersCount={results.unfollowers.length}
                  fansCount={results.fans.length}
                />
              </section>
            )}
          </>
        ) : (
          <DownloadGuide />
        )}

        <section className="glass rounded-2xl p-6 text-sm text-white/70">
          <p className="font-semibold text-white">개인정보 및 이용 안내</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>본 서비스는 고객님의 업로드 파일을 서버로 전송하지 않으며, 외부로 수집·이용하지 않습니다.</li>
            <li>본 서비스는 Instagram 로그인 정보(아이디/비밀번호)를 요구하거나 저장하지 않습니다.</li>
            <li>모든 분석 처리는 고객님의 브라우저 환경(로컬)에서만 수행됩니다.</li>
            <li>고객 데이터 분석 결과는 별도 저장되지 않으며, 고객 동의 없이 제3자에게 제공되지 않습니다.</li>
            <li>내보내기 ZIP 파일에는 민감 정보가 포함될 수 있으므로, 타인과 공유하지 않으시길 권장드립니다.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
