import axios from 'axios'
import { useSettingsStore } from '@/store/settingsStore'
import type { GitlabProject, GitlabBranch, GitlabCommit, GitlabUser, CommitFilters } from '@/types/gitlab.types'

const gitlabAxios = axios.create({
  baseURL: '/gitlab-api',
  timeout: 10000,
})

gitlabAxios.interceptors.request.use((config) => {
  const token = useSettingsStore.getState().gitlab.token
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

gitlabAxios.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status
    if (status === 401) throw new Error('GITLAB_UNAUTHORIZED')
    if (status === 403) throw new Error('GITLAB_FORBIDDEN')
    throw new Error('GITLAB_NETWORK_ERROR')
  }
)

export const gitlabClient = {
  async getProjects(): Promise<GitlabProject[]> {
    const res = await gitlabAxios.get<GitlabProject[]>('/projects', {
      params: { membership: true, per_page: 100, order_by: 'last_activity_at' },
    })
    return res.data
  },

  async getBranches(projectId: number): Promise<GitlabBranch[]> {
    const res = await gitlabAxios.get<GitlabBranch[]>(`/projects/${projectId}/repository/branches`, {
      params: { per_page: 100 },
    })
    return res.data
  },

  async getCommits(projectId: number, branch: string, filters: CommitFilters): Promise<GitlabCommit[]> {
    const res = await gitlabAxios.get<GitlabCommit[]>(`/projects/${projectId}/repository/commits`, {
      params: {
        ref_name: branch,
        since: filters.since,
        until: filters.until,
        author: filters.author,
        search: filters.search,
        per_page: filters.per_page || 50,
        page: filters.page || 1,
      },
    })
    return res.data
  },

  async getCurrentUser(): Promise<GitlabUser> {
    const res = await gitlabAxios.get<GitlabUser>('/user')
    return res.data
  },
}
