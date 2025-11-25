/*
  Estrutura atualizada:
  - 4 semanas
  - Tarefas de Seg–Sex do seu cronograma
  - + Projetos fofos e fantasiosos ✨ em cada semana
  - Calcula progresso por semana e total
  - Salva em localStorage
*/

const defaultData = {
  weeks: [
    {
      title:'Semana 1 — Fundamentos',
      tasks:[
        // Tarefas originais
        'Tour pela interface & workspace',
        'Camadas: criar/organizar',
        'Seleções básicas',
        'Recorte com Quick Selection',
        'Treino de brush',

        // Projetos fofos ✨
        '✨ Projeto: Cartão de boas-vindas mágico',
        '✨ Projeto: Criatura mágica minimalista (cozy cute)'
      ]
    },
    {
      title:'Semana 2 — Ajustes & Máscaras',
      tasks:[
        'Ajustes (Brightness/Hue/Curves)',
        'Adjustment Layers',
        'Praticar Layer Masks',
        'Degradê e modos de mesclagem',
        'Limpeza de imagem',

        // Projetos fofos ✨
        '✨ Projeto: Cidade dentro da xícara (fotomanipulação mágica)',
        '✨ Projeto: Portal para outro mundo (janela ou porta mágica)'
      ]
    },
    {
      title:'Semana 3 — Brushes & Composição',
      tasks:[
        'Pincéis: Opacity/Flow',
        'Criar e salvar pincéis',
        'Iluminação manual (pincel)',
        'Aplicar texturas com máscara',
        'Estudo de paletas e recriar',

        // Projetos fofos ✨
        '✨ Projeto: Criatura de luz (vagalume, borboleta mágica, espírito)',
        '✨ Projeto: Casa aconchegante dentro de um cogumelo'
      ]
    },
    {
      title:'Semana 4 — Design & Portfólio',
      tasks:[
        'Tipografia e hierarquia',
        'Template para redes sociais',
        'Mockups (inserir em objetos)',
        'Criar mini-poster',
        'Revisão geral',

        // Projetos fofos ✨
        '✨ Projeto: Poster "A Jornada da Pequena Estrela"',
        '✨ Projeto: Wallpaper "Dreamy Forest"',
        '✨ Projeto: Mini-portfólio cozy cute (PDF ou imagem)'
      ]
    }
  ]
};

const STORAGE_KEY = 'ps_study_progress_v1';

// carregar estado
function loadState(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw){
    const st = {
      weeks: defaultData.weeks.map(w => ({
        title: w.title,
        tasks: w.tasks.map(t => ({ title:t, done:false }))
      }))
    };
    saveState(st);
    return st;
  }
  try { return JSON.parse(raw); }
  catch {
    localStorage.removeItem(STORAGE_KEY);
    return loadState();
  }
}

function saveState(state){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const state = loadState();
const weeksContainer = document.getElementById('weeksContainer');

function render(){
  weeksContainer.innerHTML = '';

  state.weeks.forEach((week, idx) => {
    const weekEl = document.createElement('section');
    weekEl.className = 'week';
    weekEl.dataset.week = idx;

    weekEl.innerHTML = `
      <h3>
        <span>${week.title}</span>
        <span style="font-size:13px;color:var(--muted)">Semana ${idx+1}</span>
      </h3>

      <div class="tasks" id="tasks-${idx}"></div>

      <div class="week-footer">
        <div class="progress-small"><div class="bar" id="bar-${idx}"></div></div>
        <button class="ghost" data-action="mark-week" data-week="${idx}" style="padding:8px 10px;border-radius:8px">
          Marcar Semana
        </button>
      </div>
    `;

    weeksContainer.appendChild(weekEl);

    // inserir as tasks
    const tasksEl = document.getElementById(`tasks-${idx}`);
    week.tasks.forEach((taskObj, tIndex) => {
      const done = taskObj.done;

      const isProject = taskObj.title.includes('✨');

      const taskEl = document.createElement('div');
      taskEl.className = 'task';
      if (isProject) taskEl.style.borderLeft = '3px solid var(--accent)';

      taskEl.innerHTML = `
        <label>
          <input type="checkbox" data-week="${idx}" data-task="${tIndex}" ${done ? 'checked' : ''}>
          <div style="display:flex;flex-direction:column">
            <strong style="font-size:13px">${taskObj.title}</strong>
            <small style="color:var(--muted)">
              ${tIndex < 5 ? ['Seg','Ter','Qua','Qui','Sex'][tIndex] : 'Projeto ✨'}
            </small>
          </div>
        </label>
      `;

      tasksEl.appendChild(taskEl);
    });
  });

  attachListeners();
  updateProgressUI();
}

function attachListeners(){
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', onCheck);
  });

  document.querySelectorAll('button[data-action="mark-week"]').forEach(btn => {
    btn.addEventListener('click', onMarkWeek);
  });
}

function onCheck(e){
  const w = Number(e.target.dataset.week);
  const t = Number(e.target.dataset.task);

  state.weeks[w].tasks[t].done = e.target.checked;
  saveState(state);

  updateProgressUI();
}

function onMarkWeek(e){
  const w = Number(e.currentTarget.dataset.week);
  const allDone = state.weeks[w].tasks.every(t => t.done);

  state.weeks[w].tasks.forEach(t => t.done = !allDone);

  saveState(state);
  render();
}

function updateProgressUI(){
  state.weeks.forEach((week, idx) => {
    const total = week.tasks.length;
    const done = week.tasks.filter(t => t.done).length;

    const pct = Math.round((done / total) * 100);

    const bar = document.getElementById(`bar-${idx}`);
    if (bar) bar.style.width = pct + '%';

    // Stepper
    const stepEl = document.querySelector(`.step[data-week="${idx+1}"]`);
    if (stepEl) {
      stepEl.classList.remove('completed','active');
      if (pct === 100) stepEl.classList.add('completed');
      else if (pct > 0) stepEl.classList.add('active');
    }
  });

  // total geral
  const totalTasks = state.weeks.reduce((acc, w) => acc + w.tasks.length, 0);
  const doneTasks = state.weeks.reduce((acc, w) => acc + w.tasks.filter(t => t.done).length, 0);

  const pctTotal = Math.round((doneTasks / totalTasks) * 100);

  document.getElementById('totalBar').style.width = pctTotal + '%';
  document.getElementById('doneCount').innerText = pctTotal + '%';
  document.getElementById('taskCount').innerText = `${doneTasks} / ${totalTasks}`;

  const completedWeeks = state.weeks.filter(w => w.tasks.every(t => t.done)).length;
  const stepFill = document.getElementById('stepFill');
  stepFill.style.width = (completedWeeks / state.weeks.length) * 100 + '%';
}

// reset
document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Resetar todo o progresso?')) return;

  const fresh = {
    weeks: defaultData.weeks.map(w => ({
      title: w.title,
      tasks: w.tasks.map(t => ({ title:t, done:false }))
    }))
  };

  Object.assign(state, fresh);
  saveState(state);
  render();
});

// export
document.getElementById('exportBtn').addEventListener('click', () => {
  const summary = {
    date: new Date().toLocaleString('pt-BR'),
    progress: state.weeks.map((w,i) => ({
      week: i+1,
      title: w.title,
      completed: w.tasks.filter(t => t.done).length,
      total: w.tasks.length
    }))
  };

  const blob = new Blob([JSON.stringify(summary,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'progresso_photoshop.json';
  a.click();

  URL.revokeObjectURL(url);
});

render();