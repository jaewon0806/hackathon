export interface RedmineProject {
  id: number
  name: string
  identifier: string
  description: string
}

export interface RedmineVersion {
  id: number
  name: string
  status: string
  due_date?: string
  description?: string
}

export interface RedmineUser {
  id: number
  name: string
  login?: string
}

export interface RedmineIssue {
  id: number
  project: { id: number; name: string }
  tracker: { id: number; name: string }
  status: { id: number; name: string }
  priority: { id: number; name: string }
  author: RedmineUser
  assigned_to?: RedmineUser
  parent?: { id: number }
  subject: string
  description?: string
  start_date?: string
  due_date?: string
  done_ratio: number
  fixed_version?: { id: number; name: string }
  created_on: string
  updated_on: string
}

export interface IssueNode extends RedmineIssue {
  children: IssueNode[]
}

export interface IssueFilters {
  assigneeIds?: number[]
  statusIds?: string[]
  priorities?: string[]
  keyword?: string
}
