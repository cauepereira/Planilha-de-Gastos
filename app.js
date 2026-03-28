const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
];

const CAT_COLORS = {
  'Salário':      '#00c896',
  'Freelance':    '#7c6af7',
  'Investimento': '#4a90e2',
  'Alimentação':  '#ff9f43',
  'Transporte':   '#54a0ff',
  'Moradia':      '#ff6b81',
  'Saúde':        '#1dd1a1',
  'Lazer':        '#feca57',
  'Educação':     '#48dbfb',
  'Roupas':       '#ff9ff3',
  'Outros':       '#7b82a8',
};

let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();
let activeFilter = 'todos';

// ---- Storage ----
function getKey(y, m) {
  return `gastos_${y}_${m}`;
}

function loadItems(y = currentYear, m = currentMonth) {
  const data = localStorage.getItem(getKey(y, m));
  return data ? JSON.parse(data) : [];
}

function saveItems(items) {
  localStorage.setItem(getKey(currentYear, currentMonth), JSON.stringify(items));
}

// ---- Formatters ----
function fmt(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

// ---- Render ----
function render() {
  const items = loadItems();

  // Header
  document.getElementById('currentMonthLabel').textContent =
    `${MONTHS[currentMonth].slice(0,3)} ${currentYear}`;
  document.getElementById('headerMonth').textContent = MONTHS[currentMonth];
  document.getElementById('headerYear').textContent = currentYear;

  // Totals
  let totalReceita = 0, totalDespesa = 0;
  items.forEach(i => {
    if (i.tipo === 'receita') totalReceita += i.valor;
    else totalDespesa += i.valor;
  });
  const saldo = totalReceita - totalDespesa;

  document.getElementById('totalReceita').textContent = fmt(totalReceita);
  document.getElementById('totalDespesa').textContent = fmt(totalDespesa);
  document.getElementById('totalItens').textContent = items.length;

  const saldoEl = document.getElementById('totalSaldo');
  saldoEl.textContent = fmt(saldo);
  saldoEl.style.color = saldo < 0 ? 'var(--despesa)' : saldo === 0 ? 'var(--text-muted)' : 'var(--saldo)';

  // Progress bar
  const total = totalReceita + totalDespesa;
  const pctR = total > 0 ? (totalReceita / total) * 100 : 0;
  const pctD = total > 0 ? (totalDespesa / total) * 100 : 0;
  document.getElementById('barReceita').style.width = pctR + '%';
  document.getElementById('barDespesa').style.width = pctD + '%';
  document.getElementById('pctReceita').textContent = pctR.toFixed(0) + '%';
  document.getElementById('pctDespesa').textContent = pctD.toFixed(0) + '%';

  // Categorias (apenas despesas)
  renderCategorias(items);

  // Lista
  renderLista(items);
}

function renderCategorias(items) {
  const despesas = items.filter(i => i.tipo === 'despesa');
  const catMap = {};
  despesas.forEach(i => {
    const cat = i.categoria || 'Outros';
    catMap[cat] = (catMap[cat] || 0) + i.valor;
  });

  const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  const maxVal = sorted.length > 0 ? sorted[0][1] : 1;

  const catList = document.getElementById('catList');
  if (sorted.length === 0) {
    catList.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">Nenhuma despesa registrada.</p>';
    return;
  }

  catList.innerHTML = sorted.map(([cat, val]) => {
    const pct = (val / maxVal) * 100;
    const color = CAT_COLORS[cat] || '#7b82a8';
    return `
      <div class="cat-item">
        <span class="cat-label">${cat}</span>
        <div class="cat-bar-wrap">
          <div class="cat-bar" style="width:${pct}%;background:${color}"></div>
        </div>
        <span class="cat-value">${fmt(val)}</span>
      </div>
    `;
  }).join('');
}

function renderLista(items) {
  const lista = document.getElementById('listaItens');
  const emptyMsg = document.getElementById('emptyMsg');

  const filtered = activeFilter === 'todos'
    ? items
    : items.filter(i => i.tipo === activeFilter);

  if (filtered.length === 0) {
    lista.innerHTML = '';
    emptyMsg.style.display = 'block';
    return;
  }

  emptyMsg.style.display = 'none';

  // Ordenar por data (mais recente primeiro)
  const sorted = [...filtered].sort((a, b) => {
    if (!a.data && !b.data) return 0;
    if (!a.data) return 1;
    if (!b.data) return -1;
    return b.data.localeCompare(a.data);
  });

  lista.innerHTML = sorted.map((item) => {
    const originalIndex = items.indexOf(item);
    return `
      <li>
        <div class="item-dot ${item.tipo}"></div>
        <div class="item-info">
          <div class="item-desc">${item.descricao}</div>
          <div class="item-meta">${item.categoria || 'Outros'}${item.data ? ' · ' + fmtDate(item.data) : ''}</div>
        </div>
        <span class="item-valor ${item.tipo}">${item.tipo === 'receita' ? '+' : '-'} ${fmt(item.valor)}</span>
        <button class="btn-edit" data-index="${originalIndex}" title="Editar">✏️</button>
        <button class="btn-remove" data-index="${originalIndex}" title="Remover">✕</button>
      </li>
    `;
  }).join('');
}

function renderHistorico() {
  const container = document.getElementById('historicoList');
  const entries = [];

  // Varrer últimos 24 meses
  for (let i = 0; i < 24; i++) {
    let m = currentMonth - i;
    let y = currentYear;
    while (m < 0) { m += 12; y--; }
    const items = loadItems(y, m);
    if (items.length === 0) continue;

    let rec = 0, desp = 0;
    items.forEach(it => {
      if (it.tipo === 'receita') rec += it.valor;
      else desp += it.valor;
    });
    const saldo = rec - desp;

    entries.push({ y, m, rec, desp, saldo, count: items.length });
  }

  if (entries.length === 0) {
    container.innerHTML = '<p class="empty-msg">Nenhum histórico encontrado.</p>';
    return;
  }

  container.innerHTML = entries.map(e => `
    <div class="hist-item" data-year="${e.y}" data-month="${e.m}">
      <span class="hist-month">${MONTHS[e.m]} ${e.y}</span>
      <div class="hist-values">
        <div class="hist-val">
          <span>Receitas</span>
          <strong style="color:var(--receita)">${fmt(e.rec)}</strong>
        </div>
        <div class="hist-val">
          <span>Despesas</span>
          <strong style="color:var(--despesa)">${fmt(e.desp)}</strong>
        </div>
        <div class="hist-val">
          <span>Saldo</span>
          <strong class="${e.saldo >= 0 ? 'hist-saldo-pos' : 'hist-saldo-neg'}">${fmt(e.saldo)}</strong>
        </div>
        <div class="hist-val">
          <span>Itens</span>
          <strong>${e.count}</strong>
        </div>
      </div>
    </div>
  `).join('');

  // Clicar no mês do histórico navega para ele
  container.querySelectorAll('.hist-item').forEach(el => {
    el.addEventListener('click', () => {
      currentYear = parseInt(el.dataset.year);
      currentMonth = parseInt(el.dataset.month);
      switchView('dashboard');
      render();
    });
  });
}

// ---- Views ----
function switchView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`view-${name}`).classList.add('active');
  document.querySelector(`[data-view="${name}"]`).classList.add('active');

  if (name === 'historico') renderHistorico();
}

// ---- Events ----
document.getElementById('addBtn').addEventListener('click', () => {
  const descricao = document.getElementById('descricao').value.trim();
  const valor = parseFloat(document.getElementById('valor').value);
  const tipo = document.getElementById('tipo').value;
  const categoria = document.getElementById('categoria').value;
  const data = document.getElementById('data').value;

  if (!descricao || isNaN(valor) || valor <= 0) {
    alert('Preencha a descrição e um valor válido.');
    return;
  }

  const items = loadItems();
  items.push({ descricao, valor, tipo, categoria, data });
  saveItems(items);

  document.getElementById('descricao').value = '';
  document.getElementById('valor').value = '';
  document.getElementById('data').value = '';

  render();
});

document.getElementById('listaItens').addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-remove')) {
    const index = parseInt(e.target.dataset.index);
    const items = loadItems();
    items.splice(index, 1);
    saveItems(items);
    render();
  }
  if (e.target.classList.contains('btn-edit')) {
    openEditModal(parseInt(e.target.dataset.index));
  }
});

document.getElementById('prevMonth').addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  render();
});

document.getElementById('nextMonth').addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  render();
});

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    render();
  });
});

// Set today's date as default
document.getElementById('data').valueAsDate = new Date();

// ---- Modal de Edição ----
let editingIndex = null;

function openEditModal(index) {
  const items = loadItems();
  const item = items[index];
  editingIndex = index;

  document.getElementById('editDescricao').value = item.descricao;
  document.getElementById('editValor').value = item.valor;
  document.getElementById('editTipo').value = item.tipo;
  document.getElementById('editCategoria').value = item.categoria || 'Outros';
  document.getElementById('editData').value = item.data || '';

  document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
  editingIndex = null;
}

document.getElementById('closeModal').addEventListener('click', closeEditModal);

document.getElementById('editModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('editModal')) closeEditModal();
});

document.getElementById('saveEditBtn').addEventListener('click', () => {
  const descricao = document.getElementById('editDescricao').value.trim();
  const valor = parseFloat(document.getElementById('editValor').value);
  const tipo = document.getElementById('editTipo').value;
  const categoria = document.getElementById('editCategoria').value;
  const data = document.getElementById('editData').value;

  if (!descricao || isNaN(valor) || valor <= 0) {
    alert('Preencha a descrição e um valor válido.');
    return;
  }

  const items = loadItems();
  items[editingIndex] = { descricao, valor, tipo, categoria, data };
  saveItems(items);
  closeEditModal();
  render();
});

render();
