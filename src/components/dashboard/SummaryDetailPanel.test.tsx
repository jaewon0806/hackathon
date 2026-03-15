import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SummaryDetailPanel } from './SummaryDetailPanel'
import type { RedmineIssue } from '@/types/redmine.types'
import type { GitlabCommit } from '@/types/gitlab.types'

const baseProps = {
  issues: [] as RedmineIssue[],
  commits: [] as GitlabCommit[],
  redmineUrl: 'https://redmine.example.com',
  gitlabUrl: 'https://gitlab.example.com',
  onClose: vi.fn(),
}

const mockIssue = (overrides: Partial<RedmineIssue> = {}): RedmineIssue => ({
  id: 1,
  subject: '테스트 일감',
  status: { id: 1, name: '진행 중' },
  priority: { id: 2, name: '보통' },
  assigned_to: { id: 1, name: '홍길동' },
  done_ratio: 0,
  created_on: '2026-03-01T00:00:00Z',
  updated_on: '2026-03-10T00:00:00Z',
  ...overrides,
})

const mockCommit = (overrides: Partial<GitlabCommit> = {}): GitlabCommit => ({
  id: 'abc1234567890',
  short_id: 'abc1234',
  title: 'feat: 테스트 커밋',
  author_name: '홍길동',
  authored_date: '2026-03-10T10:00:00Z',
  message: 'feat: 테스트 커밋',
  web_url: '#',
  ...overrides,
})

describe('SummaryDetailPanel', () => {
  it('패널 헤더에 카드 타입 레이블이 표시된다', () => {
    render(<SummaryDetailPanel {...baseProps} type="issues" />)
    expect(screen.getByText('담당 일감')).toBeInTheDocument()
  })

  it('type=commits일 때 커밋이 없으면 빈 상태 메시지를 표시한다', () => {
    render(<SummaryDetailPanel {...baseProps} type="commits" />)
    expect(screen.getByText('커밋이 없습니다.')).toBeInTheDocument()
  })

  it('type=issues일 때 일감이 없으면 빈 상태 메시지를 표시한다', () => {
    render(<SummaryDetailPanel {...baseProps} type="issues" />)
    expect(screen.getByText('해당 일감이 없습니다.')).toBeInTheDocument()
  })

  it('커밋 목록이 렌더링된다', () => {
    const commits = [mockCommit({ title: '로그인 기능 추가' })]
    render(<SummaryDetailPanel {...baseProps} type="commits" commits={commits} />)
    expect(screen.getByText('로그인 기능 추가')).toBeInTheDocument()
    expect(screen.getByText('홍길동')).toBeInTheDocument()
  })

  it('진행 중 이슈 목록이 렌더링된다', () => {
    const issues = [mockIssue({ subject: '버그 수정', status: { id: 2, name: '진행 중' } })]
    render(<SummaryDetailPanel {...baseProps} type="inProgress" issues={issues} />)
    expect(screen.getByText('버그 수정')).toBeInTheDocument()
  })

  it('완료 상태 일감은 담당 일감 목록에서 제외된다', () => {
    const issues = [
      mockIssue({ subject: '진행중 일감', status: { id: 2, name: '진행 중' } }),
      mockIssue({ id: 2, subject: '완료된 일감', status: { id: 5, name: '완료' } }),
    ]
    render(<SummaryDetailPanel {...baseProps} type="issues" issues={issues} />)
    expect(screen.getByText('진행중 일감')).toBeInTheDocument()
    expect(screen.queryByText('완료된 일감')).not.toBeInTheDocument()
  })

  it('기한 초과 일감이 overdue 패널에 표시된다', () => {
    const issues = [
      mockIssue({
        subject: '기한초과된_일감',
        status: { id: 2, name: '진행 중' },
        due_date: '2020-01-01',
      }),
    ]
    render(<SummaryDetailPanel {...baseProps} type="overdue" issues={issues} />)
    expect(screen.getByText('기한초과된_일감')).toBeInTheDocument()
  })

  it('X 버튼 클릭 시 onClose가 호출된다', async () => {
    const onClose = vi.fn()
    render(<SummaryDetailPanel {...baseProps} type="issues" onClose={onClose} />)
    const closeBtn = screen.getAllByRole('button').find((b) => b.querySelector('svg'))
    await userEvent.click(closeBtn!)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('오버레이 클릭 시 onClose가 호출된다', async () => {
    const onClose = vi.fn()
    const { container } = render(<SummaryDetailPanel {...baseProps} type="issues" onClose={onClose} />)
    const overlay = container.querySelector('.fixed.inset-0') as HTMLElement
    await userEvent.click(overlay)
    expect(onClose).toHaveBeenCalled()
  })

  it('건수가 헤더에 표시된다', () => {
    const commits = [mockCommit(), mockCommit({ id: 'xyz', short_id: 'xyz1234' })]
    render(<SummaryDetailPanel {...baseProps} type="commits" commits={commits} />)
    expect(screen.getByText('2건')).toBeInTheDocument()
  })
})
