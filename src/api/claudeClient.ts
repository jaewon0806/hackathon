import Anthropic from '@anthropic-ai/sdk'
import { useSettingsStore } from '@/store/settingsStore'
import type { RedmineIssue } from '@/types/redmine.types'
import type { GitlabCommit } from '@/types/gitlab.types'

function getClient(): Anthropic {
  const apiKey = useSettingsStore.getState().anthropic.apiKey
  return new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  })
}

function buildSystemPrompt(issues: RedmineIssue[], commits: GitlabCommit[]): string {
  const today = new Date().toLocaleDateString('ko-KR')

  const issuesSummary = issues
    .slice(0, 50)
    .map(
      (i) =>
        `- #${i.id} [${i.status.name}] ${i.subject} (담당: ${i.assigned_to?.name ?? '없음'}, 마감: ${i.due_date ?? '없음'})`
    )
    .join('\n')

  const commitsSummary = commits
    .slice(0, 30)
    .map((c) => `- ${c.short_id} ${c.title} by ${c.author_name} (${c.authored_date.slice(0, 10)})`)
    .join('\n')

  return `오늘 날짜: ${today}
당신은 개발팀의 업무 어시스턴트입니다. 아래 업무 데이터를 참고하여 한국어로 간결하게 답변하세요.

## Redmine 일감 목록 (${issues.length}건)
${issuesSummary || '(데이터 없음)'}

## GitLab 최근 커밋 (${commits.length}건)
${commitsSummary || '(데이터 없음)'}

사용자 질문에 위 데이터만 기반하여 답변하세요. 데이터에 없는 내용은 "현재 로드된 데이터에 없습니다"라고 답변하세요.`.trim()
}

export interface StreamCallbacks {
  onToken: (token: string) => void
  onDone: () => void
  onError: (error: Error) => void
}

// ──────────────────────────────────────────
// AI 스탠드업 리포트 생성
// ──────────────────────────────────────────

export async function generateStandupReport(
  issues: RedmineIssue[],
  commits: GitlabCommit[],
  callbacks: StreamCallbacks
): Promise<void> {
  const client = getClient()
  const { model } = useSettingsStore.getState().anthropic

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const todayStr = today.toLocaleDateString('ko-KR')
  const yesterdayStr = yesterday.toLocaleDateString('ko-KR')

  // 어제 커밋 (24시간 이내)
  const recentCommits = commits.filter((c) => {
    const d = new Date(c.authored_date)
    return today.getTime() - d.getTime() < 48 * 60 * 60 * 1000
  })

  // 진행 중 / 신규 이슈
  const activeIssues = issues.filter((i) => ['진행 중', '신규'].includes(i.status.name))

  // 기한 초과 이슈
  const overdueIssues = issues.filter((i) => {
    if (!i.due_date || ['해결됨', '완료', '반려'].includes(i.status.name)) return false
    return new Date(i.due_date) < today
  })

  const commitLines = recentCommits
    .slice(0, 20)
    .map((c) => `- ${c.short_id} ${c.title} (${c.author_name})`)
    .join('\n') || '(최근 커밋 없음)'

  const issueLines = activeIssues
    .slice(0, 20)
    .map((i) => `- #${i.id} [${i.status.name}] ${i.subject} (${i.done_ratio}% 완료, 마감: ${i.due_date ?? '없음'})`)
    .join('\n') || '(진행 중 일감 없음)'

  const overdueLines = overdueIssues
    .slice(0, 10)
    .map((i) => `- #${i.id} ${i.subject} (마감: ${i.due_date}, 담당: ${i.assigned_to?.name ?? '없음'})`)
    .join('\n') || '(기한 초과 없음)'

  const prompt = `오늘(${todayStr}) 팀 데일리 스탠드업 리포트를 아래 형식으로 작성해주세요.

## 데이터
### 최근 커밋 (어제~오늘, ${recentCommits.length}건)
${commitLines}

### 진행 중/신규 일감 (${activeIssues.length}건)
${issueLines}

### 기한 초과 일감 (${overdueIssues.length}건)
${overdueLines}

## 출력 형식 (마크다운, 이모지 사용)
### 📋 어제 한 일 (${yesterdayStr})
[최근 커밋을 기반으로 2~4줄 요약]

### 🎯 오늘 할 일
[진행 중/신규 일감 중 우선순위 높은 것 2~4줄]

### 🚨 블로킹 / 리스크
[기한 초과 이슈 또는 리스크 요약, 없으면 "없음"]

### 💬 공유 사항
[팀에 공유할 내용 한 줄 (데이터 기반, 없으면 생략)]

간결하고 실용적으로 작성하세요. 데이터가 부족하면 "데이터 없음"으로 표기하세요.`

  try {
    const stream = client.messages.stream({
      model,
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    })

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        callbacks.onToken(event.delta.text)
      }
    }

    callbacks.onDone()
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      callbacks.onError(new Error('Anthropic API 키가 유효하지 않습니다.'))
    } else if (error instanceof Anthropic.RateLimitError) {
      callbacks.onError(new Error('API 요청 한도를 초과했습니다. 잠시 후 재시도하세요.'))
    } else {
      callbacks.onError(new Error('AI 응답 중 오류가 발생했습니다.'))
    }
  }
}

export async function streamChatMessage(
  messages: Anthropic.MessageParam[],
  issues: RedmineIssue[],
  commits: GitlabCommit[],
  callbacks: StreamCallbacks
): Promise<void> {
  const client = getClient()
  const { model } = useSettingsStore.getState().anthropic

  const systemPrompt = buildSystemPrompt(issues, commits)

  try {
    const stream = client.messages.stream({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    })

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        callbacks.onToken(event.delta.text)
      }
    }

    callbacks.onDone()
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      callbacks.onError(new Error('Anthropic API 키가 유효하지 않습니다.'))
    } else if (error instanceof Anthropic.RateLimitError) {
      callbacks.onError(new Error('API 요청 한도를 초과했습니다. 잠시 후 재시도하세요.'))
    } else {
      callbacks.onError(new Error('AI 응답 중 오류가 발생했습니다.'))
    }
  }
}
