export interface ProgressRecord {
  id: string
  projectId: string
  sectionId: string
  timestamp: number
  rowsDelta: number
  stitchesDelta: number
}

export interface ProgressState {
  records: ProgressRecord[]
}
