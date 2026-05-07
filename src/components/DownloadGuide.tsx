export default function DownloadGuide() {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
          Download Guide
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">내보내기 설정</h2>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-900">1. 경로 이동</p>
          <p className="mt-2 text-sm text-slate-600">
            계정 센터 → 내 정보 및 권한 → 내 정보 다운로드
          </p>
          <p className="mt-1 text-xs text-slate-400">
            기기로 내보내기 선택
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-900">2. 정보 맞춤 설정</p>
          <p className="mt-2 text-sm text-slate-600">
            최소 포함 항목: 팔로워 및 팔로잉(Connections)
          </p>
          <p className="mt-1 text-xs text-slate-400">
            계정마다 표기가 다를 수 있으나 followers/following 관련 항목이 포함되어야 함
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-900">3. 기간 설정</p>
          <p className="mt-2 text-sm text-slate-600">전체 기간</p>
          <p className="mt-1 text-xs text-slate-400">
            일부 기간만 선택하면 목록 누락 가능
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-900">4. 형식 설정</p>
          <p className="mt-2 text-sm text-slate-600">JSON (필수)</p>
          <p className="mt-1 text-xs text-slate-400">
            HTML로 받으면 이 앱에서 분석 불가
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-[24px] border border-slate-200 bg-amber-50 p-5 text-sm text-slate-600">
        <p className="font-semibold text-slate-900">확인 체크리스트</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>형식이 JSON인지 확인</li>
          <li>기간이 전체 기간인지 확인</li>
          <li>ZIP 내부에 `followers_1.json` / `following.json` 또는 유사 파일이 있는지 확인</li>
        </ul>
      </div>
    </section>
  );
}
