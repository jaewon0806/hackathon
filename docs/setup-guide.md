# 환경 설정 가이드

> 프로젝트 최초 시작 시 1회 수행하는 환경 설정 가이드입니다.
> **참조**: [architecture.md](architecture.md)

---

## 1. 사전 요구사항

- [ ] Git 2.40+
- [ ] Docker Desktop 4.x (프로덕션 배포 시)
- [ ] Node.js 20 LTS (`node --version`으로 확인)
- [ ] npm 10+ (`npm --version`으로 확인)
- [ ] GitLab Personal Access Token (read_api 권한)
- [ ] Redmine API Access Key
- [ ] Anthropic API Key

---

## 2. 저장소 클론

```bash
git clone https://github.com/frogy95/choiji-guide-big.git
cd choiji-guide-big
```

---

## 3. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열고 필요한 값을 입력합니다:

```env
# GitLab
VITE_GITLAB_URL=https://gitlab.ubware.com
VITE_GITLAB_TOKEN=your_gitlab_personal_access_token

# Redmine
VITE_REDMINE_URL=https://redmine.ubware.com
VITE_REDMINE_API_KEY=your_redmine_api_key

# Anthropic (Claude)
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
VITE_CLAUDE_MODEL=claude-haiku-4-5

# 앱 설정
VITE_DEFAULT_REFRESH_INTERVAL=900   # 초 단위: 0=수동, 300=5분, 900=15분, 1800=30분
```

> **참고**: `VITE_` 접두사가 붙어야 브라우저에서 접근 가능합니다.
> 환경변수는 초기 기본값으로 사용되며, 앱 내 설정 화면에서 변경 후 로컬 스토리지에 저장됩니다.

---

## 4. 로컬 개발 환경 실행

### 방법 A. Node.js 직접 실행 (권장, 개발 시)

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (localhost:5173)
npm run dev
```

### 방법 B. Docker로 실행 (프로덕션과 동일한 환경)

```bash
# Docker Compose로 Nginx + 빌드 이미지 실행
docker compose up --build

# 접속: http://localhost:80
```

### 접속 URL

| 환경 | URL |
|------|-----|
| 개발 서버 (npm run dev) | http://localhost:5173 |
| Docker 로컬 | http://localhost:80 |

---

## 5. 외부 서비스 설정

### 5.1 GitLab Personal Access Token 발급

1. GitLab (`https://gitlab.ubware.com`) 로그인
2. 우측 상단 프로필 아이콘 → **Preferences**
3. 좌측 메뉴 **Access Tokens**
4. **Add new token** 클릭
5. 설정:
   - Name: `dashboard-read`
   - Expiration date: 원하는 만료일
   - Scopes: **`read_api`** 체크
6. **Create personal access token** 클릭
7. 생성된 토큰을 `.env`의 `VITE_GITLAB_TOKEN`에 입력

### 5.2 Redmine API Key 발급

1. Redmine (`https://redmine.ubware.com`) 로그인
2. 우측 상단 프로필 아이콘 → **내 계정**
3. 우측 하단 **API 액세스 키** 확인 (또는 **재생성**)
4. 복사한 키를 `.env`의 `VITE_REDMINE_API_KEY`에 입력

### 5.3 Anthropic API Key 발급

1. https://console.anthropic.com 로그인
2. **API Keys** 메뉴 → **Create Key**
3. 생성된 키를 `.env`의 `VITE_ANTHROPIC_API_KEY`에 입력
4. 모델 선택:
   - `claude-haiku-4-5`: 빠르고 저렴 (챗봇에 적합)
   - `claude-sonnet-4-6`: 더 정확하고 상세한 응답

---

## 6. Nginx 프록시 설정 (프로덕션)

GitLab / Redmine API의 CORS 정책으로 인해 Nginx 리버스 프록시 설정이 필요합니다.

`nginx.conf` 예시:

```nginx
server {
    listen 80;
    server_name localhost;

    # React SPA — 모든 경로를 index.html로 라우팅
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # GitLab API 프록시
    location /gitlab-api/ {
        proxy_pass https://gitlab.ubware.com/api/v4/;
        proxy_set_header Host gitlab.ubware.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_ssl_server_name on;
        proxy_ssl_protocols TLSv1.2 TLSv1.3;
    }

    # Redmine API 프록시
    location /redmine-api/ {
        proxy_pass https://redmine.ubware.com/;
        proxy_set_header Host redmine.ubware.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_ssl_server_name on;
        proxy_ssl_protocols TLSv1.2 TLSv1.3;
    }
}
```

---

## 7. 개발 도구 설정

### VS Code 권장 익스텐션

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",           // ESLint
    "esbenp.prettier-vscode",           // Prettier
    "bradlc.vscode-tailwindcss",        // Tailwind CSS IntelliSense
    "ms-vscode.vscode-typescript-next", // TypeScript 최신 지원
    "formulahendry.auto-rename-tag",    // JSX 태그 자동 리네임
    "christian-kohler.path-intellisense" // 경로 자동완성
  ]
}
```

### ESLint + Prettier 설정

```bash
# 코드 스타일 검사
npm run lint

# 자동 포맷
npm run format
```

---

## 8. 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview
```

빌드 결과물은 `dist/` 폴더에 생성됩니다.

```bash
# Docker 이미지 빌드
docker build -t dashboard-frontend:latest .

# 프로덕션 Docker Compose 실행
docker compose -f docker-compose.prod.yml up -d
```

---

## 9. Claude Code 설정

이 프로젝트는 Claude Code와 함께 사용하도록 설계되었습니다.

### 전제 조건

- Claude Code 설치: https://claude.ai/claude-code
- MCP 서버 설정 (선택사항): Playwright, Notion 등

### 에이전트 활용

- `sprint-planner`: 스프린트 계획 수립
- `sprint-close`: 스프린트 마무리 (PR, 코드 리뷰, 검증)
- `hotfix-close`: 핫픽스 마무리
- `deploy-prod`: 프로덕션 배포
- `prd-to-roadmap`: PRD → ROADMAP.md 변환

자세한 내용은 `README.md` 참조.

---

## 10. 트러블슈팅

### CORS 오류 (개발 서버)

```
Access to XMLHttpRequest at 'https://gitlab.ubware.com' has been blocked by CORS policy
```

→ Vite 프록시가 설정되어 있는지 확인 (`vite.config.ts`의 `server.proxy` 섹션)
→ API 호출 URL이 `/gitlab-api/...` 형태로 되어 있는지 확인

### 401 Unauthorized

→ GitLab/Redmine 토큰이 만료되었거나 권한이 부족한 경우
→ 설정 화면에서 토큰을 갱신하고 연결 테스트 수행

### 챗봇 응답 없음

→ Anthropic API Key가 올바른지 확인
→ API 사용량 한도 초과 여부 확인 (console.anthropic.com)
→ 브라우저 개발자 도구 네트워크 탭에서 응답 코드 확인
