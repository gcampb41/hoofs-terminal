export type MarketType = 'place' | 'win'

export type Selection = {
  id: string
  runnerName: string
  raceTime: string
  raceLabel?: string
  marketType: MarketType
  expectedOdds?: number
  minOdds?: number
  status: 'pending' | 'success' | 'fail' | 'void' | 'skipped'
}

export type SessionConfig = {
  sessionId: string
  sessionName: string
  foldType: 2 | 3 | 4
  marketType: MarketType
  stakeMode: 'perCombo' | 'totalBudget'
  stakePerCombo?: number
  totalBudget?: number
  status: 'planning' | 'live' | 'finished'
}

export type CompletedLeg = {
  selectionId: string
  matchedOdds: number
  matchedStake: number
  outcome: 'success' | 'fail' | 'void' | 'skipped'
}

export type CombinationPath = {
  id: string
  selectionIds: string[]
  originalStake: number
  currentValue: number
  status: 'live' | 'dead' | 'settled'
  currentLegIndex: number
  completedLegs: CompletedLeg[]
  nextSelectionId?: string
}
