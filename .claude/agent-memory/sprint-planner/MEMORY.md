# Sprint Planner 메모리

이 파일은 sprint-planner 에이전트의 영구 메모리입니다.
프로젝트 진행 상황, 기술 스택, 패턴 등을 기록합니다.

---

## 스프린트 현황

| 스프린트 | 목표 | 상태 | 완료일 |
|---------|------|------|------|
| Sprint 1 | 프로젝트 기반 구축 (React + Vite + 레이아웃 + 설정 페이지) | ✅ 완료 | 2026-03-13 |
| Sprint 2 | GitLab 커밋 이력 | ✅ 완료 | 2026-03-13 |
| Sprint 3 | Redmine 일감 트리 | ⬜ 미시작 | — |
| Sprint 4 | AI 챗봇 + 대시보드 홈 | ⬜ 미시작 | — |
| Sprint 5 | UI 다듬기 + 배포 | ⬜ 미시작 | — |

**다음 사용 가능한 스프린트 번호**: Sprint 3

---

## 기술 스택 (Sprint 1 확정)

- **프레임워크**: React 18 + TypeScript + Vite
- **스타일**: Tailwind CSS v4 (shadcn/ui 미사용, 커스텀 컴포넌트)
- **라우팅**: React Router v7
- **상태관리**: Zustand v5 (persist 미들웨어)
- **서버 상태**: React Query v5
- **HTTP**: Axios
- **인프라**: Docker 멀티스테이지 빌드 + Nginx 리버스 프록시

---

## 핵심 주의사항

- **Tailwind CSS v4**: shadcn/ui와 호환성 문제로 커스텀 컴포넌트 방식 채택. Sprint 2 이후에도 동일 패턴 유지.
- **API 프록시 경로**: `/gitlab-api/` → GitLab API v4, `/redmine-api/` → Redmine API. Vite 개발 서버에도 동일 프록시 경로 설정 필요.
- **Anthropic API Key**: 현재 `VITE_ANTHROPIC_API_KEY` 환경변수로 관리. Sprint 4 구현 시 브라우저 번들 노출 여부 재검토 필요.
- **nginx.conf**: `proxy_ssl_verify off` 설정 — Sprint 5 프로덕션 배포 시 인증서 검증 활성화 검토.
- **GitLab web_url XSS**: `CommitItem.tsx`에서 `web_url`을 anchor href에 직접 사용. Sprint 5에서 URL 검증 유틸 추가 권장.
- **useInfiniteQuery 패턴**: `getNextPageParam`에서 lastPage.length === per_page 조건으로 다음 페이지 유무 판단. per_page 값 변경 시 조건도 함께 변경 필요.
