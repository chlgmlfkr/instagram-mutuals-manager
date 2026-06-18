import { type ReactNode, useEffect, useMemo, useState } from 'react';
import AppHeader, { type MainTab } from './components/AppHeader';
import DownloadGuide from './components/DownloadGuide';
import PrivacyNotice from './components/PrivacyNotice';
import ResultsTabs from './components/ResultsTabs';
import Uploader from './components/Uploader';
import UsedFilesPanel from './components/UsedFilesPanel';
import { InstagramExportAnalysisError, analyzeInstagramExport } from './utils/analyzeInstagramExport';
import { EMPTY_RESULTS, EMPTY_STATS, type AnalysisResults, type ParsedStats, type Status } from './types/analysis';

type AppViewState = 'idle' | 'upload' | 'fileSelected' | 'analyzing' | 'success' | 'error';

const analyzeSteps = [
  'ZIP 파일 확인 중',
  'Instagram 데이터 구조 읽는 중',
  '팔로워 목록 분석 중',
  '팔로우 목록 분석 중',
  '언팔로워 후보 정리 중',
  '결과 화면 준비 중'
];

function TrustBadges() {
  return (
    <div className="flex flex-wrap gap-2 text-sm font-semibold text-slate-700">
      <span className="rounded-full border border-slate-200 bg-white px-4 py-2">로그인 불필요</span>
      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-700">
        서버 미전송
      </span>
      <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-blue-700">
        브라우저 로컬 분석
      </span>
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function selectedSourceLabel(zipFile: File | null, folderFiles: File[]) {
  if (zipFile) return zipFile.name;
  if (folderFiles.length > 0) {
    const topFolder = folderFiles[0].webkitRelativePath?.split('/')[0] || '선택한 폴더';
    return `${topFolder} (${folderFiles.length}개 파일)`;
  }
  return '선택된 파일 없음';
}

function selectedSourceSize(zipFile: File | null, folderFiles: File[]) {
  if (zipFile) return formatFileSize(zipFile.size);
  if (folderFiles.length > 0) {
    const total = folderFiles.reduce((sum, file) => sum + file.size, 0);
    return `${formatFileSize(total)} · ${folderFiles.length}개 파일`;
  }
  return '-';
}

function ratio(value: number, total: number) {
  if (total === 0) return '0.0';
  return ((value / total) * 100).toFixed(1);
}

function StatCard({
  label,
  value,
  help,
  tone = 'text-slate-950'
}: {
  label: string;
  value: number;
  help: string;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-3 text-4xl font-semibold tabular-nums ${tone}`}>{value.toLocaleString()}</p>
      <p className="mt-3 text-xs leading-5 text-slate-500">{help}</p>
    </div>
  );
}

function BarRow({
  label,
  value,
  total,
  tone
}: {
  label: string;
  value: number;
  total: number;
  tone: string;
}) {
  const percent = total > 0 ? Math.max(3, Math.round((value / total) * 100)) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="tabular-nums text-slate-500">
          {value.toLocaleString()}명 · {ratio(value, total)}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full transition-all duration-700 ${tone}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function GraphCandidateCards({ results, stats }: { results: AnalysisResults; stats: ParsedStats }) {
  const followingTotal = Math.max(results.following.length, 1);
  const relationshipTotal = Math.max(
    results.unfollowers.length + results.mutuals.length + results.fans.length,
    1
  );
  const unfollowerPercent = Number(ratio(results.unfollowers.length, followingTotal));
  const mutualPercent = Number(ratio(results.mutuals.length, followingTotal));
  const fanPercent = Number(ratio(results.fans.length, relationshipTotal));
  const dataTrust = Math.max(0, 100 - Math.min(stats.skipCount * 4, 100));
  const candidateRankClass = 'inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white';

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">시각화 후보</p>
          <p className="mt-1 text-sm text-slate-500">
            현재 데이터로 바로 만들었을 때 가장 읽히는 그래프 후보입니다.
          </p>
        </div>
        <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
          추천 순서
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`${candidateRankClass} bg-[#e1306c]`}>1</span>
                <p className="text-sm font-semibold text-slate-950">언팔로워 위험 비율</p>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500">가장 먼저 보여줄 링/게이지</p>
            </div>
            <div
              className="grid h-16 w-16 shrink-0 place-items-center rounded-full text-sm font-bold text-[#e1306c]"
              style={{
                background: `conic-gradient(#e1306c ${unfollowerPercent * 3.6}deg, #ffe4ec 0deg)`
              }}
            >
              <div className="grid h-11 w-11 place-items-center rounded-full bg-white">
                {unfollowerPercent.toFixed(0)}%
              </div>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-[#e1306c]" style={{ width: '25%' }} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <span className={`${candidateRankClass} bg-amber-500`}>2</span>
            <p className="text-sm font-semibold text-slate-950">관계 구성 막대</p>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">언팔/맞팔/나를 팔로우함을 한 줄로 비교</p>
          <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-white">
            <div className="bg-[#e1306c]" style={{ width: `${ratio(results.unfollowers.length, relationshipTotal)}%` }} />
            <div className="bg-emerald-500" style={{ width: `${ratio(results.mutuals.length, relationshipTotal)}%` }} />
            <div className="bg-amber-500" style={{ width: `${fanPercent}%` }} />
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-amber-500" style={{ width: '50%' }} />
          </div>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
          <div className="flex items-center gap-2">
            <span className={`${candidateRankClass} bg-emerald-500`}>3</span>
            <p className="text-sm font-semibold text-slate-950">맞팔 안정도</p>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">내 팔로잉 중 서로 이어진 비율</p>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${mutualPercent}%` }} />
          </div>
          <p className="mt-2 text-xs font-semibold text-emerald-700">{mutualPercent.toFixed(1)}%</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: '75%' }} />
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
          <div className="flex items-center gap-2">
            <span className={`${candidateRankClass} bg-blue-500`}>4</span>
            <p className="text-sm font-semibold text-slate-950">데이터 신뢰도</p>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">읽지 못한 항목이 적을수록 신뢰도 높음</p>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-blue-500" style={{ width: `${dataTrust}%` }} />
          </div>
          <p className="mt-2 text-xs font-semibold text-blue-700">{dataTrust}%</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-blue-500" style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    </section>
  );
}

function GraphSection({ results, stats }: { results: AnalysisResults; stats: ParsedStats }) {
  const relationshipTotal = Math.max(
    new Set([...results.following, ...results.followers, ...results.blocked, ...results.restricted]).size,
    1
  );
  const followingTotal = Math.max(results.following.length, 1);
  const skipCount = stats.skipCount;

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-950">팔로우 관계 비율</p>
            <p className="mt-1 text-sm text-slate-500">결과 목록을 보기 전에 전체 관계 분포를 확인합니다.</p>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
            관계 그래프
          </span>
        </div>
        <div className="mt-5 space-y-4">
          <BarRow label="언팔로워 후보" value={results.unfollowers.length} total={relationshipTotal} tone="bg-[#e1306c]" />
          <BarRow label="나를 팔로우함" value={results.fans.length} total={relationshipTotal} tone="bg-amber-500" />
          <BarRow label="맞팔" value={results.mutuals.length} total={relationshipTotal} tone="bg-emerald-500" />
          <BarRow label="팔로워" value={results.followers.length} total={relationshipTotal} tone="bg-slate-400" />
          <BarRow label="팔로잉" value={results.following.length} total={relationshipTotal} tone="bg-blue-500" />
          <BarRow label="제한/차단" value={results.restricted.length + results.blocked.length} total={relationshipTotal} tone="bg-rose-500" />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-950">맞팔 / 비맞팔 비교</p>
        <p className="mt-1 text-sm text-slate-500">내가 팔로우하는 계정 기준입니다.</p>
        <div className="mt-5 space-y-4">
          <BarRow label="맞팔" value={results.mutuals.length} total={followingTotal} tone="bg-emerald-500" />
          <BarRow label="언팔로워 후보" value={results.unfollowers.length} total={followingTotal} tone="bg-[#e1306c]" />
          <BarRow label="읽지 못한 항목" value={skipCount} total={Math.max(followingTotal + skipCount, 1)} tone="bg-slate-300" />
        </div>
        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
          언팔로워 후보는 전체 팔로잉 {results.following.length.toLocaleString()}명 중 약{' '}
          {ratio(results.unfollowers.length, results.following.length)}%입니다.
          <br />
          기준: 내가 팔로우하지만 나를 팔로우하지 않는 계정
        </div>
      </div>
    </section>
  );
}

function AnalyzeProgress({ progress, currentStep }: { progress: number; currentStep: number }) {
  return (
    <section className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-blue-700">브라우저 로컬 분석</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">ZIP을 분석하는 중입니다.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">파일은 서버로 전송되지 않습니다.</p>
        </div>
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
      </div>
      <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-[#2563eb] transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <ol className="mt-6 space-y-3">
        {analyzeSteps.map((step, index) => {
          const done = index < currentStep;
          const active = index === currentStep;
          return (
            <li
              key={step}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                done || active
                  ? 'border-blue-100 bg-blue-50 text-blue-800'
                  : 'border-slate-200 bg-slate-50 text-slate-400'
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  done
                    ? 'bg-blue-600 text-white progress-step-done'
                    : active
                      ? 'bg-white text-blue-700 ring-1 ring-blue-200 progress-step-active'
                      : 'bg-white'
                }`}
              >
                {done ? '✓' : index + 1}
              </span>
              {step}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function AdRail({ side }: { side: 'left' | 'right' }) {
  return (
    <aside
      className={`hidden xl:block ${side === 'left' ? 'justify-self-start' : 'justify-self-end'}`}
      aria-label={`${side === 'left' ? '왼쪽' : '오른쪽'} 광고 예정 영역`}
    >
      <div className="sticky top-24 flex min-h-[520px] w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/55 p-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        <span>
          AD
          <br />
          광고 영역 예정
        </span>
      </div>
    </aside>
  );
}

function PageWithAdRails({
  children,
  maxWidth = 'max-w-5xl',
  yClass = 'py-10'
}: {
  children: ReactNode;
  maxWidth?: string;
  yClass?: string;
}) {
  return (
    <div className={`grid w-full grid-cols-1 gap-6 px-5 ${yClass} sm:px-8 xl:grid-cols-[128px_minmax(0,1fr)_128px] 2xl:grid-cols-[180px_minmax(0,1fr)_180px]`}>
      <AdRail side="left" />
      <div className={`mx-auto w-full ${maxWidth}`}>{children}</div>
      <AdRail side="right" />
    </div>
  );
}

function resetViewportTop() {
  requestAnimationFrame(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export default function App() {
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('home');
  const [pageTurnKey, setPageTurnKey] = useState(0);
  const [viewState, setViewState] = useState<AppViewState>('idle');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [folderFiles, setFolderFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [results, setResults] = useState(EMPTY_RESULTS);
  const [lastFileList, setLastFileList] = useState<string[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const folderFilesKey = folderFiles.map((file) => file.webkitRelativePath || file.name).join('|');
  const hasFolderInput = folderFiles.length > 0;
  const hasInput = zipFile !== null || hasFolderInput;
  const isBusy = status === 'loading' || status === 'parsing';
  const sourceLabel = useMemo(() => selectedSourceLabel(zipFile, folderFiles), [zipFile, folderFilesKey]);
  const sourceSize = useMemo(() => selectedSourceSize(zipFile, folderFiles), [zipFile, folderFilesKey]);

  useEffect(() => {
    if (activeMainTab === 'analyze' && ['fileSelected', 'analyzing', 'success', 'error'].includes(viewState)) {
      resetViewportTop();
    }
  }, [activeMainTab, viewState]);

  const resetAnalysis = () => {
    setResults(EMPTY_RESULTS);
    setStats(EMPTY_STATS);
    setLastFileList([]);
    setAnalysisProgress(0);
    setCurrentStep(0);
  };

  const switchMainTab = (tab: MainTab) => {
    setActiveMainTab(tab);
    if (tab === 'analyze' && viewState === 'idle') {
      setViewState('upload');
    }
    setPageTurnKey((key) => key + 1);
  };

  const openUpload = () => {
    setActiveMainTab('analyze');
    setViewState('upload');
    setPageTurnKey((key) => key + 1);
  };

  const resetToUpload = () => {
    setZipFile(null);
    setFolderFiles([]);
    setError(null);
    setStatus('idle');
    resetAnalysis();
    setViewState('upload');
  };

  const handleZipChange = (file: File | null) => {
    if (!file) {
      setZipFile(null);
      resetAnalysis();
      setViewState('upload');
      return;
    }

    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('지원되지 않는 파일입니다. Instagram 내보내기 ZIP 파일만 업로드해 주세요.');
      setStatus('error');
      setZipFile(null);
      setFolderFiles([]);
      resetAnalysis();
      setViewState('error');
      return;
    }

    setError(null);
    setStatus('idle');
    setZipFile(file);
    setFolderFiles([]);
    resetAnalysis();
    setViewState('fileSelected');
  };

  const handleFolderChange = (files: File[]) => {
    if (files.length === 0) {
      setFolderFiles([]);
      resetAnalysis();
      setViewState('upload');
      return;
    }

    const hasJson = files.some((file) => file.name.toLowerCase().endsWith('.json'));
    if (!hasJson) {
      setError('지원되지 않는 폴더입니다. Instagram 내보내기 폴더(JSON 포함)를 선택해 주세요.');
      setStatus('error');
      setZipFile(null);
      setFolderFiles([]);
      resetAnalysis();
      setViewState('error');
      return;
    }

    setError(null);
    setStatus('idle');
    setFolderFiles(files);
    setZipFile(null);
    resetAnalysis();
    setViewState('fileSelected');
  };

  const handleZipRejected = (message: string) => {
    setError(message);
    setStatus('error');
    setZipFile(null);
    setFolderFiles([]);
    resetAnalysis();
    setViewState('error');
  };

  const handleAnalyze = async () => {
    if (!hasInput || isBusy) return;
    const advanceStep = async (step: number, progress: number, delay = 260) => {
      setCurrentStep(step);
      setAnalysisProgress(progress);
      await wait(delay);
    };

    resetAnalysis();
    setError(null);
    setStatus('loading');
    setViewState('analyzing');
    setCurrentStep(0);
    setAnalysisProgress(12);

    try {
      await advanceStep(0, 12, 280);
      await advanceStep(1, 28, 280);
      setStatus('parsing');
      await advanceStep(2, 46, 280);
      const output = await analyzeInstagramExport(zipFile, folderFiles);
      await advanceStep(3, 62, 240);
      await advanceStep(4, 80, 240);
      await advanceStep(5, 96, 240);
      setCurrentStep(6);
      setAnalysisProgress(100);
      setLastFileList(output.fileList);
      setStats(output.stats);
      setResults(output.results);
      await wait(180);
      setStatus('done');
      setViewState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      if (err instanceof InstagramExportAnalysisError) {
        setLastFileList(err.fileList);
      }
      setStatus('error');
      setViewState('error');
    }
  };

  const mainContent = (() => {
    if (activeMainTab === 'guide') {
      return (
        <main className="bg-slate-50">
          <PageWithAdRails>
            <DownloadGuide />
          </PageWithAdRails>
        </main>
      );
    }

    if (activeMainTab === 'privacy') {
      return (
        <main className="bg-slate-50">
          <PageWithAdRails>
            <PrivacyNotice />
          </PageWithAdRails>
        </main>
      );
    }

    if (activeMainTab === 'home') {
      return (
      <main className="bg-[#f7f7f5]">
        <PageWithAdRails maxWidth="max-w-6xl">
        <section className="grid min-h-[calc(100vh-153px)] w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-[#e1306c]">
              나를 팔로우하지 않는 계정을 먼저 보여줍니다
            </p>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.06] text-slate-950 sm:text-5xl lg:text-[56px]">
              인스타 언팔로워 후보,
              <br />
              로그인 없이 확인하세요.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Instagram 내보내기 ZIP을 브라우저 안에서만 분석합니다. 파일은 서버로 전송되지 않습니다.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button type="button" className="btn-brand min-h-14 px-6 text-base" onClick={openUpload}>
                ZIP으로 확인 시작하기
              </button>
              <button type="button" className="btn-outline min-h-14 px-6 text-base" onClick={() => switchMainTab('guide')}>
                다운로드 방법 보기
              </button>
            </div>
            <div className="mt-6">
              <TrustBadges />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-950">분석 기준</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>원본 ZIP은 서버로 전송되지 않습니다.</li>
              <li>팔로워/팔로우 데이터를 비교해 후보를 계산합니다.</li>
              <li>Instagram 또는 Meta의 공식 서비스가 아닙니다.</li>
            </ul>
          </div>
        </section>
        </PageWithAdRails>
      </main>
      );
    }

    return (
      <main className="bg-[#f7f7f5]">
        {(viewState !== 'idle' || hasInput || error) && (
          <PageWithAdRails>
            {viewState === 'upload' && (
              <div key="upload" className="state-turn space-y-5">
                <div>
                  <p className="text-sm font-semibold text-blue-700">ZIP 업로드</p>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-950">Instagram 내보내기 ZIP 선택</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                    다운로드한 ZIP을 그대로 선택하세요. ZIP이 없을 때만 폴더 업로드를 보조로 사용합니다.
                  </p>
                </div>
                <Uploader
                  zipFile={zipFile}
                  folderFiles={folderFiles}
                  onZipChange={handleZipChange}
                  onFolderChange={handleFolderChange}
                  onZipRejected={handleZipRejected}
                  onAnalyze={handleAnalyze}
                  disabled={isBusy}
                  onGuideClick={() => switchMainTab('guide')}
                  showAnalyzePanel={false}
                />
              </div>
            )}

            {viewState === 'fileSelected' && (
              <section key="fileSelected" className="state-turn mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-700">
                  ✓
                </div>
                <p className="mt-5 text-sm font-semibold text-blue-700">분석 준비 완료</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-950">ZIP 선택 완료</h2>
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">선택한 파일</p>
                  <p className="mt-2 truncate text-lg font-semibold text-slate-950" title={sourceLabel}>
                    {sourceLabel}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{sourceSize}</p>
                </div>
                <p className="mt-5 text-sm leading-6 text-slate-500">
                  이 파일은 서버로 전송되지 않고, 브라우저 안에서만 분석됩니다.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <button type="button" className="btn-brand min-h-14 px-8 text-base" onClick={handleAnalyze}>
                    분석 시작
                  </button>
                  <button type="button" className="btn-outline" onClick={resetToUpload}>
                    다른 ZIP 선택
                  </button>
                  <button type="button" className="btn-outline" onClick={() => switchMainTab('guide')}>
                    다운로드 방법 보기
                  </button>
                </div>
              </section>
            )}

            {viewState === 'analyzing' && (
              <div key="analyzing" className="state-turn">
                <AnalyzeProgress progress={analysisProgress} currentStep={currentStep} />
              </div>
            )}

            {viewState === 'error' && (
              <section key="error" className="state-turn mx-auto max-w-3xl rounded-2xl border border-rose-200 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-sm font-semibold text-rose-600">분석할 수 없습니다</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-950">파일을 다시 확인해 주세요.</h2>
                <p className="mt-4 rounded-xl bg-rose-50 p-4 text-sm leading-6 text-rose-700">
                  {error ?? '알 수 없는 오류가 발생했습니다.'}
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button type="button" className="btn-brand" onClick={resetToUpload}>
                    다른 ZIP 선택
                  </button>
                  <button type="button" className="btn-outline" onClick={() => switchMainTab('guide')}>
                    다운로드 방법 보기
                  </button>
                </div>
                <div className="mt-6">
                  <UsedFilesPanel stats={stats} error={error} lastFileList={lastFileList} />
                </div>
              </section>
            )}
          </PageWithAdRails>
        )}

        {viewState === 'success' && (
          <PageWithAdRails maxWidth="max-w-6xl" yClass="pt-4 pb-10 sm:pt-5 sm:pb-10">
          <section className="success-reveal flex w-full flex-col gap-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">현재 분석 파일</p>
                  <h2 className="mt-2 truncate text-2xl font-semibold text-slate-950">{sourceLabel}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    이 결과는 Instagram 내보내기 파일 생성 시점의 스냅샷입니다.
                  </p>
                </div>
                <button type="button" className="btn-outline" onClick={resetToUpload}>
                  다른 ZIP 분석하기
                </button>
              </div>
            </div>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="언팔로워 후보"
                value={results.unfollowers.length}
                tone="text-[#e1306c]"
                help={`전체 팔로잉 ${results.following.length.toLocaleString()}명 중 약 ${ratio(results.unfollowers.length, results.following.length)}%`}
              />
              <StatCard label="맞팔" value={results.mutuals.length} help="서로 팔로우 중인 계정" />
              <StatCard label="나를 팔로우함" value={results.fans.length} help="상대는 나를 팔로우하지만 나는 팔로우하지 않음" />
              <StatCard
                label="읽지 못한 항목"
                value={stats.skipCount}
                tone={stats.skipCount > 0 ? 'text-amber-600' : 'text-slate-950'}
                help="파싱하지 못했거나 누락된 항목"
              />
            </section>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
              이 결과는 Instagram 내보내기 파일을 기준으로 계산됩니다. 실시간 Instagram 상태와 다를 수 있으며,
              비공개 계정·삭제된 계정·데이터 누락에 따라 일부 차이가 생길 수 있습니다.
            </div>

            <GraphCandidateCards results={results} stats={stats} />
            <GraphSection results={results} stats={stats} />
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
          </section>
          </PageWithAdRails>
        )}
      </main>
    );
  })();

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-slate-900">
      <div className="mx-auto min-h-screen w-full bg-[#f7f7f5]">
        <AppHeader activeMainTab={activeMainTab} onTabChange={switchMainTab} />
        <div key={pageTurnKey} className="page-turn">
          {mainContent}
        </div>
      </div>
    </div>
  );
}
