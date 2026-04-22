// Hoofs Terminal - static version

function uid(prefix = 'id') {
  return prefix + '_' + Math.random().toString(36).slice(2, 9)
}

function sortSelections(selections) {
  return [...selections].sort((a, b) => new Date(a.raceTime) - new Date(b.raceTime))
}

function combinations(arr, k) {
  if (k === 0) return [[]]
  if (arr.length < k) return []
  const [first, ...rest] = arr
  return [
    ...combinations(rest, k - 1).map(c => [first, ...c]),
    ...combinations(rest, k)
  ]
}

function generatePaths(selections, fold, stakePerCombo) {
  const sorted = sortSelections(selections)
  const combos = combinations(sorted, fold)

  return combos.map((combo, i) => ({
    id: 'path_' + i,
    selectionIds: combo.map(s => s.id),
    originalStake: stakePerCombo,
    currentValue: stakePerCombo,
    status: 'live',
    currentLegIndex: 0,
    completedLegs: [],
    nextSelectionId: combo[0].id
  }))
}

function getActiveSelectionId(paths, selections) {
  const live = paths.filter(p => p.status === 'live')
  if (!live.length) return null

  const nextIds = [...new Set(live.map(p => p.nextSelectionId))]

  const ordered = sortSelections(selections)
  for (const sel of ordered) {
    if (nextIds.includes(sel.id)) return sel.id
  }

  return nextIds[0] || null
}

function calculateRequiredStake(paths, selectionId) {
  return paths
    .filter(p => p.status === 'live' && p.nextSelectionId === selectionId)
    .reduce((sum, p) => sum + p.currentValue, 0)
}

function settleSelection(paths, selectionId, outcome, odds) {
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

function calculatePnL(paths) {
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

function demoSelections() {
  const base = new Date()
  return [
    { id: 's1', runnerName: 'Sea Mirage', raceTime: new Date(base.getTime() + 0 * 30 * 60000).toISOString(), status: 'pending' },
    { id: 's2', runnerName: 'Siouxperb', raceTime: new Date(base.getTime() + 1 * 30 * 60000).toISOString(), status: 'pending' },
    { id: 's3', runnerName: 'Lady Youzman', raceTime: new Date(base.getTime() + 2 * 30 * 60000).toISOString(), status: 'pending' },
    { id: 's4', runnerName: 'Brilliant Star', raceTime: new Date(base.getTime() + 3 * 30 * 60000).toISOString(), status: 'pending' },
    { id: 's5', runnerName: 'Space Bear', raceTime: new Date(base.getTime() + 4 * 30 * 60000).toISOString(), status: 'pending' }
  ]
}

const state = {
  selections: demoSelections(),
  fold: 2,
  stakePerCombo: 10,
  paths: [],
  log: []
}

state.paths = generatePaths(state.selections, state.fold, state.stakePerCombo)

function addLog(message) {
  state.log.unshift({ id: uid('log'), message, time: new Date().toLocaleTimeString() })
}

function render() {
  const activeId = getActiveSelectionId(state.paths, state.selections)
  const activeSel = state.selections.find(s => s.id === activeId)
  const requiredStake = activeId ? calculateRequiredStake(state.paths, activeId) : 0
  const pnl = calculatePnL(state.paths)

  document.getElementById('metric-selections').textContent = state.selections.length
  document.getElementById('metric-combos').textContent = state.paths.length
  document.getElementById('metric-original').textContent = pnl.original.toFixed(2)
  document.getElementById('metric-total').textContent = pnl.total.toFixed(2)
  document.getElementById('metric-live').textContent = state.paths.filter(p => p.status === 'live').length
  document.getElementById('metric-dead').textContent = state.paths.filter(p => p.status === 'dead').length

  const queue = document.getElementById('queue')
  queue.innerHTML = ''
  sortSelections(state.selections).forEach(sel => {
    const el = document.createElement('div')
    el.className = 'queue-item' + (sel.id === activeId ? ' active' : '')
    el.innerHTML = `<strong>${sel.runnerName}</strong><div class="queue-meta">${new Date(sel.raceTime).toLocaleTimeString()}</div>`
    queue.appendChild(el)
  })

  document.getElementById('active-runner').textContent = activeSel ? activeSel.runnerName : '—'
  document.getElementById('active-time').textContent = activeSel ? new Date(activeSel.raceTime).toLocaleTimeString() : ''
  document.getElementById('required-stake').textContent = requiredStake.toFixed(2)
  document.getElementById('paths-count').textContent = state.paths.filter(p => p.status === 'live' && p.nextSelectionId === activeId).length

  document.getElementById('pnl-original').textContent = pnl.original.toFixed(2)
  document.getElementById('pnl-realised').textContent = pnl.realised.toFixed(2)
  document.getElementById('pnl-unrealised').textContent = pnl.unrealised.toFixed(2)
  document.getElementById('pnl-total').textContent = pnl.total.toFixed(2)

  const logEl = document.getElementById('log')
  logEl.innerHTML = ''
  state.log.slice(0, 20).forEach(item => {
    const el = document.createElement('div')
    el.className = 'log-item'
    el.textContent = `[${item.time}] ${item.message}`
    logEl.appendChild(el)
  })

  const tableBody = document.getElementById('paths-table')
  tableBody.innerHTML = ''
  state.paths.forEach(p => {
    const row = document.createElement('tr')
    row.innerHTML = `
      <td>${p.id}</td>
      <td>${p.selectionIds.join(', ')}</td>
      <td class="status-${p.status}">${p.status}</td>
      <td>${p.currentLegIndex}/${p.selectionIds.length}</td>
      <td>${p.originalStake.toFixed(2)}</td>
      <td>${p.currentValue.toFixed(2)}</td>
      <td>${p.nextSelectionId || '-'}</td>
    `
    tableBody.appendChild(row)
  })
}

function bindActions() {
  const oddsInput = document.getElementById('input-odds')

  document.getElementById('btn-win').onclick = () => {
    const activeId = getActiveSelectionId(state.paths, state.selections)
    if (!activeId) return
    const odds = Number(oddsInput.value) || 1
    state.paths = settleSelection(state.paths, activeId, 'success', odds)
    addLog(`WIN ${activeId} @ ${odds}`)
    render()
  }

  document.getElementById('btn-loss').onclick = () => {
    const activeId = getActiveSelectionId(state.paths, state.selections)
    if (!activeId) return
    state.paths = settleSelection(state.paths, activeId, 'fail', 0)
    addLog(`LOSS ${activeId}`)
    render()
  }

  document.getElementById('btn-reset').onclick = () => {
    state.selections = demoSelections()
    state.paths = generatePaths(state.selections, state.fold, state.stakePerCombo)
    state.log = []
    addLog('Session reset')
    render()
  }
}

function init() {
  bindActions()
  addLog('Demo session loaded')
  render()
}

window.addEventListener('DOMContentLoaded', init)
