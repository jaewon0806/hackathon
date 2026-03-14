> **개발 프로세스/검증 절차**: [`docs/dev-process.md`](dev-process.md) 참조
> **롤백 시나리오 상세**: [`docs/dev-process.md` 섹션 6.4](dev-process.md#64-롤백-시나리오) 참조

## Git 브랜치 전략 & 배포 흐름

### 브랜치 구조

| 브랜치 | 역할 | 배포 환경 |
|--------|------|----------|
| `sprint{n}` | 스프린트 단위 개발 작업 | 로컬 |
| `develop` | 스테이징 통합 브랜치 | 로컬 Docker |
| `main` | 프로덕션 브랜치 | 프로덕션 서버 |
| `hotfix/*` | 긴급 운영 패치 | main + develop 동시 반영 |

---

### 배포 흐름

```
sprint{n}
  ↓ PR & merge (스프린트 완료 시)
develop ──────────────→ 로컬 docker compose up --build 로 스테이징 검증
  ↓ PR & merge (QA 통과 후)
main    ──────────────→ GitHub Actions → 프로덕션 서버 자동 배포
  ↓ tag
v1.0.0, v1.1.0 ...
```

### Hotfix 배포 흐름

```
hotfix/*
  ↓ PR & merge (긴급 패치)
main    ──────────────→ GitHub Actions → 프로덕션 서버 자동 배포
  ↓ 역머지
develop ──────────────→ main 변경사항 동기화
```

---

### Docker 이미지 태깅 규칙

| 이미지 | Registry |
|--------|---------|
| SPA (React + Nginx) | `ghcr.io/{GITHUB_ORG}/{PROJECT}` |

| 브랜치 | Image Tag |
|--------|-----------|
| `develop` merge | 이미지 빌드 없음 — 로컬 Docker로만 검증 |
| `main` merge | `latest`, `{commit SHA}` |
| `hotfix` | `{MAJOR.MINOR.PATCH}` |

> 버전은 Semantic Versioning (`MAJOR.MINOR.PATCH`) 기준

---

### 핵심 규칙

- `main` 직접 push 금지 — 반드시 PR + 리뷰 후 merge
- `develop` → `main` merge는 QA 통과 후 진행
- 긴급 패치는 **`main` 기반**으로 `hotfix/*` 브랜치를 생성하여 작업
- hotfix PR은 **`main`으로 직접** 생성 (develop 거치지 않음)
- main merge 후 반드시 `develop`에 역머지하여 동기화
- hotfix 범위 제한: 파일 3개 이하, 코드 50줄 이하, 새 의존성 없음
- 스프린트 병렬 진행 시 `develop` merge 충돌 주의

---

## CI 파이프라인 (PR 체크)

PR이 `develop` 또는 `main`으로 올라오면 GitHub Actions가 자동으로 실행됩니다.

### 필수 통과 조건

| Job | 내용 |
|-----|------|
| `lint-and-typecheck` | ESLint (`--max-warnings 0`) + TypeScript strict 타입 체크 |
| `build` | Vite 프로덕션 빌드 검증 (더미 환경변수 주입) |
| `docker-build` | Dockerfile 빌드 성공 여부 확인 |

PR merge는 위 조건이 모두 통과된 후에만 가능합니다 (Branch Protection Rule).

---

## CD 파이프라인 (배포 흐름)

### develop merge 후 (스테이징 검증)

`develop` 브랜치는 별도 서버 없이 **로컬 Docker**로 스테이징 검증합니다.

```bash
# 로컬에서 최신 코드 반영 후 검증
git pull origin develop
docker compose up --build
# → http://localhost 에서 SPA 접속 확인
```

### main merge 후 (프로덕션 배포)

`main` 브랜치에 merge되면 GitHub Actions가 자동으로:

1. Docker 이미지 빌드 (React SPA → Nginx 서빙)
2. GHCR에 이미지 push (`latest` + `{commit-sha}` 태그)
3. 프로덕션 서버에 SSH 접속
4. `docker compose pull && docker compose up -d` 실행

---

## 환경별 설정 관리

| 환경 | 설정 방법 | 비고 |
|------|----------|------|
| 로컬 개발 | `.env.local` 파일 | Git 미추적 (`.gitignore`) |
| CI 빌드 | 더미 환경변수 (`ci.yml` 하드코딩) | 빌드 성공 여부만 검증 |
| 프로덕션 | GitHub Secrets | Actions에서 주입 |

### GitHub Secrets 목록 (프로덕션 필수)

| Secret 이름 | 설명 |
|------------|------|
| `LIGHTSAIL_SSH_KEY` | 서버 인스턴스 SSH 프라이빗 키 |
| `LIGHTSAIL_HOST` | 서버 IP 또는 도메인 |
| `LIGHTSAIL_USER` | SSH 사용자명 (예: `ubuntu`) |

> **주의**: `VITE_GITLAB_URL`, `VITE_REDMINE_URL` 등 API 연결 정보는 사용자가 브라우저 설정 화면에서 직접 입력합니다. GitHub Secrets에 포함하지 않습니다.

---

## 롤백 절차

> 시나리오별 상세 절차는 [docs/dev-process.md 섹션 6.4](dev-process.md#64-롤백-시나리오) 참조.

### 빠른 롤백 (Docker 이미지)

```bash
# 서버 SSH 접속 후
cd {APP_PATH}
docker compose down
docker pull ghcr.io/{GITHUB_ORG}/{PROJECT}:v{이전_버전}
docker compose up -d
```

---

## HTTPS/TLS

### 방법 1: Let's Encrypt + certbot (권장)

```bash
# 서버 인스턴스에서
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

Nginx 설정에서 certbot이 자동으로 SSL 블록을 추가합니다. 90일마다 자동 갱신됩니다.

### 방법 2: 로드밸런서 SSL

AWS Lightsail 또는 다른 클라우드 콘솔에서 로드밸런서 생성 후 SSL 인증서를 연결합니다.
추가 비용이 발생하지만 관리가 단순합니다.
