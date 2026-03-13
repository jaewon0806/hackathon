# Sprint 4 완료 보고서 — AI 챗봇 + 대시보드 홈

> **브랜치**: `sprint4`
> **목표**: Anthropic Claude API 연동 챗봇 + 대시보드 홈 요약 카드
> **상태**: ✅ 완료
> **완료일**: 2026-03-13
> **PR**: sprint4 → develop

---

## 구현 요약

### API 레이어

| 파일 | 설명 |
|------|------|
| `src/api/claudeClient.ts` | Anthropic SDK 스트리밍 클라이언트. `dangerouslyAllowBrowser: true`. `buildSystemPrompt()`로 현재 로드된 Redmine 이슈/GitLab 커밋 데이터를 시스템 프롬프트에 자동 주입. `AuthenticationError`, `RateLimitError` 구분 처리. |

### 상태 관리

| 파일 | 설명 |
|------|------|
| `src/store/chatbotStore.ts` | Zustand persist 미들웨어로 localStorage 저장. 최대 50건 히스토리 제한 (`addMessage`, `partialize` 양쪽 방어). `isStreaming` 상태로 중복 전송 방지. |
| `src/types/chatbot.types.ts` | `ChatMessage` (id, role, content, timestamp), `ChatbotState` 타입 정의. |

### 챗봇 컴포넌트

| 파일 | 설명 |
|------|------|
| `src/components/chatbot/ChatbotPanel.tsx` | 우하단 고정 플로팅 패널. 펼치기/접기 토글. 현재 로드된 Redmine/GitLab 데이터를 React Query 캐시에서 읽어 `streamChatMessage`에 전달. Enter 전송, Shift+Enter 줄바꿈. API 키 미설정 시 경고 배너 + 입력창 비활성화. |
| `src/components/chatbot/ChatMessage.tsx` | 사용자/AI 메시지 버블. `dangerouslySetInnerHTML` 미사용, 순수 React 엘리먼트로 인라인 마크다운 렌더링 (bold `**text**`, code `` `code` ``, 줄바꿈 `\n` → `<br/>`). |
| `src/components/chatbot/SuggestedQuestions.tsx` | 자주 쓰는 질문 칩 4개 (담당 일감/마감 임박/커밋 요약/진행 중 목록). 메시지가 없을 때만 표시. |

### 대시보드 홈

| 파일 | 설명 |
|------|------|
| `src/pages/DashboardPage.tsx` | 요약 카드 4종 (담당 일감: 미완료 이슈 수 / 이번 주 커밋: 선택된 기간 커밋 수 / 진행 중: IN_PROGRESS 이슈 수 / 기한 초과: due_date 경과 + 미완료 이슈 수). 최근 활동 피드: GitLab 커밋 + Redmine 이슈를 `updated_on`/`authored_date` 기준으로 혼합 정렬, 상위 15건 표시. `useMemo`로 성능 최적화. API 미설정 시 설정 페이지 링크 안내. |

### 전역 마운트

| 파일 | 설명 |
|------|------|
| `src/App.tsx` | `<AppLayout>` 최하단에 `<ChatbotPanel />`을 마운트하여 모든 페이지에서 챗봇 사용 가능. 기존 lazy import + Suspense + ErrorBoundary 구조 유지. |

---

## 완료 기준 검증

| 항목 | 상태 | 비고 |
|------|------|------|
| 챗봇 패널 펼침 → 질문 입력 → Claude 스트리밍 응답 표시 | ✅ 구현 완료 | 수동 검증 필요 |
| 현재 로드된 Redmine 일감 데이터 기반 챗봇 답변 | ✅ 구현 완료 | 시스템 프롬프트 자동 주입 |
| 대시보드 홈 요약 카드 정상 표시 | ✅ 구현 완료 | 수동 검증 필요 |
| `npm run lint` | ✅ 통과 | |
| `npm run typecheck` | ✅ 통과 | |
| `npm run build` | ✅ 통과 | |

---

## 코드 리뷰 결과

**Critical/High 이슈**: 없음

**Medium 이슈**

| 위치 | 내용 | 권고 |
|------|------|------|
| `src/api/claudeClient.ts` | `dangerouslyAllowBrowser: true` — API 키가 브라우저 네트워크 탭에서 노출됨 | Sprint 5에서 백엔드 프록시 경유 방식 재검토 |
| `src/store/chatbotStore.ts` | `addMessage`와 `partialize` 양쪽에서 50건 제한 중복 적용 | 안전한 방어 코드로 유지. Sprint 5에서 통일 가능 |

---

## 검증 결과

**자동 검증**

- ⬜ Docker 미실행으로 자동 검증 미수행 (pytest, API curl, Playwright)

**수동 검증 필요** — `docs/deploy.md` 참조

- ⬜ `docker compose up --build` 로컬 스테이징 빌드 성공 확인
- ⬜ Anthropic API 키 설정 후 챗봇 패널 → 스트리밍 응답 확인
- ⬜ 대화 이력 localStorage 복원 확인
- ⬜ 대시보드 홈 요약 카드 4종 정상 표시 확인
- ⬜ 최근 활동 피드 혼합 정렬 확인
- ⬜ UI 디자인 / 시각적 품질 판단

---

## 주의사항 및 다음 스프린트 인계

- **Anthropic API 브라우저 직접 호출**: 현재 `dangerouslyAllowBrowser: true` 방식. Sprint 5 배포 전 백엔드 프록시 방식으로 전환 검토 필요.
- **DONE_STATUSES 중복**: `DashboardPage.tsx`, `DueSoonBanner.tsx`, `VersionProgressBar.tsx`에 동일 상수가 분산 정의됨. Sprint 5에서 `src/constants/redmine.ts`로 통합 권장.
- **Redmine URL href XSS**: `IssueTreeNode`의 `redmineUrl` href에 `javascript:` 프로토콜 필터링 없음. Sprint 5에서 URL 유효성 검사 추가 권장.
