import { CombinationPath } from '../types/domain'

export function calculatePnL(paths: CombinationPath[]) {
  const original = paths.reduce((s, p) => s + p.originalStake, 0)

  const settled = paths.filter(p => p.status === 'settled')
  const live = paths.filter(p => p.status === 'live')

  const returns = settled.reduce((s, p) => s + p.currentValue, 0)

  const realised = returns - original
  const unrealised = live.reduce((s, p) => s + p.currentValue, 0)

  return {
    original,
    realised,
    unrealised,
    total: realised + unrealised
  }
}
