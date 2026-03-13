export interface GitlabProject {
  id: number
  name: string
  name_with_namespace: string
  path_with_namespace: string
  web_url: string
  default_branch: string
}

export interface GitlabBranch {
  name: string
  commit: {
    id: string
    short_id: string
    committed_date: string
  }
}

export interface GitlabCommit {
  id: string
  short_id: string
  title: string
  message: string
  author_name: string
  author_email: string
  authored_date: string
  committed_date: string
  committer_name: string
  committer_email: string
  web_url: string
  stats?: {
    additions: number
    deletions: number
    total: number
  }
}

export interface GitlabUser {
  id: number
  username: string
  name: string
  email: string
  avatar_url: string
}

export interface CommitFilters {
  author?: string
  since?: string
  until?: string
  search?: string
  page?: number
  per_page?: number
}
