import PrivacyNotice from './PrivacyNotice';

const guideCards = [
  {
    title: '1. 경로 이동',
    body: '계정 센터 → 내 정보 및 권한 → 내 정보 다운로드',
    note: '기기로 내보내기 선택'
  },
  {
    title: '2. 정보 맞춤 설정',
    body: '최소 포함 항목: 팔로워 및 팔로잉(Connections)',
    note: '계정마다 표기가 다를 수 있으나 followers/following 관련 항목이 포함되어야 함'
  },
  {
    title: '3. 기간 설정',
    body: '전체 기간',
    note: '일부 기간만 선택하면 목록 누락 가능'
  },
  {
    title: '4. 형식 설정',
    body: 'JSON (필수)',
    note: 'HTML로 받으면 이 앱에서 분석 불가'
  }
];

export default function DownloadGuide() {
  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Download Guide
          </p>
          <h2 className="text-2xl font-semibold text-slate-950">내보내기 설정</h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-500">
            ISeeSocial은 Instagram에서 직접 받은 내보내기 파일만 분석합니다. 로그인, 크롤링, 공식 API,
            private API를 사용하지 않습니다.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {guideCards.map((card) => (
            <div key={card.title} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-950">{card.title}</p>
              <p className="mt-2 text-sm text-slate-600">{card.body}</p>
              <p className="mt-1 text-xs text-slate-400">{card.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-lg border border-slate-200 bg-amber-50 p-5 text-sm text-slate-600">
          <p className="font-semibold text-slate-950">확인 체크리스트</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>형식이 JSON인지 확인</li>
            <li>기간이 전체 기간인지 확인</li>
            <li>ZIP 내부에 `followers_1.json` / `following.json` 또는 유사 파일이 있는지 확인</li>
            <li>결과가 틀려 보이면 export 생성 시점과 사용 파일 진단을 함께 확인</li>
          </ul>
        </div>

        <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-700">
          자세한 단계와 자주 틀리는 설정은{' '}
          <a href="/instagram-export-guide.html" className="font-semibold text-blue-800 underline">
            인스타그램 내보내기 ZIP 받는 방법
          </a>
          에 정리해 두었습니다.
        </div>
      </section>
      <PrivacyNotice />
    </div>
  );
}
