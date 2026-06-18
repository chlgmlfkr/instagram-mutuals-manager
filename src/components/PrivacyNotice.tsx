type PrivacyNoticeProps = {
  variant?: 'full' | 'compact';
};

export default function PrivacyNotice({ variant = 'full' }: PrivacyNoticeProps) {
  if (variant === 'compact') {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Privacy</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">개인정보는 어떻게 처리되나요?</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              원본 ZIP, 파일명, 사용자명, 결과 목록은 서버로 전송하지 않습니다. 광고를 붙이더라도 분석
              데이터와 분리합니다.
            </p>
            <a
              href="/privacy.html"
              className="mt-2 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
              개인정보 안내 보기
            </a>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              수집하지 않음
            </span>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              로컬 분석
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
              공식 서비스 아님
            </span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Privacy Boundary</p>
        <h2 className="text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">ISeeSocial 개인정보 안내</h2>
        <p className="max-w-3xl text-sm leading-6 text-slate-500">
          ISeeSocial은 사용자가 직접 받은 Instagram 내보내기 ZIP 또는 압축 해제 폴더를 브라우저에서만
          분석하는 정적 웹앱입니다. 로그인, Instagram 공식 API, 비공식 크롤링, private API를 사용하지
          않습니다.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
          서버 미전송
        </span>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
          로그인 불필요
        </span>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
          브라우저 로컬 분석
        </span>
      </div>

      <div className="mt-7 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-800">수집하지 않음</p>
          <p className="mt-2 text-sm leading-6 text-emerald-700">
            원본 ZIP, 파일명, 사용자명, 결과 목록은 이 앱 서버로 전송하지 않습니다.
          </p>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-800">로컬 기준 분석</p>
          <p className="mt-2 text-sm leading-6 text-blue-700">
            결과는 Instagram 내보내기 파일 생성 시점의 스냅샷입니다.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">공식 서비스 아님</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            ISeeSocial은 Instagram 또는 Meta의 공식 서비스가 아닙니다.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 text-sm leading-7 text-slate-600">
        <section>
          <h3 className="text-lg font-semibold text-slate-950">수집하지 않는 정보</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>업로드한 원본 ZIP 또는 폴더 파일</li>
            <li>파일명과 파일 내부 JSON 내용</li>
            <li>Instagram 사용자명, 팔로워/팔로우 목록, 분석 결과 목록</li>
            <li>선택 복사, CSV 다운로드, 검색어 같은 분석 중 입력값</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-slate-950">브라우저에서 처리되는 정보</h3>
          <p className="mt-3">
            분석에 필요한 파일 읽기, JSON 파싱, 관계 계산은 사용자의 브라우저 메모리 안에서 실행됩니다.
            페이지를 새로고침하거나 닫으면 현재 분석 상태는 유지되지 않습니다.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-slate-950">광고와 통계</h3>
          <p className="mt-3">
            향후 광고나 방문 통계를 도입하더라도 원본 파일, 파일명, 사용자명, 결과 목록을 광고 코드나
            통계 도구에 넘기지 않는 구조를 유지합니다. 광고는 업로드 영역, 분석 버튼, 오류/진단 메시지,
            결과 테이블 내부에 배치하지 않습니다.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-slate-950">공식 서비스 아님</h3>
          <p className="mt-3">
            ISeeSocial은 Instagram 또는 Meta의 공식 서비스가 아닙니다. 결과는 Instagram 내보내기 파일
            생성 시점의 스냅샷이며, 실제 앱 화면과 차이가 있을 수 있습니다.
          </p>
        </section>

        <p className="text-xs text-slate-500">마지막 업데이트: 2026년 6월 11일</p>
      </div>
    </section>
  );
}
