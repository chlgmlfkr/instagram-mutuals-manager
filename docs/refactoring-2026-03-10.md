# 2026-03-10 리팩토링

작성일: 2026-03-10 (Asia/Seoul)

## 변경 목적
- `App.tsx`에 몰려 있던 분석 책임을 분리해서 유지보수성을 높임
- 분석 결과 타입을 공통화해서 상태 구조를 명확하게 정리함
- 결과 화면의 불필요한 props와 작은 UX 불일치를 정리함

## 변경 내용
- `src/utils/analyzeInstagramExport.ts` 추가
- ZIP/폴더 분석 흐름을 별도 모듈로 분리
- ZIP 경로 기반 분석과 폴더 기반 fallback 분석을 공통 반환 구조로 통합
- `src/types/analysis.ts` 추가
- 상태(`Status`), 통계(`ParsedStats`), 결과(`AnalysisResults`) 타입과 초기값 상수 분리
- `src/App.tsx` 정리
- 파싱 세부 구현을 제거하고 화면 상태 전환과 렌더링 조합만 담당하도록 축소
- `src/components/ResultsTabs.tsx` 정리
- 사용되지 않던 `mutuals` prop 제거
- `src/components/ListView.tsx` 수정
- 검색 필터를 대소문자 영향 없이 동작하도록 보정
- `.gitignore` 추가
- 실데이터 ZIP, 빌드 산출물, 의존성 폴더가 커밋에 포함되지 않도록 정리

## 검증
- `npm test -- --run`
  - 17개 테스트 통과
- `npm run build`
  - 프로덕션 빌드 성공

## 메모
- `ins/` 폴더의 ZIP은 테스트용 실데이터이므로 Git 추적에서 제외
- 현재 커밋은 저장소의 첫 커밋이므로 이후부터 변경 비교가 가능해짐
