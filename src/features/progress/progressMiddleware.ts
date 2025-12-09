import { type Middleware, isAction } from '@reduxjs/toolkit'
import { type RootState } from '../../app/store'
import { calculateProjectStitches } from '../projects/projectsSlice'
import { addProgressRecord } from './progressSlice'

export const progressMiddleware: Middleware = (store) => (next) => (action) => {
  // Type guard to ensure we have a valid Redux action
  if (!isAction(action)) {
    return next(action)
  }

  // Only act on increment/decrement actions
  if (
    (action.type !== 'projects/incrementRow' && action.type !== 'projects/decrementRow') ||
    !('payload' in action) // Ensure payload exists
  ) {
    return next(action)
  }

  // At this point, TypeScript knows `action` has a `type` and `payload`

  const beforeState = store.getState() as RootState
  const beforeProject = beforeState.projects.projects.find(
    (p) => p.id === beforeState.projects.currentProjectId,
  )

  if (!beforeProject) {
    return next(action)
  }

  // Calculate stitches BEFORE the state changes
  const beforeStitches = calculateProjectStitches(beforeProject)

  // Let the original action proceed to update the state
  const result = next(action)

  const afterState = store.getState() as RootState
  const afterProject = afterState.projects.projects.find(
    (p) => p.id === afterState.projects.currentProjectId,
  )

  if (afterProject) {
    const afterStitches = calculateProjectStitches(afterProject)
    const stitchesDelta = afterStitches - beforeStitches
    const rowsDelta = action.type === 'projects/incrementRow' ? 1 : -1
    const sectionId = (action.payload as string | undefined) ?? 'global'

    store.dispatch(
      addProgressRecord({
        projectId: beforeProject.id,
        sectionId, // This is now guaranteed to be a string
        rowsDelta,
        stitchesDelta,
      }),
    )
  }

  return result
}
