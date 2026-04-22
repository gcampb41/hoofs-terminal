// Rebuilt Hoofs Terminal (doubles-focused, correct sequencing)

const state = {
  selections: [],
  paths: [],
  events: [],
  stakePerCombo: 10
}

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function demo() {
  const base = new Date()
  return [
    { id: 'a', name: 'Sea Mirage', time: new Date(base.getTime() + 0).toISOString(), status: 'pending' },
    { id: 'b', name: 'Siouxperb', time: new Date(base.getTime() + 1800000).toISOString(), status: 'pending' },
    { id: 'c', name: 'Lady Youzman', time: new Date(base.getTime() + 3600000).toISOString(), status: 'pending' },
    { id: 'd', name: 'Brilliant Star', time: new Date(base.getTime() + 5400000).toISOString(), status: 'pending' }
  ]
}

function sortSel() {
  return [...state.selections].sort((a,b)=> new Date(a.time)-new Date(b.time))
}

function buildPaths() {
  const s = sortSel()
  const paths = []
  for (let i=0;i<s.length;i++) {
    for (let j=i+1;j<s.length;j++) {
      paths.push({
        id: uid(),
        legs: [s[i].id, s[j].id],
        values: [state.stakePerCombo, null],
        status: 'live',
        nextIndex: 0
      })
    }
  }
  state.paths = paths
}

function getActive() {
  const live = state.paths.filter(p=>p.status==='live')
  if (!live.length) return null
  const nextIds = [...new Set(live.map(p=>p.legs[p.nextIndex]))]
  for (const s of sortSel()) {
    if (nextIds.includes(s.id)) return s.id
  }
  return null
}

function requiredStake(selId) {
  return state.paths
    .filter(p=>p.status==='live' && p.legs[p.nextIndex]===selId)
    .reduce((a,p)=>a + (p.values[p.nextIndex]||0),0)
}

function settle(selId, success, odds, stakePlaced) {
  state.events.push({selId, success, odds, stakePlaced})

  state.paths = state.paths.map(p=>{
    if (p.status!=='live') return p
    if (p.legs[p.nextIndex]!==selId) return p

    if (!success) return {...p, status:'dead'}

    const stake = p.values[p.nextIndex]
    const nextVal = stake * odds

    if (p.nextIndex===1) {
      return {...p, status:'settled', values:[p.values[0], nextVal]}
    }

    return {
      ...p,
      nextIndex:1,
      values:[p.values[0], nextVal]
    }
  })
}

function calcPnL() {
  const planned = state.paths.length * state.stakePerCombo
  const placed = state.events.reduce((a,e)=>a + (e.stakePlaced||0),0)

  const returns = state.paths
    .filter(p=>p.status==='settled')
    .reduce((a,p)=>a + p.values[1],0)

  const liveExposure = state.paths
    .filter(p=>p.status==='live')
    .reduce((a,p)=>a + (p.values[p.nextIndex]||0),0)

  const realised = returns - placed
  const unrealised = liveExposure

  return {
    planned,
    placed,
    remaining: planned - placed,
    exposure: liveExposure,
    returns,
    realised,
    unrealised,
    total: realised + unrealised,
    best: returns + unrealised - placed,
    worst: -placed
  }
}

function render() {
  const active = getActive()
  const pnl = calcPnL()

  document.getElementById('metric-selections').textContent = state.selections.length
  document.getElementById('metric-combos').textContent = state.paths.length
  document.getElementById('metric-planned').textContent = pnl.planned.toFixed(2)
  document.getElementById('metric-placed').textContent = pnl.placed.toFixed(2)
  document.getElementById('metric-live-paths').textContent = state.paths.filter(p=>p.status==='live').length
  document.getElementById('metric-total-pnl').textContent = pnl.total.toFixed(2)

  const q = document.getElementById('queue')
  q.innerHTML=''
  sortSel().forEach(s=>{
    const el=document.createElement('div')
    el.className='queue-item'+(s.id===active?' active':'')
    el.innerHTML=`<strong>${s.name}</strong><div class="queue-meta">${new Date(s.time).toLocaleTimeString()}</div>`
    q.appendChild(el)
  })

  const activeSel = state.selections.find(s=>s.id===active)
  document.getElementById('active-runner').textContent = activeSel?activeSel.name:'—'
  document.getElementById('active-meta').textContent = activeSel?new Date(activeSel.time).toLocaleTimeString():''

  const stake = active?requiredStake(active):0
  document.getElementById('required-stake').textContent = stake.toFixed(2)
  document.getElementById('represented-paths').textContent = `${state.paths.filter(p=>p.status==='live'&&p.legs[p.nextIndex]===active).length} paths`

  document.getElementById('impact-paths').textContent = state.paths.filter(p=>p.status==='live'&&p.legs[p.nextIndex]===active).length
  document.getElementById('impact-value').textContent = stake.toFixed(2)
  document.getElementById('impact-next').textContent = (stake*Number(document.getElementById('input-odds').value||1)).toFixed(2)

  document.getElementById('pnl-planned').textContent = pnl.planned.toFixed(2)
  document.getElementById('pnl-placed').textContent = pnl.placed.toFixed(2)
  document.getElementById('pnl-remaining').textContent = pnl.remaining.toFixed(2)
  document.getElementById('pnl-exposure').textContent = pnl.exposure.toFixed(2)
  document.getElementById('pnl-returns').textContent = pnl.returns.toFixed(2)
  document.getElementById('pnl-realised').textContent = pnl.realised.toFixed(2)
  document.getElementById('pnl-unrealised').textContent = pnl.unrealised.toFixed(2)
  document.getElementById('pnl-total').textContent = pnl.total.toFixed(2)
  document.getElementById('pnl-best').textContent = pnl.best.toFixed(2)
  document.getElementById('pnl-worst').textContent = pnl.worst.toFixed(2)

  const tbody=document.getElementById('paths-table')
  tbody.innerHTML=''
  state.paths.forEach(p=>{
    const row=document.createElement('tr')
    row.innerHTML=`
      <td>${p.id}</td>
      <td>${p.legs.join(' → ')}</td>
      <td class="status-${p.status}">${p.status}</td>
      <td>${p.nextIndex}/${p.legs.length}</td>
      <td>${p.values[0].toFixed(2)}</td>
      <td>${(p.values[p.nextIndex]||p.values[1]||0).toFixed(2)}</td>
      <td>${p.legs[p.nextIndex]||'-'}</td>
      <td>${p.values[0].toFixed(2)}</td>
      <td>${p.values[1]?p.values[1].toFixed(2):'-'}</td>
    `
    tbody.appendChild(row)
  })
}

function bind() {
  document.getElementById('btn-success').onclick=()=>{
    const active=getActive()
    if(!active) return
    const odds=Number(document.getElementById('input-odds').value||1)
    const stake=requiredStake(active)
    settle(active,true,odds,stake)
    render()
  }

  document.getElementById('btn-fail').onclick=()=>{
    const active=getActive()
    if(!active) return
    const stake=requiredStake(active)
    settle(active,false,0,stake)
    render()
  }

  document.getElementById('btn-reset').onclick=init
  document.getElementById('btn-demo').onclick=init
}

function init() {
  state.selections = demo()
  buildPaths()
  state.events=[]
  render()
}

window.onload=()=>{
  bind()
  init()
}
