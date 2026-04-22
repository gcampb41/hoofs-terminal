import React, { useState } from 'react'
import { demoSelections } from './data/demoSession'
import { generatePaths } from './engine/combinations'
import { getActiveSelectionId, calculateRequiredStake, settleSelection } from './engine/execution'
import { calculatePnL } from './engine/pnl'

export default function App() {
  const [paths, setPaths] = useState(() => generatePaths(demoSelections, 2, 10))
  const [odds, setOdds] = useState(2.0)

  const active = getActiveSelectionId(paths)
  const requiredStake = active ? calculateRequiredStake(paths, active) : 0
  const pnl = calculatePnL(paths)

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0b0f14', color: '#e6edf3' }}>
      <div style={{ width: '20%', padding: 10, borderRight: '1px solid #222' }}>
        <h3>Race Queue</h3>
        {demoSelections.map(s => <div key={s.id}>{s.runnerName}</div>)}
      </div>

      <div style={{ width: '50%', padding: 20 }}>
        <h2>Execution</h2>
        <p>Active: {active}</p>
        <p>Stake: {requiredStake.toFixed(2)}</p>

        <input type="number" value={odds} onChange={e => setOdds(Number(e.target.value))} />

        <button onClick={() => setPaths(settleSelection(paths, active!, 'success', odds))}>Win</button>
        <button onClick={() => setPaths(settleSelection(paths, active!, 'fail', 0))}>Loss</button>
      </div>

      <div style={{ width: '30%', padding: 10, borderLeft: '1px solid #222' }}>
        <h3>P&L</h3>
        <p>{pnl.total.toFixed(2)}</p>
      </div>
    </div>
  )
}
