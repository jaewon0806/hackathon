# 배포 현황 및 수동 검증 가이드

> **최종 업데이트**: 2026-03-15
> 완료된 배포 이력: `docs/deploy-history/`

---

## 현재 배포 상태

| 환경 | URL | 상태 |
|------|-----|------|
| Vercel (데모) | 배포 후 URL 기재 예정 | ✅ VITE_DEMO_MODE=true |
| 사내 서버 | 사내망 내부 URL | ⬜ Lightsail 서버 설정 필요 |

---

## 자동화 검증 현황 (CI)

GitHub Actions (`ci.yml`) — PR to develop/main 시 자동 실행

| Job | 상태 | 설명 |
|-----|------|------|
| lint-and-typecheck | ✅ | ESLint max-warnings 0, TypeScript strict |
| test | ✅ | Vitest 62건 단위/컴포넌트 테스트 통과 |
| build | ✅ | Vite 프로덕션 빌드 성공 |
| e2e | ✅ | Playwright 7건 E2E 테스트 (데모 모드) |
| docker-build | ✅ | Dockerfile 멀티스테이지 빌드 검증 |

---

## Sprint 8 완료 검증 결과 (2026-03-15)

### 자동 검증

- ✅ `npm test`: 62/62 통과 (단위 테스트 + 컴포넌트 테스트)
- ✅ `npm run build`: 성공 (dist/ 생성, 400KB gzip 127KB)
- ✅ `npm run test:e2e`: Playwright 7건 통과 (데모 모드)
- ✅ Docker 이미지 빌드: CI docker-build job 통과
- ✅ ESLint: 경고 0건
- ✅ TypeScript strict 타입 체크: 오류 0건

### 기능 검증

- ✅ 데모 모드 (`VITE_DEMO_MODE=true`) 온보딩 모달 미표시 확인
- ✅ 샘플 데이터로 대시보드 정상 표시 확인
- ✅ GitLab/Redmine 페이지 샘플 데이터 표시 확인
- ✅ 챗봇 플로팅 버튼 표시 확인
- ✅ 다크모드/라이트모드 전환 확인
- ✅ 반응형 레이아웃 (모바일 768px 이하) 확인

### 배포 검증

- ✅ Vercel 데모 배포: `VITE_DEMO_MODE=true` 환경변수 설정 완료
- ✅ SPA 라우팅 (vercel.json rewrite 설정): 직접 URL 접근 정상
- ⬜ 사내 서버 Docker 배포: Lightsail 서버 프로비저닝 후 수행 예정

---

## 수동 배포 절차 (사내 서버)

사내 Lightsail 서버 준비 후 아래 절차 수행:

```bash
# 1. GitHub Secrets 설정 (Repository → Settings → Secrets)
# LIGHTSAIL_HOST, LIGHTSAIL_USER, LIGHTSAIL_SSH_KEY
# VITE_GITLAB_URL, VITE_REDMINE_URL, VITE_CLAUDE_MODEL

# 2. 서버에서 초기 설정
mkdir -p /opt/app
cd /opt/app

# 3. main 브랜치 push 시 deploy.yml이 자동 실행됨
# docker-compose.prod.yml pull → up -d
```

---

## 참고

- 검증 원칙: `docs/dev-process.md` 섹션 5
- CI/CD 정책: `docs/ci-policy.md`
- 배포 이력: `docs/deploy-history/`
- 롤백 방법: `docs/dev-process.md` 섹션 6.4
