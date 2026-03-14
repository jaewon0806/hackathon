# ---- Stage 1: 빌드 ----
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 캐시 최적화 (package.json 변경 시만 재설치)
COPY package.json package-lock.json ./
RUN npm ci

# 소스 복사 + 프로덕션 빌드
COPY . .

# VITE_* 빌드 인수: deploy.yml에서 --build-arg로 주입
ARG VITE_GITLAB_URL
ARG VITE_REDMINE_URL
ARG VITE_CLAUDE_MODEL=claude-haiku-4-5

ENV VITE_GITLAB_URL=$VITE_GITLAB_URL
ENV VITE_REDMINE_URL=$VITE_REDMINE_URL
ENV VITE_CLAUDE_MODEL=$VITE_CLAUDE_MODEL

RUN npm run build

# ---- Stage 2: Nginx 서빙 ----
FROM nginx:1.27-alpine

# Nginx 템플릿 디렉토리에 nginx.conf.template 복사
# 컨테이너 시작 시 envsubst로 ${VITE_GITLAB_URL}, ${VITE_REDMINE_URL} 치환됨
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Vite 빌드 결과물 복사
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
