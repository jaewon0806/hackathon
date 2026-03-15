# 배포 현황 및 검증 결과

> **최종 업데이트**: 2026-03-15
> 완료된 배포 이력: `docs/deploy-history/`

---

## 현재 배포 상태

| 환경 | 설명 | 상태 |
|------|-----|------|
| Vercel (데모) | `VITE_DEMO_MODE=true`, SPA 라우팅 rewrite 포함 | ✅ 설정 완료 |
| 사내 서버 (옵션) | Lightsail + Docker Compose + GitHub Actions CD | ✅ 파이프라인 구성 완료 |

---

## Sprint 8 자동 검증 결과 (2026-03-15)

### 단위 테스트 (Vitest)

- ✅ `npm test`: **97/97 통과** (8개 테스트 파일)
- ✅ `npm run test:coverage`: 커버리지 임계값 통과
  - `chatbotStore.ts`: Statements 100% / Branches 100% / Functions 100%
  - `settingsStore.ts`: Statements 100% / Branches 50% / Functions 100%
  - `gitlabStore.ts`: Statements 100% / Branches 100% / Functions 100%
  - `issueTreeBuilder.ts`: Statements 100% / Branches 100% / Functions 100%
  - `connectionTest.ts`: Statements 100% / Branches 100% / Functions 100%

### 정적 분석

- ✅ `npm run lint`: ESLint 경고 0건 (`--max-warnings 0`)
- ✅ `npm run typecheck`: TypeScript strict 오류 0건

### 빌드

- ✅ `npm run build`: 성공 (dist/ 생성, JS 403KB / gzip 128KB)

### E2E (Playwright)

- ✅ `npm run test:e2e`: **14/14 통과**
  - `demo.spec.ts` 7건: 기능 동작 (데스크톱)
  - `mobile.spec.ts` 7건: 반응형 레이아웃 (375px iPhone SE)

### 보안

- ✅ `IssueTreeNode`: `javascript:` 프로토콜 URL 차단 (`safePrefixUrl` 함수 적용)

---

## CI/CD 파이프라인 구성

GitHub Actions PR 체크 (`ci.yml`):

```
lint-and-typecheck → test(+coverage) → build → e2e → docker-build
```

| Job | 내용 | 아티팩트 |
|-----|------|---------|
| lint-and-typecheck | ESLint + TypeScript strict | — |
| test | Vitest 97건 + 커버리지 임계값 강제 | `coverage/` (14일 보관) |
| build | Vite 프로덕션 빌드 | — |
| e2e | Playwright 14건 (데스크톱 + 모바일 375px) | `playwright-report/` (7일 보관) |
| docker-build | Dockerfile 멀티스테이지 빌드 검증 | — |

---

## 사내 서버 배포 절차 (참고)

GitHub Actions CD (`deploy.yml`)는 `main` push 시 자동 실행:

1. Docker 이미지 빌드 (React Vite → Nginx 정적 서빙)
2. GHCR push (`latest` + `{sha}` 태그)
3. SSH → `docker compose pull && up -d`

필요 GitHub Secrets:
- `LIGHTSAIL_HOST`, `LIGHTSAIL_USER`, `LIGHTSAIL_SSH_KEY`
- `VITE_GITLAB_URL`, `VITE_REDMINE_URL`, `VITE_CLAUDE_MODEL`

---

## 참고

- 검증 원칙: `docs/dev-process.md` 섹션 5
- CI/CD 정책: `docs/ci-policy.md`
- 배포 이력: `docs/deploy-history/`
- 롤백 방법: `docs/dev-process.md` 섹션 6.4
