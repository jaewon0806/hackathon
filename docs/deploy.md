# 배포 후 수동 작업 가이드

> **목적**: 현재 완료되지 않은 수동 검증/작업 항목만 유지합니다.
> 완료된 기록은 `docs/deploy-history/YYYY-MM-DD.md`로 이동됩니다.

---

## 현재 미완료 항목

### Sprint 4 — AI 챗봇 + 대시보드 홈 (2026-03-13)

**자동 검증**

- ⬜ Docker 미실행으로 자동 검증 미수행 (pytest, API curl, Playwright)

**수동 검증 필요**

- ⬜ `docker compose up --build` 로컬 스테이징 빌드 성공 확인
- ⬜ Anthropic API 키 설정 후 챗봇 패널 열기 → 질문 입력 → 스트리밍 응답 표시 확인
- ⬜ 대화 이력 새로고침 후 localStorage 복원 확인 (최대 50건)
- ⬜ 대화 초기화 버튼 동작 확인
- ⬜ API 키 미설정 시 경고 안내 및 입력창 비활성화 확인
- ⬜ SuggestedQuestions 칩 클릭 시 자동 질문 전송 확인
- ⬜ 대시보드 홈 요약 카드 4종 (담당 일감/이번 주 커밋/진행 중/기한 초과) 정상 표시 확인
- ⬜ 최근 활동 피드 (GitLab 커밋 + Redmine 이슈 혼합) 시간순 정렬 확인
- ⬜ 로딩 스켈레톤 표시 확인
- ⬜ API 미설정 시 설정 페이지 링크 안내 확인
- ⬜ UI 디자인 / 시각적 품질 판단

---

## 참고

- 검증 원칙: `docs/dev-process.md` 섹션 5
- 배포 이력: `docs/deploy-history/`
- 롤백 방법: `docs/dev-process.md` 섹션 6.4
