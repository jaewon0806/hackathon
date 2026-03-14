import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { testGitlabConnection, testRedmineConnection } from './connectionTest'

vi.mock('axios')
const mockedAxios = vi.mocked(axios, true)

beforeEach(() => {
  vi.clearAllMocks()
})

// ──────────────────────────────────────────
// testGitlabConnection
// ──────────────────────────────────────────
describe('testGitlabConnection', () => {
  it('정상 응답(200) → success: true + username 반환', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { username: 'hong' } })
    const result = await testGitlabConnection('https://gitlab.example.com', 'valid-token')
    expect(result).toEqual({ success: true, username: 'hong' })
  })

  it('401 응답 → 토큰 유효하지 않음 에러', async () => {
    const error = { isAxiosError: true, response: { status: 401 } }
    mockedAxios.isAxiosError.mockReturnValue(true)
    mockedAxios.get.mockRejectedValueOnce(error)
    const result = await testGitlabConnection('https://gitlab.example.com', 'bad-token')
    expect(result.success).toBe(false)
    expect(result.error).toBe('GitLab 토큰이 유효하지 않습니다.')
  })

  it('네트워크 오류(status 없음) → 서버 연결 불가 에러', async () => {
    const error = { isAxiosError: true, response: undefined }
    mockedAxios.isAxiosError.mockReturnValue(true)
    mockedAxios.get.mockRejectedValueOnce(error)
    const result = await testGitlabConnection('https://gitlab.example.com', 'token')
    expect(result.success).toBe(false)
    expect(result.error).toBe('GitLab 서버에 연결할 수 없습니다.')
  })

  it('비-Axios 오류 → 알 수 없는 오류', async () => {
    mockedAxios.isAxiosError.mockReturnValue(false)
    mockedAxios.get.mockRejectedValueOnce(new Error('unknown'))
    const result = await testGitlabConnection('https://gitlab.example.com', 'token')
    expect(result.success).toBe(false)
    expect(result.error).toBe('알 수 없는 오류가 발생했습니다.')
  })
})

// ──────────────────────────────────────────
// testRedmineConnection
// ──────────────────────────────────────────
describe('testRedmineConnection', () => {
  it('정상 응답(200) → success: true + username 반환', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { user: { login: 'redmine_user' } } })
    const result = await testRedmineConnection('https://redmine.example.com', 'valid-key')
    expect(result).toEqual({ success: true, username: 'redmine_user' })
  })

  it('401 응답 → API 키 유효하지 않음 에러', async () => {
    const error = { isAxiosError: true, response: { status: 401 } }
    mockedAxios.isAxiosError.mockReturnValue(true)
    mockedAxios.get.mockRejectedValueOnce(error)
    const result = await testRedmineConnection('https://redmine.example.com', 'bad-key')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Redmine API 키가 유효하지 않습니다.')
  })

  it('네트워크 오류 → 서버 연결 불가 에러', async () => {
    const error = { isAxiosError: true, response: undefined }
    mockedAxios.isAxiosError.mockReturnValue(true)
    mockedAxios.get.mockRejectedValueOnce(error)
    const result = await testRedmineConnection('https://redmine.example.com', 'key')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Redmine 서버에 연결할 수 없습니다.')
  })

  it('비-Axios 오류 → 알 수 없는 오류', async () => {
    mockedAxios.isAxiosError.mockReturnValue(false)
    mockedAxios.get.mockRejectedValueOnce(new Error('unknown'))
    const result = await testRedmineConnection('https://redmine.example.com', 'key')
    expect(result.success).toBe(false)
    expect(result.error).toBe('알 수 없는 오류가 발생했습니다.')
  })

  it('_url 파라미터는 무시되고 /redmine-api 프록시 경로 사용 검증', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { user: { login: 'user' } } })
    await testRedmineConnection('https://ignored-url.com', 'key')
    // /redmine-api/users/current.json 경로로 호출되어야 함
    expect(mockedAxios.get).toHaveBeenCalledWith(
      '/redmine-api/users/current.json',
      expect.objectContaining({ headers: { 'X-Redmine-API-Key': 'key' } })
    )
  })
})
