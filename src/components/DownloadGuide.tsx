export default function DownloadGuide() {
  return (
    <section className="glass rounded-2xl p-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-white/60">Instagram 데이터 다운로드 가이드</p>
        <h2 className="text-xl font-semibold">내보내기 설정 (필수)</h2>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-ink-700/50 p-4">
          <p className="text-sm font-semibold">1. 경로 이동</p>
          <p className="mt-2 text-sm text-white/70">
            계정 센터 → 내 정보 및 권한 → 내 정보 다운로드
          </p>
          <p className="mt-1 text-xs text-white/50">
            기기로 내보내기 선택
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-ink-700/50 p-4">
          <p className="text-sm font-semibold">2. 정보 맞춤 설정</p>
          <p className="mt-2 text-sm text-white/70">
            최소 포함 항목: 팔로워 및 팔로잉(Connections)
          </p>
          <p className="mt-1 text-xs text-white/50">
            계정마다 표기가 다를 수 있으나 followers/following 관련 항목이 포함되어야 함
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-ink-700/50 p-4">
          <p className="text-sm font-semibold">3. 기간 설정</p>
          <p className="mt-2 text-sm text-white/70">전체 기간</p>
          <p className="mt-1 text-xs text-white/50">
            일부 기간만 선택하면 목록 누락 가능
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-ink-700/50 p-4">
          <p className="text-sm font-semibold">4. 형식 설정</p>
          <p className="mt-2 text-sm text-white/70">JSON (필수)</p>
          <p className="mt-1 text-xs text-white/50">
            HTML로 받으면 이 앱에서 분석 불가
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-ink-700/50 p-4 text-sm text-white/75">
        <p className="font-semibold text-white">확인 체크리스트</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>형식이 JSON인지 확인</li>
          <li>기간이 전체 기간인지 확인</li>
          <li>ZIP 내부에 `followers_1.json` / `following.json` 또는 유사 파일이 있는지 확인</li>
        </ul>
      </div>
    </section>
  );
}
