# 사이트

이 사이트만의 것: 이름, 문구, 브랜드, 페이지, 그리고 사용을 켰는 모듈. 단계는 [업계로 바꾸기](../docs/customize.md)를 참고하십시오.

| 파일 | 내용 |
|---|---|
| `site.ts` | 사이트명, 업계 단어, 출간 시간, 홈/어바웃 문구, 공유 이미지 문구, 항목과 일간·주간·월간 리포트 표기, 공개 인터페이스의 카테고리, 비안호(备案) 번호 |
| `models.ts` | 이름 있는 모델과 각 단계에서 기본으로 쓰는 모델 (쓰지 않은 단계는 `.env`에서 설정한 것 하나를 씁니다) |
| `brand/` | 아이콘, Logo(`Logo.tsx`), 공유 이미지와 포스터 글자 로고(`wordmark.svg`, `wordmark-dark.svg`, 선택), 일간·주간·월간 리포트 명판 글자(`nameplates/`), 어바웃 페이지의 QR 코드(`contact/`, 선택) |
| `pages/` | 이용 규칙, 개인정보 처리방침(템플릿 — 배포 전에 실제 상황에 맞게 수정) |
| `public/` | 사이트 루트에 배포되는 고정 파일(사이트명, 주소 등의 플레이스홀더를 치환한 뒤 배포): `robots.txt`, `manifest.webmanifest`, `openapi-v1.json`, 그리고 선택적인 `.well-known/security.txt` |
| `changelog.json` | 업데이트 로그 |
| `modules/` | 사용할 모듈 목록: `index.ts`, `server.ts`, `web.ts` 세 매니페스트가 저장소 루트 `modules/<이름>/` 안에서 쓸 모듈을 나열하며, 기본은 전부 비어 있음. [아키텍처](../docs/architecture.md#模块)의 “모듈” 참고 |
