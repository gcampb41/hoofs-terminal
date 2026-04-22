import { CombinationPath } from '../types/domain'

export function getNextSelectionId(path: CombinationPath): string | undefined {
  return path.selectionIds[path.currentLegIndex]
}

export function getActiveSelectionId(paths: CombinationPath[]): string | null {
  const live = paths.filter(p => p.status === 'live')
  if (!live.length) return null
  return live[0].nextSelectionId || null
}

export function calculateRequiredStake(paths: CombinationPath[], selectionId: string) {
  return paths
    .filter(p => p.status === 'live' && p.nextSelectionId === selectionId)
    .reduce((sum, p) => sum + p.currentValue, 0)
}

export function settleSelection(
  paths: CombinationPath[],
  selectionId: string,
  outcome: 'success' | 'fail',
  odds: number
): CombinationPath[] {
  return paths.map(path => {
    if (path.status !== 'live') return path
    if (path.nextSelectionId !== selectionId) return path

    if (outcome === 'fail') {
      return { ...path, status: 'dead' }
    }

    const nextValue = path.currentValue * odds
    const nextIndex = path.currentLegIndex + 1

    const isFinal = nextIndex >= path.selectionIds.length

    return {
      ...path,
      currentValue: nextValue,
      currentLegIndex: nextIndex,
      status: isFinal ? 'settled' : 'live',
      nextSelectionId: path.selectionIds[nextIndex]
    }
  })
}
