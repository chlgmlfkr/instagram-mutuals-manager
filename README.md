# Instagram 맞팔 탐지기

Instagram Accounts Center에서 받은 내보내기 ZIP을 브라우저에서 분석해 `팔로우`, `팔로워`, `언팔로우`, `언팔로워`, `제한`, `차단` 목록을 보여주는 정적 웹앱입니다.

## 핵심 원칙
- Instagram 로그인 불필요
- Instagram 공식 API 미사용
- 비공식 크롤링/private API 미사용
- 업로드 파일과 분석 결과를 서버로 전송하지 않음
- 분석은 브라우저 로컬 메모리에서만 수행

## 현재 기능
- ZIP 업로드 분석
- 압축 해제된 폴더 업로드 보조 분석
- 결과 탭에서 빈 항목 자동 숨김
- 사용자 검색, 복사, CSV 다운로드
- 제한/차단 목록 표시
- `ins/` 샘플 ZIP 기준 케이스 리포트 생성
- 특정 계정이 ZIP 원본에 실제 존재하는지 진단

## 분류 기준
- `팔로우`: 내가 팔로우 중인 계정
- `팔로워`: 나를 팔로우 중인 계정
- `언팔로우`: 상대는 나를 팔로우하지만, 나는 상대를 팔로우하지 않는 상태
- `언팔로워`: 나는 상대를 팔로우하지만, 상대는 나를 팔로우하지 않는 상태
- `제한`: Instagram 내보내기에서 제한 계정으로 잡힌 상태
- `차단`: Instagram 내보내기에서 차단 계정으로 잡힌 상태

## 실행 방법
```bash
npm install
npm run dev
```

브라우저에서 Vite 로컬 주소로 접속하면 됩니다.

## 모바일 테스트
같은 Wi-Fi에 연결된 상태에서:

```bash
npm run dev:mobile
```

그다음 PC의 로컬 IP로 접속:
- 예: `http://192.168.0.12:5173`
- macOS 로컬 IP 확인: `ipconfig getifaddr en0`

주의:
- 회사/학교 네트워크는 내부 접속이 막힐 수 있음
- 방화벽이 켜져 있으면 `node` 수신 허용 필요

## 빌드와 미리보기
```bash
npm run build
npm run preview
```

## 테스트
```bash
npm test -- --run
```

현재 테스트 범위:
- 사용자명 추출
- ZIP 파일 탐색
- 집합 연산
- fixture 기반 통합 테스트

## `ins/` 샘플 분석 도구
`ins/` 폴더에 넣어둔 ZIP들을 기준으로 케이스 리포트를 생성할 수 있습니다.

```bash
npm run report:ins
```

생성 결과:
- `ins/CASE_REPORT.md`

기본 동작:
- 300MB 초과 ZIP은 메모리 보호를 위해 자동 스킵

대용량 ZIP까지 포함하려면:

```bash
INS_REPORT_MAX_SIZE_MB=2000 npm run report:ins
```

또는:

```bash
npm run report:ins -- --max-size-mb=2000
```

## 특정 계정 진단
정확도가 의심될 때는 먼저 원본 ZIP에 그 계정이 실제로 들어있는지 확인하는 게 맞습니다.

```bash
npm run inspect:user -- nx.g0_x
```

이 명령은 `ins/` 폴더의 ZIP들을 순회하면서 아래를 보여줍니다.
- `followers` 원본에 있는지
- `following` 원본에 있는지
- `restricted` 원본에 있는지
- `blocked` 원본에 있는지
- 현재 로직 기준 최종 분류가 무엇인지

이 결과를 보면 문제를 두 갈래로 나눌 수 있습니다.
- ZIP 원본에 없음: 내보내기 시점과 현재 인스타 상태가 다를 가능성이 큼
- ZIP 원본에 있음: 파싱/분류 로직 문제일 가능성이 큼

## 정확도가 떨어질 때 점검 순서
1. 문제 계정을 `npm run inspect:user -- <아이디>`로 확인
2. 원본 ZIP에 실제 존재하는지 먼저 확인
3. 존재하는데 분류가 틀리면 fixture로 추가
4. fixture를 기반으로 회귀 테스트 작성

MCP로 인스타를 직접 보며 하나씩 대조하는 방식은 시간이 많이 들고 재현성도 낮습니다. 이 프로젝트에서는 ZIP 원본 기준 진단과 fixture 테스트 축적이 더 좋은 방향입니다.

## 지원하는 Instagram 내보내기 형태
우선적으로 아래 경로를 찾습니다.

```text
connections/followers_and_following/followers_1.json
connections/followers_and_following/followers.json
connections/followers_and_following/following.json
connections/followers_and_following/blocked_profiles.json
connections/followers_and_following/restricted_profiles.json
```

구조가 조금 달라도 파일명 패턴이 맞으면 탐색하도록 되어 있습니다.

## 폴더 구조
```text
src/
  App.tsx
  components/
    Uploader.tsx
    ResultsTabs.tsx
    ListView.tsx
    StatsCharts.tsx
    DownloadGuide.tsx
  utils/
    scanZip.ts
    loadJson.ts
    extractEntries.ts
    extractUsernames.ts
    setOps.ts
    exportCsv.ts
  __tests__/
scripts/
  generate-ins-report.mjs
  inspect-user-in-zips.mjs
ins/
  *.zip
  CASE_REPORT.md
```

## 배포
정적 사이트라 Vite 빌드 산출물(`dist/`)만 배포하면 됩니다.

GitHub Pages 또는 Cloudflare Pages에 바로 올릴 수 있습니다.
- Build command: `npm run build`
- Output directory: `dist`

## 한계
- 분석 결과는 Instagram 내보내기 시점의 스냅샷 기준입니다
- 현재 앱은 시점 비교 기능이 없어서 “언제 맞팔이 바뀌었는지”는 알 수 없습니다
- 계정명 변경, 내보내기 시점 차이, 누락된 export 항목 때문에 실제 앱 화면과 체감이 다를 수 있습니다
