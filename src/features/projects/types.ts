export interface SectionConfig {
  id: string
  name: string
  repeatRows: number | null // how many rows before section resets
  currentRow: number
  repeatCount: number // how many times section reset completed
  linked?: boolean
}

export interface Project {
  id: string
  name: string
  totalRows: number | null // null if unknown
  currentRow: number
  sections: SectionConfig[]
  notes: string
  patternUrl?: string
  lastModified: number
}

export interface ProjectsState {
  projects: Project[]
  currentProjectId: string | null
}
