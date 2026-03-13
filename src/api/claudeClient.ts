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
