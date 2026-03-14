import type { GitlabProject, GitlabBranch, GitlabCommit } from '@/types/gitlab.types'
import type { RedmineProject, RedmineVersion, RedmineIssue } from '@/types/redmine.types'

// ──────────────────────────────────────────
// GitLab Mock 데이터
// ──────────────────────────────────────────

export const MOCK_GITLAB_PROJECTS: GitlabProject[] = [
  { id: 1, name: 'frontend', name_with_namespace: 'Demo Team / frontend', path_with_namespace: 'demo/frontend', web_url: '#', default_branch: 'main' },
  { id: 2, name: 'backend-api', name_with_namespace: 'Demo Team / backend-api', path_with_namespace: 'demo/backend-api', web_url: '#', default_branch: 'main' },
  { id: 3, name: 'mobile-app', name_with_namespace: 'Demo Team / mobile-app', path_with_namespace: 'demo/mobile-app', web_url: '#', default_branch: 'develop' },
]

export const MOCK_GITLAB_BRANCHES: GitlabBranch[] = [
  { name: 'main', commit: { id: 'abc001', short_id: 'abc001', committed_date: '2026-03-15T09:00:00Z' } },
  { name: 'develop', commit: { id: 'def002', short_id: 'def002', committed_date: '2026-03-14T18:00:00Z' } },
  { name: 'feature/user-auth', commit: { id: 'ghi003', short_id: 'ghi003', committed_date: '2026-03-13T11:00:00Z' } },
]

const now = new Date('2026-03-15T12:00:00Z')
function daysAgo(d: number) {
  const t = new Date(now)
  t.setDate(t.getDate() - d)
  return t.toISOString()
}

export const MOCK_GITLAB_COMMITS: GitlabCommit[] = [
  { id: 'a1b2c3d4e5', short_id: 'a1b2c3d', title: 'feat: 사용자 인증 모듈 추가 (JWT 기반)', message: '', author_name: '홍길동', author_email: 'hong@example.com', authored_date: daysAgo(0), committed_date: daysAgo(0), committer_name: '홍길동', committer_email: 'hong@example.com', web_url: '#' },
  { id: 'b2c3d4e5f6', short_id: 'b2c3d4e', title: 'fix: 로그인 실패 시 에러 메시지 표시 오류 수정', message: '', author_name: '김철수', author_email: 'kim@example.com', authored_date: daysAgo(0), committed_date: daysAgo(0), committer_name: '김철수', committer_email: 'kim@example.com', web_url: '#' },
  { id: 'c3d4e5f6g7', short_id: 'c3d4e5f', title: 'feat: 대시보드 요약 카드 컴포넌트 구현', message: '', author_name: '이영희', author_email: 'lee@example.com', authored_date: daysAgo(1), committed_date: daysAgo(1), committer_name: '이영희', committer_email: 'lee@example.com', web_url: '#' },
  { id: 'd4e5f6g7h8', short_id: 'd4e5f6g', title: 'refactor: API 클라이언트 에러 핸들링 통일', message: '', author_name: '홍길동', author_email: 'hong@example.com', authored_date: daysAgo(1), committed_date: daysAgo(1), committer_name: '홍길동', committer_email: 'hong@example.com', web_url: '#' },
  { id: 'e5f6g7h8i9', short_id: 'e5f6g7h', title: 'docs: API 명세서 업데이트', message: '', author_name: '박민준', author_email: 'park@example.com', authored_date: daysAgo(2), committed_date: daysAgo(2), committer_name: '박민준', committer_email: 'park@example.com', web_url: '#' },
  { id: 'f6g7h8i9j0', short_id: 'f6g7h8i', title: 'feat: Redmine 일감 트리 뷰 구현', message: '', author_name: '이영희', author_email: 'lee@example.com', authored_date: daysAgo(2), committed_date: daysAgo(2), committer_name: '이영희', committer_email: 'lee@example.com', web_url: '#' },
  { id: 'g7h8i9j0k1', short_id: 'g7h8i9j', title: 'fix: 모바일 화면 반응형 레이아웃 개선', message: '', author_name: '김철수', author_email: 'kim@example.com', authored_date: daysAgo(3), committed_date: daysAgo(3), committer_name: '김철수', committer_email: 'kim@example.com', web_url: '#' },
  { id: 'h8i9j0k1l2', short_id: 'h8i9j0k', title: 'chore: 패키지 의존성 업데이트', message: '', author_name: '홍길동', author_email: 'hong@example.com', authored_date: daysAgo(4), committed_date: daysAgo(4), committer_name: '홍길동', committer_email: 'hong@example.com', web_url: '#' },
  { id: 'i9j0k1l2m3', short_id: 'i9j0k1l', title: 'feat: 챗봇 스트리밍 응답 구현', message: '', author_name: '박민준', author_email: 'park@example.com', authored_date: daysAgo(5), committed_date: daysAgo(5), committer_name: '박민준', committer_email: 'park@example.com', web_url: '#' },
  { id: 'j0k1l2m3n4', short_id: 'j0k1l2m', title: 'test: 이슈 트리 빌더 단위 테스트 추가', message: '', author_name: '이영희', author_email: 'lee@example.com', authored_date: daysAgo(6), committed_date: daysAgo(6), committer_name: '이영희', committer_email: 'lee@example.com', web_url: '#' },
]

// ──────────────────────────────────────────
// Redmine Mock 데이터
// ──────────────────────────────────────────

export const MOCK_REDMINE_PROJECTS: RedmineProject[] = [
  { id: 1, name: '업무 대시보드', identifier: 'dashboard', description: '팀 업무 현황 통합 대시보드 개발 프로젝트' },
  { id: 2, name: '모바일 앱', identifier: 'mobile-app', description: 'iOS/Android 모바일 앱 개발' },
]

export const MOCK_REDMINE_VERSIONS: RedmineVersion[] = [
  { id: 1, name: 'v1.0 (3월 릴리즈)', status: 'open', due_date: '2026-03-31' },
  { id: 2, name: 'v1.1 (4월 릴리즈)', status: 'open', due_date: '2026-04-30' },
]

export const MOCK_REDMINE_ISSUES: RedmineIssue[] = [
  // 에픽 1: 사용자 인증
  { id: 101, project: { id: 1, name: '업무 대시보드' }, tracker: { id: 1, name: '에픽' }, status: { id: 2, name: '진행 중' }, priority: { id: 2, name: '높음' }, author: { id: 1, name: '홍길동' }, assigned_to: { id: 1, name: '홍길동' }, subject: '[에픽] 사용자 인증 시스템 구현', done_ratio: 60, created_on: daysAgo(14), updated_on: daysAgo(1), due_date: '2026-03-20', fixed_version: { id: 1, name: 'v1.0' } },
  { id: 102, project: { id: 1, name: '업무 대시보드' }, tracker: { id: 2, name: '스토리' }, status: { id: 2, name: '진행 중' }, priority: { id: 2, name: '높음' }, author: { id: 1, name: '홍길동' }, assigned_to: { id: 2, name: '김철수' }, parent: { id: 101 }, subject: 'JWT 기반 로그인 API 구현', done_ratio: 80, created_on: daysAgo(10), updated_on: daysAgo(0), due_date: '2026-03-17', fixed_version: { id: 1, name: 'v1.0' } },
  { id: 103, project: { id: 1, name: '업무 대시보드' }, tracker: { id: 3, name: '태스크' }, status: { id: 1, name: '신규' }, priority: { id: 2, name: '높음' }, author: { id: 1, name: '홍길동' }, assigned_to: { id: 3, name: '이영희' }, parent: { id: 101 }, subject: '로그인 UI 컴포넌트 개발', done_ratio: 30, created_on: daysAgo(8), updated_on: daysAgo(2), due_date: '2026-03-19', fixed_version: { id: 1, name: 'v1.0' } },
  { id: 104, project: { id: 1, name: '업무 대시보드' }, tracker: { id: 3, name: '태스크' }, status: { id: 5, name: '완료' }, priority: { id: 3, name: '보통' }, author: { id: 1, name: '홍길동' }, assigned_to: { id: 2, name: '김철수' }, parent: { id: 101 }, subject: '비밀번호 암호화 유틸리티 구현', done_ratio: 100, created_on: daysAgo(12), updated_on: daysAgo(5), fixed_version: { id: 1, name: 'v1.0' } },

  // 에픽 2: 대시보드 홈
  { id: 201, project: { id: 1, name: '업무 대시보드' }, tracker: { id: 1, name: '에픽' }, status: { id: 2, name: '진행 중' }, priority: { id: 3, name: '보통' }, author: { id: 2, name: '김철수' }, assigned_to: { id: 3, name: '이영희' }, subject: '[에픽] 대시보드 홈 화면 개발', done_ratio: 40, created_on: daysAgo(10), updated_on: daysAgo(1), due_date: '2026-03-25', fixed_version: { id: 1, name: 'v1.0' } },
  { id: 202, project: { id: 1, name: '업무 대시보드' }, tracker: { id: 2, name: '스토리' }, status: { id: 2, name: '진행 중' }, priority: { id: 3, name: '보통' }, author: { id: 2, name: '김철수' }, assigned_to: { id: 3, name: '이영희' }, parent: { id: 201 }, subject: '요약 카드 UI 구현 (담당일감/커밋/진행중/기한초과)', done_ratio: 70, created_on: daysAgo(7), updated_on: daysAgo(0), fixed_version: { id: 1, name: 'v1.0' } },
  { id: 203, project: { id: 1, name: '업무 대시보드' }, tracker: { id: 3, name: '태스크' }, status: { id: 1, name: '신규' }, priority: { id: 3, name: '보통' }, author: { id: 2, name: '김철수' }, assigned_to: { id: 4, name: '박민준' }, parent: { id: 201 }, subject: '최근 활동 피드 구현 (GitLab + Redmine 혼합)', done_ratio: 0, created_on: daysAgo(5), updated_on: daysAgo(3), due_date: '2026-03-28', fixed_version: { id: 1, name: 'v1.0' } },

  // 기한 초과 이슈
  { id: 301, project: { id: 1, name: '업무 대시보드' }, tracker: { id: 3, name: '태스크' }, status: { id: 2, name: '진행 중' }, priority: { id: 1, name: '긴급' }, author: { id: 3, name: '이영희' }, assigned_to: { id: 1, name: '홍길동' }, subject: '[긴급] 프로덕션 로그인 버그 수정', done_ratio: 10, created_on: daysAgo(5), updated_on: daysAgo(1), due_date: '2026-03-10', fixed_version: { id: 1, name: 'v1.0' } },
  { id: 302, project: { id: 1, name: '업무 대시보드' }, tracker: { id: 3, name: '태스크' }, status: { id: 1, name: '신규' }, priority: { id: 2, name: '높음' }, author: { id: 4, name: '박민준' }, assigned_to: { id: 2, name: '김철수' }, subject: '성능 모니터링 도구 설정', done_ratio: 0, created_on: daysAgo(20), updated_on: daysAgo(7), due_date: '2026-03-05', fixed_version: { id: 2, name: 'v1.1' } },
]
