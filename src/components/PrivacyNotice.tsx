export default function PrivacyNotice() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Privacy Boundary
        </p>
        <h2 className="text-xl font-semibold text-slate-950">개인정보와 광고 경계</h2>
        <p className="max-w-3xl text-sm leading-6 text-slate-500">
          ISeeSocial은 사용자가 직접 받은 Instagram 내보내기 파일을 브라우저에서만 분석합니다.
          광고를 도입하더라도 파일 내용과 분석 결과를 광고 코드에 넘기지 않는 구조를 유지합니다.
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
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
    </section>
  );
}
