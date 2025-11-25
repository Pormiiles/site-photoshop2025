/*
  Estrutura:
  - 4 semanas
  - cada semana tem 5 tarefas (Seg-Sex) baseadas no cronograma enviado
  - calcula progresso por semana e total
  - salva em localStorage com chave `ps_study_progress_v1`
*/

const defaultData = {
  weeks: [
    {title:'Semana 1 — Fundamentos', tasks:[
      'Tour pela interface & workspace',
      'Camadas: criar/organizar',
      'Seleções básicas',
      'Recorte com Quick Selection',
      'Treino de brush'
    ]},
    {title:'Semana 2 — Ajustes & Máscaras', tasks:[
      'Ajustes (Brightness/Hue/Curves)',
      'Adjustment Layers',
      'Praticar Layer Masks',
      'Degradê e modos de mesclagem',
      'Limpeza de imagem'
    ]},
    {title:'Semana 3 — Brushes & Composição', tasks:[
      'Pincéis: Opacity/Flow',
      'Criar e salvar pincéis',
      'Iluminação manual (pincel)',
      'Aplicar texturas com máscara',
      'Estudo de paletas e recriar'
    ]},
    {title:'Semana 4 — Design & Portfólio', tasks:[
      'Tipografia e hierarquia',
      'Template para redes sociais',
      'Mockups (inserir em objetos)',
      'Criar mini-poster',
      'Revisão geral'
    ]}
  ]
};

const STORAGE_KEY = 'ps_study_progress_v1';

// carregar dados do localStorage ou criar estrutura vazia
function loadState(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw){
    // criar estado com false em todas tasks
    const st = {weeks: defaultData.weeks.map(w=>({title:w.title, tasks: w.tasks.map(t=>({title:t, done:false}))}))};
    localStorage.setItem(STORAGE_KEY, JSON.stringify(st));
    return st;
  }
  try { return JSON.parse(raw); } catch(e){ localStorage.removeItem(STORAGE_KEY); return loadState(); }
}
function saveState(state){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

const state = loadState();
const weeksContainer = document.getElementById('weeksContainer');

function render(){
  weeksContainer.innerHTML = '';
  state.weeks.forEach((week, idx) => {
    const w = document.createElement('section');
    w.className = 'week';
    w.setAttribute('data-week', idx);
    const weekNum = idx+1;
    w.innerHTML = `
      <h3>
        <span>${week.title}</span>
        <span style="font-size:13px;color:var(--muted)">Semana ${weekNum}</span>
      </h3>
      <div class="tasks" id="tasks-${idx}"></div>
      <div class="week-footer">
        <div class="progress-small"><div class="bar" id="bar-${idx}"></div></div>
        <button class="ghost" data-action="mark-week" data-week="${idx}" style="padding:8px 10px;border-radius:8px">Marcar Semana</button>
      </div>
    `;
    weeksContainer.appendChild(w);

    const tasksEl = document.getElementById(`tasks-${idx}`);
    week.tasks.forEach((task, tindex) => {
      const key = `w${idx}t${tindex}`;
      const div = document.createElement('div');
      div.className = 'task';
      const checked = task.done ? 'checked' : '';
      div.innerHTML = `<label><input type="checkbox" data-week="${idx}" data-task="${tindex}" ${checked} /> <div style="display:flex;flex-direction:column"><strong style="font-size:13px">${task.title}</strong><small style="color:var(--muted)">${['Seg','Ter','Qua','Qui','Sex'][tindex] || ''}</small></div></label>`;
      tasksEl.appendChild(div);
    });
  });

  attachListeners();
  updateProgressUI();
}

function attachListeners(){
  document.querySelectorAll('input[type="checkbox"]').forEach(cb=>{
    cb.removeEventListener('change', onCheck);
    cb.addEventListener('change', onCheck);
  });
  document.querySelectorAll('button[data-action="mark-week"]').forEach(btn=>{
    btn.removeEventListener('click', onMarkWeek);
    btn.addEventListener('click', onMarkWeek);
  });
}

function onCheck(e){
  const cb = e.target;
  const w = Number(cb.dataset.week);
  const t = Number(cb.dataset.task);
  state.weeks[w].tasks[t].done = cb.checked;
  saveState(state);
  updateProgressUI();
}

function onMarkWeek(e){
  const idx = Number(e.currentTarget.dataset.week);
  // toggle: se alguma não está completa, completar; se todas completas, resetar
  const allDone = state.weeks[idx].tasks.every(t=>t.done);
  state.weeks[idx].tasks.forEach(t=> t.done = !allDone );
  saveState(state);
  render();
}

function updateProgressUI(){
  // por semana
  state.weeks.forEach((week, idx) => {
    const total = week.tasks.length;
    const done = week.tasks.filter(t=>t.done).length;
    const pct = Math.round((done/total)*100);
    const bar = document.getElementById(`bar-${idx}`);
    if(bar) bar.style.width = pct + '%';

    // stepper node
    const stepEl = document.querySelector(`.step[data-week="${idx+1}"]`);
    if(stepEl){
      stepEl.classList.remove('completed','active');
      if(pct === 100) stepEl.classList.add('completed');
      if(pct > 0 && pct < 100) stepEl.classList.add('active');
    }
  });

  // total
  const totals = state.weeks.reduce((acc,w)=>acc + w.tasks.length,0);
  const dones = state.weeks.reduce((acc,w)=>acc + w.tasks.filter(t=>t.done).length,0);
  const totalPct = totals ? Math.round((dones/totals)*100) : 0;
  document.getElementById('totalBar').style.width = totalPct + '%';
  document.getElementById('doneCount').innerText = totalPct + '%';
  document.getElementById('taskCount').innerText = `${dones} / ${totals}`;

  // stepper connector fill based on completed weeks
  const completedWeeks = state.weeks.filter(w=> w.tasks.every(t=>t.done)).length;
  const fillEl = document.getElementById('stepFill');
  const fillPct = (completedWeeks / state.weeks.length) * 100;
  fillEl.style.width = fillPct + '%';
}

// reset and export controls
document.getElementById('resetBtn').addEventListener('click', ()=>{
  if(!confirm('Resetar todo o progresso?')) return;
  const fresh = {weeks: defaultData.weeks.map(w=>({title:w.title, tasks: w.tasks.map(t=>({title:t, done:false}))}))};
  Object.assign(state, fresh);
  saveState(state);
  render();
});

document.getElementById('exportBtn').addEventListener('click', ()=>{
  const summary = {
    date: new Date().toISOString(),
    completed: state.weeks.map((w, i)=>({
      week:i+1, title:w.title, completed: w.tasks.filter(t=>t.done).length, total: w.tasks.length
    }))
  };
  const txt = 'Progresso exportado (JSON)\\n' + JSON.stringify(summary, null, 2);
  const blob = new Blob([txt], {type:'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'ps-study-progress.txt';
  a.click(); URL.revokeObjectURL(url);
});

render();