import axios from 'axios'
import Anthropic from '@anthropic-ai/sdk'

export async function testGitlabConnection(
  url: string,
  token: string
): Promise<{ success: boolean; username?: string; error?: string }> {
  try {
    const response = await axios.get(`${url}/api/v4/user`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000,
    })
    return { success: true, username: response.data.username }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return { success: false, error: 'GitLab 토큰이 유효하지 않습니다.' }
      }
      return { success: false, error: 'GitLab 서버에 연결할 수 없습니다.' }
    }
    return { success: false, error: '알 수 없는 오류가 발생했습니다.' }
  }
}

export async function testAnthropicConnection(
  apiKey: string
): Promise<{ success: boolean; model?: string; error?: string }> {
  try {
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
    const list = await client.models.list({ limit: 1 })
    const firstModel = list.data[0]?.id ?? 'claude'
    return { success: true, model: firstModel }
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return { success: false, error: 'Anthropic API 키가 유효하지 않습니다.' }
    }
    if (error instanceof Anthropic.RateLimitError) {
      return { success: false, error: 'API 요청 한도를 초과했습니다. 잠시 후 재시도하세요.' }
    }
    return { success: false, error: 'Anthropic 서버에 연결할 수 없습니다.' }
  }
}

export async function testRedmineConnection(
  _url: string,
  apiKey: string
): Promise<{ success: boolean; username?: string; error?: string }> {
  try {
    // Vite 프록시(/redmine-api)를 통해 CORS 없이 요청 (url은 vite.config.ts에서 proxy 타겟으로 설정됨)
    const response = await axios.get('/redmine-api/users/current.json', {
      headers: { 'X-Redmine-API-Key': apiKey },
      timeout: 5000,
    })
    return { success: true, username: response.data.user.login }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return { success: false, error: 'Redmine API 키가 유효하지 않습니다.' }
      }
      return { success: false, error: 'Redmine 서버에 연결할 수 없습니다.' }
    }
    return { success: false, error: '알 수 없는 오류가 발생했습니다.' }
  }
}
