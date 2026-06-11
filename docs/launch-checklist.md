# Launch Checklist

ISeeSocial public launch 기준입니다. 목표는 먼저 작은 정적 사이트로 배포하고, 분석 정확도와 개인정보 신뢰를 해치지 않는 범위에서 트래픽/수익화를 단계적으로 붙이는 것입니다.

## 1. 로컬 검증
- [ ] `npm install`
- [ ] `npm run verify`
- [ ] `dist/_headers`, `dist/_redirects`, `dist/robots.txt`, `dist/sitemap.xml`, `dist/og-image.svg` 생성 확인
- [ ] 모바일 390px 전후에서 첫 화면의 ZIP CTA, 개인정보 문구, 다운로드 가이드 진입 확인
- [ ] 데스크톱 1440px 전후에서 `언팔로워 후보` 결과가 관계 분석보다 먼저 보이는지 확인

## 2. GitHub 준비
- [ ] GitHub 인증 토큰에 `workflow` scope 포함
- [ ] `.github/workflows/verify.yml` 푸시
- [ ] `Verify` 워크플로우 통과 확인
- [ ] 운영 브랜치를 `main`으로 유지할지, 별도 release 브랜치를 둘지 결정

## 3. Cloudflare Pages 배포
- [ ] `wrangler login` 또는 `CLOUDFLARE_API_TOKEN` 설정
- [ ] `npx wrangler whoami` 성공 확인
- [ ] `npm run deploy:cf`
- [ ] Cloudflare Pages 프로젝트 이름이 `iseesocial`인지 확인
- [ ] Build command: `npm run build`
- [ ] Build output directory: `dist`
- [ ] Custom domain을 붙이면 `public/robots.txt`, `public/sitemap.xml`, `index.html`의 `https://isee.social/` 값을 실제 도메인으로 교체

## 4. 배포 후 스모크 테스트
- [ ] ZIP 선택 후 분석 완료
- [ ] 압축 해제 폴더 fallback 분석 완료
- [ ] `언팔로워 후보`, `맞팔`, `언팔로우`, `해석 실패` 수치 표시 확인
- [ ] 검색, 전체 선택, 선택 복사, CSV 다운로드 확인
- [ ] 다운로드 가이드와 개인정보/광고 경계 문구 확인
- [ ] iPhone Safari, Android Chrome에서 첫 화면과 결과 탭 확인

## 5. 수익화 전 조건
- [ ] 실제 사용자 ZIP에서 오분류 사례를 fixture로 축적
- [ ] 광고 위치는 가이드 하단 또는 결과 페이지 하단부터 시작
- [ ] 파일 업로드 영역, 분석 버튼 주변, 오류/진단 메시지 내부에는 광고 금지
- [ ] 광고 스크립트가 ZIP, 파일명, username, 결과 목록을 읽지 못하도록 코드 경계 재점검
- [ ] Cloudflare Web Analytics처럼 개인정보 침해가 적은 방문 통계부터 검토

## 현재 차단 상태
- GitHub push: `.github/workflows/verify.yml` 변경에는 `workflow` scope가 필요합니다.
- Cloudflare deploy: 현재 로컬 `wrangler`는 로그인되어 있지 않습니다.
