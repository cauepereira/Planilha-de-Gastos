import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://xxzghlxmduwopdjkixtg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4emdobHhtZHV3b3BkamtpeHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MDM4ODMsImV4cCI6MjA5MDM3OTg4M30.32O8opEZHlvOHKf0vIaZPyQ5mz7bVtx0fMolLJzlnX4";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
];

const CAT_COLORS = {
  'Salário':'#00c896','Freelance':'#7c6af7','Investimento':'#4a90e2',
  'Alimentação':'#ff9f43','Transporte':'#54a0ff','Moradia':'#ff6b81',
  'Saúde':'#1dd1a1','Lazer':'#feca57','Educação':'#48dbfb',
  'Roupas':'#ff9ff3','Outros':'#7b82a8',
};

let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();
let activeFilter = 'todos';
let currentUser = null;
let cachedItems = [];
let editingId = null;

// ---- Formatters ----
function fmt(v) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
function fmtDate(d) { if (!d) return ''; const [y,m,dd] = d.split('-'); return `${dd}/${m}/${y}`; }

// ---- Auth ----
document.getElementById('loginBtn').addEventListener('click', async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.href }
  });
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await supabase.auth.signOut();
  location.reload();
});

supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    currentUser = session.user;
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appRoot').style.display = 'flex';
    document.getElementById('userAvatar').src = currentUser.user_metadata?.avatar_url || '';
    document.getElementById('userName').textContent = currentUser.user_metadata?.full_name?.split(' ')[0] || '';
    document.getElementById('data').valueAsDate = new Date();
    loadItems();
  } else {
    currentUser = null;
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('appRoot').style.display = 'none';
  }
});

// Verifica sessão ao carregar
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session?.user) {
    currentUser = session.user;
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appRoot').style.display = 'flex';
    document.getElementById('userAvatar').src = currentUser.user_metadata?.avatar_url || '';
    document.getElementById('userName').textContent = currentUser.user_metadata?.full_name?.split(' ')[0] || '';
    document.getElementById('data').valueAsDate = new Date();
    loadItems();
  }
});

// ---- Supabase CRUD ----
async function loadItems() {
  setSyncStatus('syncing');
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', currentUser.id)
    .eq('year', currentYear)
    .eq('month', currentMonth)
    .order('created_at', { ascending: false });

  if (error) { setSyncStatus('error'); return; }
  cachedItems = data || [];
  setSyncStatus('ok');
  render();
}

async function addItem(item) {
  setSyncStatus('syncing');
  const { error } = await supabase.from('items').insert({
    ...item,
    user_id: currentUser.id,
    year: currentYear,
    month: currentMonth
  });
  if (error) { setSyncStatus('error'); alert('Erro ao salvar.'); return; }
  await loadItems();
}

async function removeItem(id) {
  setSyncStatus('syncing');
  await supabase.from('items').delete().eq('id', id).eq('user_id', currentUser.id);
  await loadItems();
}

async function editItem(id, data) {
  setSyncStatus('syncing');
  await supabase.from('items').update(data).eq('id', id).eq('user_id', currentUser.id);
  await loadItems();
}

function setSyncStatus(state) {
  const el = document.getElementById('syncStatus');
  if (state === 'syncing') { el.textContent = '⟳ Sincronizando...'; el.className = 'sync-status syncing'; }
  else if (state === 'ok')  { el.textContent = '✓ Sincronizado';     el.className = 'sync-status ok'; }
  else                      { el.textContent = '✗ Erro de conexão';  el.className = 'sync-status error'; }
}

// ---- Render ----
function render() {
  if (!currentUser) return;
  const items = cachedItems;

  document.getElementById('currentMonthLabel').textContent = `${MONTHS[currentMonth].slice(0,3)} ${currentYear}`;
  document.getElementById('headerMonth').textContent = MONTHS[currentMonth];
  document.getElementById('headerYear').textContent = currentYear;

  let totalReceita = 0, totalDespesa = 0;
  items.forEach(i => { if (i.tipo === 'receita') totalReceita += Number(i.valor); else totalDespesa += Number(i.valor); });
  const saldo = totalReceita - totalDespesa;

  document.getElementById('totalReceita').textContent = fmt(totalReceita);
  document.getElementById('totalDespesa').textContent = fmt(totalDespesa);
  document.getElementById('totalItens').textContent = items.length;

  const saldoEl = document.getElementById('totalSaldo');
  saldoEl.textContent = fmt(saldo);
  saldoEl.style.color = saldo < 0 ? 'var(--despesa)' : saldo === 0 ? 'var(--text-muted)' : 'var(--saldo)';

  const total = totalReceita + totalDespesa;
  const pctR = total > 0 ? (totalReceita / total) * 100 : 0;
  const pctD = total > 0 ? (totalDespesa / total) * 100 : 0;
  document.getElementById('barReceita').style.width = pctR + '%';
  document.getElementById('barDespesa').style.width = pctD + '%';
  document.getElementById('pctReceita').textContent = pctR.toFixed(0) + '%';
  document.getElementById('pctDespesa').textContent = pctD.toFixed(0) + '%';

  renderCategorias(items);
  renderLista(items);
}

function renderCategorias(items) {
  const catMap = {};
  items.filter(i => i.tipo === 'despesa').forEach(i => {
    const cat = i.categoria || 'Outros';
    catMap[cat] = (catMap[cat] || 0) + Number(i.valor);
  });
  const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  const maxVal = sorted.length > 0 ? sorted[0][1] : 1;
  const catList = document.getElementById('catList');
  if (sorted.length === 0) {
    catList.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">Nenhuma despesa registrada.</p>';
    return;
  }
  catList.innerHTML = sorted.map(([cat, val]) => `
    <div class="cat-item">
      <span class="cat-label">${cat}</span>
      <div class="cat-bar-wrap">
        <div class="cat-bar" style="width:${(val/maxVal)*100}%;background:${CAT_COLORS[cat]||'#7b82a8'}"></div>
      </div>
      <span class="cat-value">${fmt(val)}</span>
    </div>
  `).join('');
}

function renderLista(items) {
  const lista = document.getElementById('listaItens');
  const emptyMsg = document.getElementById('emptyMsg');
  const filtered = activeFilter === 'todos' ? items : items.filter(i => i.tipo === activeFilter);

  if (filtered.length === 0) { lista.innerHTML = ''; emptyMsg.style.display = 'block'; return; }
  emptyMsg.style.display = 'none';

  const sorted = [...filtered].sort((a, b) => {
    if (!a.data && !b.data) return 0;
    if (!a.data) return 1; if (!b.data) return -1;
    return b.data.localeCompare(a.data);
  });

  lista.innerHTML = sorted.map(item => `
    <li>
      <div class="item-dot ${item.tipo}"></div>
      <div class="item-info">
        <div class="item-desc">${item.descricao}</div>
        <div class="item-meta">${item.categoria || 'Outros'}${item.data ? ' · ' + fmtDate(item.data) : ''}</div>
      </div>
      <span class="item-valor ${item.tipo}">${item.tipo === 'receita' ? '+' : '-'} ${fmt(Number(item.valor))}</span>
      <button class="btn-edit" data-id="${item.id}" title="Editar">✏️</button>
      <button class="btn-remove" data-id="${item.id}" title="Remover">✕</button>
    </li>
  `).join('');
}

// ---- Histórico ----
async function renderHistorico() {
  const container = document.getElementById('historicoList');
  container.innerHTML = '<p class="empty-msg">Carregando...</p>';

  const { data, error } = await supabase
    .from('items')
    .select('tipo, valor, year, month')
    .eq('user_id', currentUser.id);

  if (error || !data) { container.innerHTML = '<p class="empty-msg">Erro ao carregar.</p>'; return; }

  const monthMap = {};
  data.forEach(item => {
    const key = `${item.year}_${item.month}`;
    if (!monthMap[key]) monthMap[key] = { y: item.year, m: item.month, rec: 0, desp: 0, count: 0 };
    if (item.tipo === 'receita') monthMap[key].rec += Number(item.valor);
    else monthMap[key].desp += Number(item.valor);
    monthMap[key].count++;
  });

  const entries = Object.values(monthMap).sort((a, b) => b.y !== a.y ? b.y - a.y : b.m - a.m);
  if (entries.length === 0) { container.innerHTML = '<p class="empty-msg">Nenhum histórico encontrado.</p>'; return; }

  container.innerHTML = entries.map(e => {
    const saldo = e.rec - e.desp;
    return `
      <div class="hist-item" data-year="${e.y}" data-month="${e.m}">
        <span class="hist-month">${MONTHS[e.m]} ${e.y}</span>
        <div class="hist-values">
          <div class="hist-val"><span>Receitas</span><strong style="color:var(--receita)">${fmt(e.rec)}</strong></div>
          <div class="hist-val"><span>Despesas</span><strong style="color:var(--despesa)">${fmt(e.desp)}</strong></div>
          <div class="hist-val"><span>Saldo</span><strong class="${saldo>=0?'hist-saldo-pos':'hist-saldo-neg'}">${fmt(saldo)}</strong></div>
          <div class="hist-val"><span>Itens</span><strong>${e.count}</strong></div>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.hist-item').forEach(el => {
    el.addEventListener('click', () => {
      currentYear = parseInt(el.dataset.year);
      currentMonth = parseInt(el.dataset.month);
      switchView('dashboard');
      loadItems();
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
document.getElementById('addBtn').addEventListener('click', async () => {
  const descricao = document.getElementById('descricao').value.trim();
  const valor = parseFloat(document.getElementById('valor').value);
  const tipo = document.getElementById('tipo').value;
  const categoria = document.getElementById('categoria').value;
  const data = document.getElementById('data').value;

  if (!descricao || isNaN(valor) || valor <= 0) { alert('Preencha a descrição e um valor válido.'); return; }

  await addItem({ descricao, valor, tipo, categoria, data });
  document.getElementById('descricao').value = '';
  document.getElementById('valor').value = '';
  document.getElementById('data').valueAsDate = new Date();
});

document.getElementById('listaItens').addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-remove')) removeItem(e.target.dataset.id);
  if (e.target.classList.contains('btn-edit')) openEditModal(e.target.dataset.id);
});

document.getElementById('prevMonth').addEventListener('click', () => {
  currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  loadItems();
});

document.getElementById('nextMonth').addEventListener('click', () => {
  currentMonth++; if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  loadItems();
});

// ---- Hamburguer menu ----
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function openSidebar() {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('active');
}

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('active');
}

hamburgerBtn.addEventListener('click', () => {
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
});

sidebarOverlay.addEventListener('click', closeSidebar);

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    switchView(btn.dataset.view);
    closeSidebar();
  });
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    render();
  });
});

// ---- Modal de Edição ----
function openEditModal(id) {
  const item = cachedItems.find(i => i.id === id);
  if (!item) return;
  editingId = id;
  document.getElementById('editDescricao').value = item.descricao;
  document.getElementById('editValor').value = item.valor;
  document.getElementById('editTipo').value = item.tipo;
  document.getElementById('editCategoria').value = item.categoria || 'Outros';
  document.getElementById('editData').value = item.data || '';
  document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
  editingId = null;
}

document.getElementById('closeModal').addEventListener('click', closeEditModal);
document.getElementById('editModal').addEventListener('click', e => {
  if (e.target === document.getElementById('editModal')) closeEditModal();
});

document.getElementById('saveEditBtn').addEventListener('click', async () => {
  const descricao = document.getElementById('editDescricao').value.trim();
  const valor = parseFloat(document.getElementById('editValor').value);
  const tipo = document.getElementById('editTipo').value;
  const categoria = document.getElementById('editCategoria').value;
  const data = document.getElementById('editData').value;

  if (!descricao || isNaN(valor) || valor <= 0) { alert('Preencha a descrição e um valor válido.'); return; }

  await editItem(editingId, { descricao, valor, tipo, categoria, data });
  closeEditModal();
});
