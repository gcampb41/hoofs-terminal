import { Selection, CombinationPath } from '../types/domain'

function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]]
  if (arr.length < k) return []

  const [first, ...rest] = arr

  return [
    ...combinations(rest, k - 1).map(c => [first, ...c]),
    ...combinations(rest, k)
  ]
}

export function generatePaths(
  selections: Selection[],
  fold: 2 | 3 | 4,
  stakePerCombo: number
): CombinationPath[] {
  const sorted = [...selections].sort(
    (a, b) => new Date(a.raceTime).getTime() - new Date(b.raceTime).getTime()
  )

  const combos = combinations(sorted, fold)

  return combos.map((combo, i) => ({
    id: `path_${i}`,
    selectionIds: combo.map(s => s.id),
    originalStake: stakePerCombo,
    currentValue: stakePerCombo,
    status: 'live',
    currentLegIndex: 0,
    completedLegs: [],
    nextSelectionId: combo[0].id
  }))
}
