import axios from 'axios'

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

export async function testRedmineConnection(
  url: string,
  apiKey: string
): Promise<{ success: boolean; username?: string; error?: string }> {
  try {
    const response = await axios.get(`${url}/users/current.json`, {
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
