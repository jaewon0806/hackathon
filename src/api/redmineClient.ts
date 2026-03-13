import axios from 'axios'
import { useSettingsStore } from '@/store/settingsStore'
import type { RedmineProject, RedmineVersion, RedmineIssue } from '@/types/redmine.types'

const redmineAxios = axios.create({
  baseURL: '/redmine-api',
  timeout: 10000,
})

redmineAxios.interceptors.request.use((config) => {
  const apiKey = useSettingsStore.getState().redmine.apiKey
  if (apiKey) {
    config.headers['X-Redmine-API-Key'] = apiKey
  }
  return config
})

redmineAxios.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status
    if (status === 401) throw new Error('REDMINE_UNAUTHORIZED')
    if (status === 403) throw new Error('REDMINE_FORBIDDEN')
    throw new Error('REDMINE_NETWORK_ERROR')
  }
)

export const redmineClient = {
  async getProjects(): Promise<RedmineProject[]> {
    const res = await redmineAxios.get<{ projects: RedmineProject[] }>('/projects.json', {
      params: { limit: 100 },
    })
    return res.data.projects
  },

  async getVersions(projectId: number): Promise<RedmineVersion[]> {
    const res = await redmineAxios.get<{ versions: RedmineVersion[] }>(`/projects/${projectId}/versions.json`)
    return res.data.versions
  },

  async getIssues(params: {
    projectId: number
    versionId?: number | null
    offset?: number
    limit?: number
  }): Promise<{ issues: RedmineIssue[]; total_count: number }> {
    const res = await redmineAxios.get<{ issues: RedmineIssue[]; total_count: number }>('/issues.json', {
      params: {
        project_id: params.projectId,
        fixed_version_id: params.versionId || undefined,
        status_id: '*',
        limit: params.limit || 100,
        offset: params.offset || 0,
      },
    })
    return res.data
  },

  async getCurrentUser() {
    const res = await redmineAxios.get<{ user: { id: number; login: string; firstname: string; lastname: string } }>(
      '/users/current.json'
    )
    return res.data.user
  },
}
