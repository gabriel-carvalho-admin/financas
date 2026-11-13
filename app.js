// Meu Financeiro — app de finanças pessoais (Firebase Auth + Firestore)
const firebaseConfig = {
  apiKey: "AIzaSyBmFTUgIvcMGA9A4B5Py6Rw3SIO7F9E2w0",
  authDomain: "financas-gabriel-carvalho.firebaseapp.com",
  projectId: "financas-gabriel-carvalho",
  storageBucket: "financas-gabriel-carvalho.firebasestorage.app",
  messagingSenderId: "986463923028",
  appId: "1:986463923028:web:741ca828cfba9bba4bf6c1"
};
const FB = "https://www.gstatic.com/firebasejs/10.14.1/";
const COLS = ["contas", "cartoes", "categorias", "lancamentos", "orcamentos", "pessoas", "fixas", "projetos", "movProjeto"];
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

/* ---------- utilidades ---------- */
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const r2 = n => Math.round(n * 100) / 100;
const brl = v => { v = Math.abs(v) < 0.005 ? 0 : v; return (v < 0 ? "-" : "") + "R$ " + Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const parseMoney = s => { s = String(s ?? "").trim().replace(/[R$\s]/g, ""); if (s.includes(",")) s = s.replace(/\./g, "").replace(",", "."); const n = parseFloat(s); return isFinite(n) ? r2(n) : 0; };
const moneyIn = n => n ? n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }) : "";
const pad = n => String(n).padStart(2, "0");
const hoje = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const ymOf = d => d.slice(0, 7);
const addMes = (ym, n) => { let [y, m] = ym.split("-").map(Number); m += n - 1; y += Math.floor(m / 12); m = ((m % 12) + 12) % 12; return `${y}-${pad(m + 1)}`; };
const ultimoDia = ym => { const [y, m] = ym.split("-").map(Number); return new Date(y, m, 0).getDate(); };
const dataNoMes = (ym, dia) => `${ym}-${pad(Math.min(dia, ultimoDia(ym)))}`;
const addMesData = (data, n) => dataNoMes(addMes(ymOf(data), n), Number(data.slice(8)));
const dataBR = d => d.split("-").reverse().join("/");
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const cls = v => (v < -0.005 ? "neg" : v > 0.005 ? "pos" : "");

const I = {
  inicio: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  lancamentos: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
  contas: '<path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
  cartoes: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h4"/>',
  pessoas: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.900 1.900 6.500 5.500M16 4.800a3.500 3.500 0 0 1 0 6.400M18.500 14.800c1.700.800 2.700 2.500 3 5.200"/>',
  orcamentos: '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
  relatorios: '<circle cx="12" cy="12" r="9"/><path d="M12 3v9h9"/>',
  categorias: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
  config: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  dilcar: '<path d="M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.4l6-.8z"/>',
  mais: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>'
};
const ico = n => `<svg class="ico" viewBox="0 0 24 24">${I[n]}</svg>`;
const LOGO = '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="11" fill="none" stroke="#3b7ddd" stroke-width="6"/><path d="M16 5a11 11 0 0 1 9.5 16.5" fill="none" stroke="#2e9e5b" stroke-width="6" stroke-linecap="round"/></svg>';
const NAV = [["inicio", "Início"], ["lancamentos", "Lançamentos"], ["contas", "Contas"], ["cartoes", "Cartões"], ["pessoas", "Pessoas"], ["orcamentos", "Orçamentos"], ["relatorios", "Relatórios"], ["categorias", "Categorias"], ["dilcar", "Dilcar Eventos"], ["config", "Ajustes"]];
const EMOJIS = ["🍽️","🛒","🏠","🚗","⛽","💊","🎓","🎮","👨‍👩‍👧","👕","✈️","📱","💡","🐶","🎁","💼","💰","🛍️","📅","🏋️","☕","🧾","📦","➕"];
const GRUPOS_EV = ["Buffet", "Bebidas", "Decoração", "Equipe", "Som e luz", "Locação", "Transporte", "Outros"];
const PALETA = ["#4a9be0", "#f5b335", "#e0564a", "#7e57c2", "#2f8f83", "#f29a38", "#3f51b5", "#26a69a", "#e57373", "#78909c"];
const GRUPOS = [["familia", "Família"], ["parentes", "Parentes"], ["amigos", "Amigos"]];
const grupoDe = p => GRUPOS.some(([k]) => k === p.grupo) ? p.grupo : "familia";
const CATS_PADRAO = [
  ["Alimentação","🍽️","#f5b335","despesa"],["Mercado","🛒","#f29a38","despesa"],["Moradia","🏠","#7e57c2","despesa"],["Carro","🚗","#e0564a","despesa"],
  ["Contas fixas","📅","#4a9be0","despesa"],["Saúde","💊","#e57373","despesa"],["Educação","🎓","#2f8f83","despesa"],["Lazer","🎮","#3f51b5","despesa"],
  ["Família","👨‍👩‍👧","#26a69a","despesa"],["Outros","📦","#78909c","despesa"],
  ["Salário","💼","#43a047","receita"],["Vendas","🛍️","#26a69a","receita"],["Outras receitas","➕","#66bb6a","receita"]
];

/* ---------- estado ---------- */
const S = { cartao: null, proj: null, user: null, demo: false, mes: ymOf(hoje()), view: "inicio", filtro: "todos", busca: "", aba: "despesa", carregado: false,
  data: Object.fromEntries(COLS.map(c => [c, []])) };
let store = null, fb = null, pend = false;
const render = () => { if (pend) return; pend = true; requestAnimationFrame(() => { pend = false; draw(); }); };
const by = (col, id) => S.data[col].find(x => x.id === id);
const contasOrd = () => [...S.data.contas].sort((a, b) => (a.ordem ?? 1e9) - (b.ordem ?? 1e9) || a.nome.localeCompare(b.nome));
const cat = id => id === "__emp" ? { nome: "Empréstimos", icone: "🤝", cor: "#5b6ee0" } : by("categorias", id) || { nome: "Sem categoria", icone: "📦", cor: "#90a4ae" };
const toast = m => { const t = document.createElement("div"); t.className = "toast"; t.textContent = m; document.body.append(t); setTimeout(() => t.remove(), 2600); };
try { if (localStorage.getItem("mf-dark") === "1") document.documentElement.classList.add("dark"); } catch (e) {}

/* ---------- armazenamento ---------- */
function demoStore() {
  const D = S.data;
  return {
    async add(col, o) { const id = uid(); D[col].push({ ...o, id }); render(); return id; },
    async addMany(col, arr) { arr.forEach(o => D[col].push({ ...o, id: uid() })); render(); },
    async set(col, id, o) { const i = D[col].findIndex(x => x.id === id); if (i >= 0) D[col][i] = { ...o, id }; render(); },
    async del(col, ids) { ids = [].concat(ids); D[col] = D[col].filter(x => !ids.includes(x.id)); render(); }
  };
}
function fireStore(u) {
  const { db, F } = fb, base = col => F.collection(db, "users", u.uid, col);
  const limpo = o => { const c = { ...o }; delete c.id; return c; };
  const prontos = new Set();
  COLS.forEach(col => F.onSnapshot(base(col), snap => {
    S.data[col] = snap.docs.map(d => ({ ...d.data(), id: d.id }));
    prontos.add(col); if (prontos.size >= COLS.length) S.carregado = true;
    render();
  }, e => toast("Erro ao ler dados: " + e.code)));
  const lote = async (col, arr, fn) => { for (let i = 0; i < arr.length; i += 400) { const b = F.writeBatch(db); arr.slice(i, i + 400).forEach(x => fn(b, x)); await b.commit(); } };
  return {
    add: (col, o) => F.addDoc(base(col), limpo(o)).then(r => r.id),
    addMany: (col, arr) => lote(col, arr, (b, o) => b.set(F.doc(base(col)), limpo(o))),
    set: (col, id, o) => F.setDoc(F.doc(base(col), id), limpo(o)),
    del: (col, ids) => lote(col, [].concat(ids), (b, id) => b.delete(F.doc(base(col), id)))
  };
}
async function semearPadrao() {
  await store.addMany("categorias", CATS_PADRAO.map(([nome, icone, cor, tipo]) => ({ nome, icone, cor, tipo })));
  await store.add("contas", { nome: "Carteira", saldoInicial: 0, cor: "#607d8b" });
}
function semearDemo() {
  const D = S.data, m = S.mes, ant = addMes(m, -1), id = () => uid();
  D.categorias = CATS_PADRAO.map(([nome, icone, cor, tipo]) => ({ id: id(), nome, icone, cor, tipo }));
  const c = n => D.categorias.find(x => x.nome === n).id;
  D.contas = [{ id: "a", nome: "Carteira", saldoInicial: 150, cor: "#607d8b" }, { id: "b", nome: "Conta corrente", saldoInicial: 290, cor: "#7e57c2" }, { id: "p", nome: "Poupança", saldoInicial: 5000, cor: "#f29a38" }];
  D.cartoes = [{ id: "k", nome: "Cartão roxo", bandeira: "Mastercard", limite: 6000, fechamento: 10, vencimento: 17, contaId: "b", cor: "#7e22ce", pagas: {} }];
  const L = (tipo, descricao, valor, dia, categoria, extra = {}) => ({ id: id(), tipo, descricao, valor, data: dataNoMes(m, dia), categoriaId: categoria ? c(categoria) : "", contaId: "b", efetivada: true, recorrencia: "variavel", ...extra });
  D.lancamentos = [
    L("receita", "Salário", 4200, 5, "Salário", { recorrencia: "fixa" }),
    L("receita", "Venda avulsa", 380, 9, "Vendas", { contaId: "a" }),
    L("despesa", "Aluguel", 1200, 6, "Moradia", { recorrencia: "fixa" }),
    L("despesa", "Internet", 99.9, 8, "Contas fixas", { recorrencia: "fixa" }),
    L("despesa", "Supermercado", 412.35, 7, "Mercado", { contaId: "", cartaoId: "k" }),
    L("despesa", "Combustível", 220, 4, "Carro", { contaId: "", cartaoId: "k" }),
    L("despesa", "Notebook 2/6", 350, 3, "Educação", { contaId: "", cartaoId: "k", recorrencia: "parcelada", parcela: 2, parcelas: 6 }),
    L("despesa", "Almoço", 38, 11, "Alimentação", { contaId: "a" }),
    L("despesa", "Cinema", 64, 12, "Lazer"),
    L("despesa", "Farmácia", 87.4, 20, "Saúde", { efetivada: false }),
    L("despesa", "Energia", 185, 22, "Contas fixas", { efetivada: false, recorrencia: "fixa" }),
    L("transferencia", "Guardar na poupança", 500, 6, "", { contaDestinoId: "p" }),
    { ...L("receita", "Salário", 4200, 5, "Salário", { recorrencia: "fixa" }), data: dataNoMes(ant, 5) },
    { ...L("despesa", "Aluguel", 1200, 6, "Moradia", { recorrencia: "fixa" }), data: dataNoMes(ant, 6) },
    { ...L("despesa", "Supermercado", 890, 14, "Mercado"), data: dataNoMes(ant, 14) },
    { id: id(), tipo: "despesa", descricao: "Restaurante", valor: 142, data: dataNoMes(ant, 25), categoriaId: c("Alimentação"), contaId: "", cartaoId: "k", efetivada: true, recorrencia: "variavel" }
  ];
  D.pessoas = [{ id: "m", nome: "Mãe", cor: "#e0564a", grupo: "familia" }, { id: "i", nome: "Irmão", cor: "#2f8f83", grupo: "familia" }, { id: "t", nome: "Tia", cor: "#7e57c2", grupo: "parentes" }, { id: "x", nome: "Amigo", cor: "#f29a38", grupo: "amigos" }];
  D.lancamentos.filter(l => ["Farmácia", "Supermercado"].includes(l.descricao)).forEach(l => l.pessoaId = "m");
  D.lancamentos.filter(l => ["Notebook 2/6", "Cinema"].includes(l.descricao)).forEach(l => l.pessoaId = "i");
  D.lancamentos.forEach(l => { const sg = { Combustível: "Gasolina", Supermercado: "Compras do mês", Almoço: "Restaurante", Farmácia: "Remédios", Internet: "Internet", Energia: "Luz" }[l.descricao]; if (sg) l.subgrupo = sg; });
  D.fixas = [{ id: "fa", nome: "Água", dia: 10, categoriaId: c("Contas fixas"), contaId: "b" }, { id: "fl", nome: "Luz", dia: 22, categoriaId: c("Contas fixas"), contaId: "b" }, { id: "fi", nome: "Internet", dia: 8, categoriaId: c("Contas fixas"), contaId: "b" }];
  D.lancamentos.filter(l => ymOf(l.data) === m).forEach(l => { const f = { Energia: "fl", Internet: "fi" }[l.descricao]; if (f) Object.assign(l, { fixaId: f, mesRef: m, vencimento: l.data, descricao: f === "fl" ? "Luz" : l.descricao }); });
  D.projetos = [{ id: "p1", nome: "Casamento Ana e João", cliente: "Ana Souza", data: dataNoMes(addMes(m, 1), 12), valor: 18000, status: "andamento", cor: "#7e57c2" }, { id: "p2", nome: "Aniversário 15 anos", cliente: "Família Lima", data: dataNoMes(ant, 20), valor: 9000, status: "concluido", cor: "#f29a38" }];
  const M = (projetoId, tipo, descricao, valor, data, grupo = "", subgrupo = "") => ({ id: id(), projetoId, tipo, descricao, valor, data, grupo, subgrupo });
  D.movProjeto = [M("p1", "recebimento", "Sinal (30%)", 5400, dataNoMes(ant, 10)), M("p1", "recebimento", "2ª parcela", 6000, dataNoMes(m, 5)),
    M("p1", "gasto", "Carnes", 2100, dataNoMes(m, 8), "Buffet", "Carnes"), M("p1", "gasto", "Bebidas", 1350, dataNoMes(m, 9), "Bebidas", "Refrigerante e água"), M("p1", "gasto", "Flores", 1800, dataNoMes(m, 3), "Decoração", "Flores"),
    M("p1", "gasto", "Toalhas e sousplat", 650, dataNoMes(ant, 28), "Decoração", "Locação de peças"), M("p1", "gasto", "Garçons", 1200, dataNoMes(m, 11), "Equipe", "Garçons"), M("p1", "gasto", "Sobremesas", 900, dataNoMes(m, 10), "Buffet", "Doces"),
    M("p2", "recebimento", "Pagamento integral", 9000, dataNoMes(ant, 15)), M("p2", "gasto", "Buffet completo", 4200, dataNoMes(ant, 18), "Buffet", "Salgados"), M("p2", "gasto", "DJ", 1500, dataNoMes(ant, 20), "Som e luz", "DJ")];
  D.orcamentos = [{ id: id(), categoriaId: c("Mercado"), valor: 900 }, { id: id(), categoriaId: c("Alimentação"), valor: 300 }, { id: id(), categoriaId: c("Lazer"), valor: 200 }];
}

/* ---------- cálculos ---------- */
// A fatura leva o nome do mês do vencimento. Se o cartão vence antes do dia de fechamento (ex.: fecha dia 30, vence dia 6), ela fecha no mês anterior.
const fechaAntes = c => (c?.vencimento || 10) <= (c?.fechamento || 31);
const fechData = (c, ym) => dataNoMes(fechaAntes(c) ? addMes(ym, -1) : ym, c.fechamento || 31);
const fatMes = l => { if (l.faturaRef) return l.faturaRef; const c = by("cartoes", l.cartaoId), base = Number(l.data.slice(8)) > (c?.fechamento || 31) ? addMes(ymOf(l.data), 1) : ymOf(l.data); return fechaAntes(c) ? addMes(base, 1) : base; };
const fatItens = (cid, ym) => S.data.lancamentos.filter(l => l.cartaoId === cid && fatMes(l) === ym);
const fatTotal = (cid, ym) => r2(fatItens(cid, ym).reduce((s, l) => s + l.valor, 0));
const emAberto = c => r2(S.data.lancamentos.filter(l => l.cartaoId === c.id && !c.pagas?.[fatMes(l)]).reduce((s, l) => s + l.valor, 0));
function movimentos(contaId) {
  const out = [];
  for (const l of S.data.lancamentos) {
    if (l.cartaoId) continue;
    if (l.tipo === "receita" && l.contaId === contaId) out.push({ d: l.data, v: l.valor, ok: l.efetivada, t: "r" });
    else if (l.tipo === "despesa" && l.contaId === contaId) out.push({ d: l.data, v: -l.valor, ok: l.efetivada, t: "d" });
    else if (l.tipo === "transferencia") {
      if (l.contaId === contaId) out.push({ d: l.data, v: -l.valor, ok: l.efetivada, t: "td" });
      if (l.contaDestinoId === contaId) out.push({ d: l.data, v: l.valor, ok: l.efetivada, t: "tc" });
    }
  }
  for (const c of S.data.cartoes) {
    for (const [ym, p] of Object.entries(c.pagas || {})) if (p.contaId === contaId) out.push({ d: p.data, v: -p.valor, ok: true, t: "d" });
    if (c.contaId === contaId) {
      const meses = new Set(S.data.lancamentos.filter(l => l.cartaoId === c.id).map(fatMes));
      for (const ym of meses) if (!c.pagas?.[ym]) out.push({ d: dataNoMes(ym, c.vencimento || 10), v: -fatTotal(c.id, ym), ok: false, t: "d" });
    }
  }
  return out;
}
function resumoConta(c, ym) {
  const mv = movimentos(c.id), ini0 = `${ym}-01`, fim = `${ym}-31`;
  const soma = f => r2(mv.filter(f).reduce((s, x) => s + x.v, 0));
  const noMes = x => x.d >= ini0 && x.d <= fim;
  const inicial = r2((c.saldoInicial || 0) + soma(x => x.ok && x.d < ini0));
  const rec = soma(x => x.ok && noMes(x) && x.t === "r"), des = -soma(x => x.ok && noMes(x) && x.t === "d");
  const tc = soma(x => x.ok && noMes(x) && x.t === "tc"), td = -soma(x => x.ok && noMes(x) && x.t === "td");
  const saldo = r2(inicial + rec - des + tc - td);
  const previsto = r2((c.saldoInicial || 0) + soma(x => x.d <= fim));
  return { inicial, rec, des, tc, td, saldo, previsto };
}
const doMes = (tipo, ym = S.mes) => S.data.lancamentos.filter(l => l.tipo === tipo && ymOf(l.data) === ym);
const total = arr => r2(arr.reduce((s, l) => s + l.valor, 0));
function porCategoria(arr) {
  const m = new Map();
  arr.forEach(l => { const k = l.emprestimo ? "__emp" : l.categoriaId || ""; m.set(k, (m.get(k) || 0) + l.valor); });
  const t = total(arr) || 1;
  return [...m].map(([id, v]) => ({ id, c: cat(id), v: r2(v), p: v / t * 100 })).sort((a, b) => b.v - a.v);
}

/* ---------- componentes ---------- */
const claro = cor => { const m = /^#?([0-9a-f]{6})$/i.exec(cor || ""); if (!m) return false; const n = parseInt(m[1], 16); return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 170; };
const av = (txt, cor) => `<span class="av" style="background:${esc(cor || "#90a4ae")}${claro(cor) ? ";color:#1f2937" : ""}">${esc(txt)}</span>`;
const ini = n => (n || "?").trim().slice(0, 2).toUpperCase();
function barras(rows) {
  if (!rows.length) return '<div class="empty">Sem dados neste mês.</div>';
  const max = rows[0].v || 1;
  return `<div class="bars">${rows.slice(0, 8).map(r => `<div class="bar"><span class="n">${esc(r.c.nome)}</span><div><div class="t" style="width:${Math.max(4, r.v / max * 100)}%;background:${esc(r.c.cor)}">${r.p.toFixed(1)}%</div></div></div>`).join("")}</div>`;
}
function donut(segs, centro) {
  const t = segs.reduce((s, x) => s + x.v, 0);
  if (!t) return '<div class="empty">Sem dados neste mês.</div>';
  let acc = 0;
  const arcs = segs.filter(s => s.v > 0).map(s => { const p = s.v / t * 100, o = 25 - acc; acc += p; return `<circle cx="21" cy="21" r="15.915" fill="none" stroke="${esc(s.cor)}" stroke-width="6.5" stroke-dasharray="${p} ${100 - p}" stroke-dashoffset="${o}"/>`; }).join("");
  return `<svg class="donut" viewBox="0 0 42 42">${arcs}<text x="21" y="22" text-anchor="middle" font-size="3.4" font-weight="700" fill="currentColor">${esc(centro)}</text></svg>
  <div class="leg">${segs.map(s => `<div><i style="background:${esc(s.cor)}"></i><span>${esc(s.nome)}</span><b>${brl(s.v)}</b></div>`).join("")}</div>`;
}
function diario(arr, cor) {
  const n = ultimoDia(S.mes), dias = Array(n).fill(0);
  arr.forEach(l => dias[Number(l.data.slice(8)) - 1] += l.valor);
  const max = Math.max(...dias, 1), W = 320, H = 110, x = i => 6 + i * (W - 12) / (n - 1), y = v => H - 16 - v / max * (H - 26);
  const pts = dias.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%"><polygon points="6,${H - 16} ${pts} ${W - 6},${H - 16}" fill="${cor}" opacity=".18"/><polyline points="${pts}" fill="none" stroke="${cor}" stroke-width="1.6"/>
  ${[1, 5, 10, 15, 20, 25, n].map(d => `<text x="${x(d - 1)}" y="${H - 3}" font-size="8" text-anchor="middle" fill="currentColor" opacity=".55">${pad(d)}</text>`).join("")}
  <text x="6" y="9" font-size="8" fill="currentColor" opacity=".55">máx. ${brl(max)}</text></svg>`;
}
const variacao = (a, b) => b > 0 ? `<span class="chip">${a >= b ? "↗" : "↘"} ${Math.abs((a - b) / b * 100).toFixed(0)}% vs. mês anterior</span>` : "";

/* ---------- telas ---------- */
const V = {};
V.inicio = () => {
  const m = S.mes, ant = addMes(m, -1);
  const rs = contasOrd().map(c => ({ c, ...resumoConta(c, m) }));
  const T = k => r2(rs.reduce((s, x) => s + x[k], 0));
  const desp = doMes("despesa"), rec = doMes("receita");
  const fat = r2(S.data.cartoes.reduce((s, c) => s + fatTotal(c.id, m), 0)), fatAnt = r2(S.data.cartoes.reduce((s, c) => s + fatTotal(c.id, ant), 0));
  const rk = porCategoria(desp);
  const rc = k => total(desp.filter(l => (l.recorrencia || "variavel") === k));
  const stat = (cor, sym, v, lbl, extra = "", c = "") => `<div class="card stat"><span class="dot" style="background:${cor}">${sym}</span><div><div class="v ${c}">${brl(v)}</div><small>${lbl}</small>${extra}</div></div>`;
  return `${avisoFixas()}<div class="grid dash">
  <div class="card"><div class="tl">
    <div><span class="v">${brl(T("inicial"))}</span><small>Inicial</small></div>
    <div class="now"><span class="v ${cls(T("saldo"))}">${brl(T("saldo"))}</span><small>Saldo atual</small></div>
    <div><span class="v">${brl(T("previsto"))}</span><small>Previsto</small></div></div></div>
  <div class="card"><h3>Ranking de categorias</h3>${barras(rk)}${rk.length ? `<div class="sum">Total gasto no mês: ${brl(total(desp))}</div>` : ""}</div>
  <div class="c-side">
    ${cardFixas()}
    <div class="card"><h3>Orçamentos de despesas <button class="link" data-act="nav" data-v="orcamentos">ver</button></h3>${orcLista(true)}</div>
    <div class="card"><h3>Despesas por recorrência</h3>${donut([{ nome: "Fixas", cor: "#4a9be0", v: rc("fixa") }, { nome: "Parceladas", cor: "#f5b335", v: rc("parcelada") }, { nome: "Variáveis", cor: "#e0564a", v: rc("variavel") }], brl(total(desp)))}</div>
  </div>
  <div class="c-main">
    <div class="stats">
      ${stat("#3b7ddd", "🏦", T("saldo"), "Saldo nas contas", "", cls(T("saldo")))}
      ${stat("#2e9e5b", "＋", total(rec), "Total recebido", variacao(total(rec), total(doMes("receita", ant))), "pos")}
      ${stat("#d9483b", "－", total(desp), "Total gasto", variacao(total(desp), total(doMes("despesa", ant))), "neg")}
      ${stat("#5b6ee0", "💳", fat, "Total faturas", variacao(fat, fatAnt))}
    </div>
    <div class="card"><h3>Contas <button class="link" data-act="nav" data-v="contas">ver</button></h3>${tabContas(rs, true)}</div>
  </div></div>`;
};
function tabContas(rs, curto) {
  if (!rs.length) return '<div class="empty">Nenhuma conta cadastrada.</div>';
  const T = k => r2(rs.reduce((s, x) => s + x[k], 0)), td = (v, c = "") => `<td class="${c}">${brl(v)}</td>`;
  return `<div style="overflow:auto"><table><thead><tr><th>Descrição</th>${curto ? "" : '<th class="hs">Saldo inicial</th>'}<th>Receitas</th><th>Despesas</th>${curto ? "" : '<th class="hs">Transf. créd.</th><th class="hs">Transf. déb.</th>'}<th>Saldo</th><th class="hs">Previsto</th></tr></thead>
  <tbody>${rs.map(x => `<tr class="click" data-act="editConta" data-id="${x.c.id}"><td><div class="who">${curto ? "" : '<span class="grip" data-act="nada" title="Arrastar para reordenar" aria-label="Arrastar para reordenar">⠿</span>'}${av(ini(x.c.nome), x.c.cor)}${esc(x.c.nome)}</div></td>${curto ? "" : td(x.inicial, "hs " + cls(x.inicial))}${td(x.rec)}${td(x.des)}${curto ? "" : td(x.tc, "hs") + td(x.td, "hs")}${td(x.saldo, "b " + cls(x.saldo))}${td(x.previsto, "hs " + cls(x.previsto))}</tr>`).join("")}</tbody>
  <tfoot><tr><td>Total</td>${curto ? "" : td(T("inicial"), "hs")}${td(T("rec"))}${td(T("des"))}${curto ? "" : td(T("tc"), "hs") + td(T("td"), "hs")}${td(T("saldo"))}${td(T("previsto"), "hs")}</tr></tfoot></table></div>`;
}
V.contas = () => `<div class="tools"><h2 style="flex:1">Contas</h2><button class="btn" data-act="editConta">Nova conta</button></div>
  <div class="card">${tabContas(contasOrd().map(c => ({ c, ...resumoConta(c, S.mes) })))}<div class="sum">Arraste pelo botão ⠿ à esquerda para mudar a ordem das contas.</div></div>`;

const sub = l => {
  const onde = l.cartaoId ? by("cartoes", l.cartaoId)?.nome : by("contas", l.contaId)?.nome;
  if (l.tipo === "transferencia") return `${esc(onde || "?")} → ${esc(by("contas", l.contaDestinoId)?.nome || "?")}`;
  if (l.reembolso) return ["Pagamento recebido", onde].filter(Boolean).map(esc).join(" · ");
  if (l.emprestimo) return ["Empréstimo", l.vencimento ? "pagar até " + dataBR(l.vencimento) : "", onde, by("pessoas", l.pessoaId)?.nome].filter(Boolean).map(esc).join(" · ");
  return [cat(l.categoriaId).nome + (l.subgrupo ? " › " + l.subgrupo : ""), onde, by("pessoas", l.pessoaId)?.nome, l.parcelas ? `${l.parcela}/${l.parcelas}` : l.recorrencia === "fixa" ? "fixa" : ""].filter(Boolean).map(esc).join(" · ");
};
const linha = l => {
  const c = l.tipo === "transferencia" ? { icone: "⇄", cor: "#5b6ee0" } : l.reembolso ? { icone: "↩", cor: by("pessoas", l.pessoaId)?.cor || "#2e9e5b" } : cat(l.emprestimo ? "__emp" : l.categoriaId);
  const sinal = l.tipo === "receita" ? "pos" : l.tipo === "despesa" ? "neg" : "";
  return `<div class="row" data-act="editL" data-id="${l.id}">${av(c.icone, c.cor)}<div class="tx"><div>${esc(l.descricao)}</div><small>${sub(l)}</small></div>
  <span class="val ${sinal}">${l.tipo === "despesa" ? "-" : ""}${brl(l.valor)}</span>${l.cartaoId ? '<span class="ck" style="border:0;color:var(--mut)">💳</span>' : `<button class="ck ${l.efetivada ? "on" : ""}" data-act="toggleL" data-id="${l.id}" title="Efetivada">✓</button>`}</div>`;
};
function listaLanc() {
  const q = S.busca.toLowerCase();
  let arr = S.data.lancamentos.filter(l => ymOf(l.data) === S.mes);
  if (S.filtro === "pendentes") arr = arr.filter(l => !l.efetivada && !l.cartaoId);
  else if (S.filtro !== "todos") arr = arr.filter(l => l.tipo === S.filtro);
  if (q) arr = arr.filter(l => (l.descricao + " " + cat(l.categoriaId).nome + " " + (l.subgrupo || "")).toLowerCase().includes(q));
  if (!arr.length) return '<div class="empty">Nenhum lançamento. Toque em + para adicionar.</div>';
  arr.sort((a, b) => b.data.localeCompare(a.data) || a.descricao.localeCompare(b.descricao));
  let h = "", d = "";
  for (const l of arr) { if (l.data !== d) { d = l.data; h += `<div class="day">${dataBR(d)}</div>`; } h += linha(l); }
  const rec = total(arr.filter(l => l.tipo === "receita")), des = total(arr.filter(l => l.tipo === "despesa"));
  return h + `<div class="sum"><span>Receitas: <b class="pos">${brl(rec)}</b></span><span>Despesas: <b class="neg">${brl(des)}</b></span><span>Resultado: <b class="${cls(rec - des)}">${brl(rec - des)}</b></span></div>`;
}
V.lancamentos = () => `<div class="tools">${[["todos", "Todos"], ["despesa", "Despesas"], ["receita", "Receitas"], ["transferencia", "Transf."], ["pendentes", "Pendentes"]].map(([k, n]) => `<button class="pill ${S.filtro === k ? "on" : ""}" data-act="filtro" data-v="${k}">${n}</button>`).join("")}
  <input class="search" id="busca" placeholder="Pesquisar" value="${esc(S.busca)}"></div><div class="card" id="lista">${listaLanc()}</div>`;

function stFatura(c, m = S.mes) {
  const paga = c.pagas?.[m], ft = fatTotal(c.id, m), fech = fechData(c, m), venc = dataNoMes(m, c.vencimento || 10), fechada = hoje() > fech;
  const tags = `<span class="tag" style="background:${fechada ? "#5b6ee0" : "#3b7ddd"}">${fechada ? "🔒 Fechada" : "Aberta"}</span> ` +
    (paga ? '<span class="tag" style="background:#2e9e5b">✓ Paga</span>' : ft > 0 ? `<span class="tag" style="background:${hoje() > venc ? "#d9483b" : "#f29a38"}">${hoje() > venc ? "Não paga · vencida" : "Não paga"}</span>` : '<span class="tag" style="background:#90a4ae">Sem gastos</span>');
  return { paga, ft, fech, venc, fechada, tags };
}
function paginaCartao(c) {
  const m = S.mes, st = stFatura(c), ab = emAberto(c), disp = r2((c.limite || 0) - ab), mesNome = MESES[Number(m.slice(5)) - 1].toLowerCase();
  const it = fatItens(c.id, m).sort((a, b) => b.data.localeCompare(a.data) || a.descricao.localeCompare(b.descricao)), rk = porCategoria(it);
  const maiores = [...it].sort((a, b) => b.valor - a.valor).slice(0, 8).map(l => ({ c: { nome: l.descricao, cor: cat(l.categoriaId).cor }, v: l.valor, p: l.valor / (st.ft || 1) * 100 }));
  return `<div class="tools"><button class="pill" data-act="voltarCartao">‹ Cartões</button><h2 style="flex:1;min-width:140px">${esc(c.nome)}</h2>
    <button class="btn" data-act="novo" data-cartao="${c.id}">+ Despesa</button><button class="btn ghost" data-act="importar" data-id="${c.id}">⬆ Importar</button><button class="btn ghost" data-act="editCartao" data-id="${c.id}">Editar</button></div>
  <div class="stats" style="margin-bottom:14px">${statBox("#5b6ee0", "💳", c.limite || 0, "Limite")}${statBox("#f29a38", "⏳", ab, "Em aberto (todas as faturas)")}${statBox("#2e9e5b", "✓", disp, "Limite disponível", disp < 0 ? "neg" : "")}${statBox("#d9483b", "－", st.paga ? st.paga.valor : st.ft, `Fatura de ${mesNome}`, st.paga ? "" : "neg")}</div>
  <div class="card" style="margin-bottom:14px"><h3>Fatura de ${mesNome} <span>${st.tags}</span></h3>
    <div class="tri"><div><small>Fechamento</small>${dataBR(st.fech)}</div><div><small>Vencimento</small>${dataBR(st.venc)}</div><div><small>Valor</small><b>${brl(st.paga ? st.paga.valor : st.ft)}</b></div></div>
    <div class="dash-l" style="border-top:1px dashed var(--line);margin:10px 0"></div>
    ${st.paga ? `<div class="ft2"><span class="pos b">✓ Paga em ${dataBR(st.paga.data)}</span><span>com a conta <b>${esc(by("contas", st.paga.contaId)?.nome || "?")}</b> · ${brl(st.paga.valor)}</span><span class="sp"></span><button class="btn ghost" data-act="reabrir" data-id="${c.id}">Reabrir fatura</button></div>`
      : st.ft > 0 ? `<div class="ft2"><span class="${hoje() > st.venc ? "neg b" : "mut"}">${hoje() > st.venc ? "Fatura vencida e ainda não paga." : "Ainda não paga."}</span><span class="sp"></span><button class="btn" data-act="pagar" data-id="${c.id}">Registrar pagamento</button></div>` : '<div class="mut">Nenhum gasto nesta fatura.</div>'}</div>
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr));align-items:start">
    <div class="card"><h3>Gastos por categoria</h3>${donut(rk.map(r => ({ nome: r.c.icone + " " + r.c.nome, cor: r.c.cor, v: r.v })), brl(st.ft))}</div>
    <div class="card"><h3>Maiores gastos</h3>${barras(maiores)}</div>
    <div class="card"><h3>Gastos da fatura <button class="link" data-act="novo" data-cartao="${c.id}">+ novo</button></h3>${it.map(l => `<div class="row" data-act="editL" data-id="${l.id}">${av(cat(l.categoriaId).icone, cat(l.categoriaId).cor)}<div class="tx"><div>${esc(l.descricao)}</div><small>${dataBR(l.data)} · ${sub(l)}</small></div><b class="neg">${brl(l.valor)}</b></div>`).join("") || '<div class="empty">Nenhum gasto nesta fatura.</div>'}
      ${it.length ? `<div class="sum">${it.length} ${it.length === 1 ? "gasto" : "gastos"} · total <b class="neg">${brl(st.ft)}</b></div>` : ""}</div>
  </div>`;
}
V.cartoes = () => {
  const m = S.mes, cs = S.data.cartoes, aberto = S.cartao && by("cartoes", S.cartao);
  if (aberto) return paginaCartao(aberto);
  const cards = cs.map(c => {
    const ab = emAberto(c), disp = r2((c.limite || 0) - ab), st = stFatura(c);
    return `<div class="card pcard" data-act="abrirCartao" data-id="${c.id}"><div class="hd">${av(ini(c.nome), c.cor)}<div class="tx"><b>${esc(c.nome)}</b><small>${esc(c.bandeira || "Cartão de crédito")}</small></div>
      <button class="link mais" data-act="novo" data-cartao="${c.id}" title="Nova despesa">+</button><button data-act="editCartao" data-id="${c.id}" title="Editar">${ico("mais")}</button></div>
      <div class="tri"><div><small>Limite</small>${brl(c.limite || 0)}</div><div><small>Em aberto</small>${brl(ab)}</div><div><small>Limite disp.</small><span class="${disp < 0 ? "neg" : ""}">${brl(disp)}</span></div></div>
      <div class="prog"><i style="width:${Math.min(100, c.limite ? ab / c.limite * 100 : 0)}%;background:${esc(c.cor)}"></i></div>
      <div class="tri" style="margin-top:12px"><div><small>Conta</small>${esc(by("contas", c.contaId)?.nome || "-")}</div><div><small>Fechamento</small>${dataBR(st.fech).slice(0, 5)}</div><div><small>Vencimento</small>${dataBR(st.venc).slice(0, 5)}</div></div>
      <div class="dash-l"></div><div class="fat"><span>Fatura de ${MESES[Number(m.slice(5)) - 1].toLowerCase()}</span><b class="${st.paga ? "" : st.ft > 0 ? "neg" : ""}">${brl(st.paga ? st.paga.valor : st.ft)}</b></div>
      <div class="ft" style="flex-wrap:wrap"><span>${st.tags}</span></div>
      ${st.paga ? `<div class="emp pos">Paga em ${dataBR(st.paga.data)} · conta ${esc(by("contas", st.paga.contaId)?.nome || "?")}</div>` : ""}
      <div class="ft" style="flex-wrap:wrap"><button class="link" data-act="importar" data-id="${c.id}" title="Importar arquivo OFX, CSV ou XLS">⬆ Importar</button>
      ${st.paga ? `<button class="link" data-act="reabrir" data-id="${c.id}">Reabrir fatura</button>` : st.ft > 0 ? `<button class="link" data-act="pagar" data-id="${c.id}">Registrar pagamento</button>` : ""}</div></div>`;
  }).join("");
  const disp = r2(cs.reduce((s, c) => s + (c.limite || 0) - emAberto(c), 0)), fat = r2(cs.reduce((s, c) => s + fatTotal(c.id, m), 0));
  return `<div class="tools"><h2 style="flex:1">Cartões</h2><button class="btn" data-act="editCartao">Novo cartão</button></div>
  ${cs.length ? `<div class="grid cc">${cards}</div><div class="sum"><span>Limite disponível: <b>${brl(disp)}</b></span><span>Total de faturas no mês: <b>${brl(fat)}</b></span></div><div class="sum">Toque em um cartão para ver os gastos, os gráficos e registrar o pagamento da fatura.</div>` : '<div class="card empty">Nenhum cartão cadastrado.</div>'}`;
};

const lancFixa = (f, ym = S.mes) => S.data.lancamentos.find(l => l.fixaId === f.id && l.mesRef === ym);
function statusFixa(f, ym = S.mes) {
  const l = lancFixa(f, ym), venc = l?.vencimento || dataNoMes(ym, f.dia || 10), dm = d => dataBR(d).slice(0, 5), atras = venc < hoje();
  if (l?.efetivada) return { k: 3, l, venc, txt: `Paga em ${dm(l.data)}`, tag: "Paga", cor: "#2e9e5b", pend: false };
  const pend = ym <= ymOf(hoje());
  if (l) return { k: atras ? 0 : 1, l, venc, txt: `${atras ? "Venceu" : "Vence"} em ${dm(venc)}`, tag: atras ? "Atrasada" : "A pagar", cor: atras ? "#d9483b" : "#f29a38", pend };
  return { k: atras ? 0 : 2, l, venc, txt: `Falta lançar · ${atras && pend ? "venceu" : "vence"} dia ${pad(Number(venc.slice(8)))}`, tag: "Lançar", cor: atras && pend ? "#d9483b" : "#3b7ddd", pend };
}
const fixasMes = (ym = S.mes) => S.data.fixas.map(f => ({ f, ...statusFixa(f, ym) })).sort((a, b) => a.k - b.k || a.venc.localeCompare(b.venc));
function cardFixas() {
  const fs = fixasMes(), pagas = fs.filter(x => x.k === 3).length, tot = r2(fs.reduce((s0, x) => s0 + (x.l?.valor || 0), 0));
  return `<div class="card" id="cfixas"><h3>Contas mensais <button class="link" data-act="editFixa">+ nova</button></h3>
  ${fs.map(x => { const c = cat(x.f.categoriaId); return `<div class="row" data-act="lancarFixa" data-id="${x.f.id}">${av(c.icone, c.cor)}<div class="tx"><div>${esc(x.f.nome)}</div><small>${x.txt}</small></div>
    <div class="r"><div class="b">${x.l ? brl(x.l.valor) : "—"}</div><span class="tag" style="background:${x.cor}">${x.tag}</span></div><button data-act="editFixa" data-id="${x.f.id}" title="Editar conta mensal">${ico("mais")}</button></div>`; }).join("")
    || '<div class="empty">Cadastre água, luz, internet… e o app lembra você todo mês.</div>'}
  ${fs.length ? `<div class="sum">${pagas} de ${fs.length} pagas · lançado no mês: <b>${brl(tot)}</b></div>` : ""}</div>`;
}
function avisoFixas() {
  const p = fixasMes().filter(x => x.pend); if (!p.length) return "";
  const at = p.filter(x => x.k === 0).length;
  return `<div class="aviso ${at ? "ruim" : ""}" data-act="lancarFixa" data-id="${p[0].f.id}"><b>${at ? "⚠" : "🔔"} ${p.length} ${p.length === 1 ? "conta mensal pendente" : "contas mensais pendentes"}${at ? ` (${at} ${at === 1 ? "vencida" : "vencidas"})` : ""}:</b> ${p.map(x => `${esc(x.f.nome)} — ${x.txt.toLowerCase()}`).join(" · ")}</div>`;
}
const emprestimos = (pid, ym = S.mes) => S.data.lancamentos.filter(l => l.emprestimo && l.pessoaId === pid && l.data <= `${ym}-31`).sort((a, b) => b.data.localeCompare(a.data));
function formEmprestimo(pid, id) {
  const o = by("lancamentos", id), p = by("pessoas", o ? o.pessoaId : pid); if (!p) return; if (!S.data.contas.length) return toast("Cadastre uma conta primeiro.");
  openForm({ title: `${o ? "Editar empréstimo" : "Empréstimo"} para ${esc(p.nome)}`,
    values: o ? { valor: moneyIn(o.valor), data: o.data, vencimento: o.vencimento || "", contaId: o.contaId, descricao: o.descricao } : { valor: "", data: hoje(), vencimento: addMesData(hoje(), 1), descricao: "" },
    fields: [{ k: "valor", label: "Valor emprestado (R$)", type: "money" }, { k: "data", label: "Data do empréstimo", type: "date" }, { k: "vencimento", label: "Data em que a pessoa deve pagar", type: "date" },
      { k: "contaId", label: "Saiu da conta", type: "select", options: optContas }, { k: "descricao", label: "Observação (opcional)" }],
    onSave: async v => { const valor = parseMoney(v.valor); if (valor <= 0 || !v.data) { toast("Informe o valor e a data do empréstimo."); return false; } if (!v.vencimento) { toast("Informe a data em que a pessoa deve pagar."); return false; }
      if (v.vencimento < v.data) { toast("A data de pagamento não pode ser antes do empréstimo."); return false; }
      const d = { ...(o || {}), tipo: "despesa", emprestimo: true, descricao: (v.descricao || "").trim() || `Empréstimo para ${p.nome}`, valor, data: v.data, vencimento: v.vencimento, categoriaId: "", subgrupo: "", contaId: v.contaId, cartaoId: "", contaDestinoId: "", pessoaId: p.id, efetivada: true, recorrencia: "variavel" };
      o ? await store.set("lancamentos", o.id, d) : await store.add("lancamentos", d); },
    onDelete: o ? () => store.del("lancamentos", o.id) : null });
}
function contaPessoa(pid, ym = S.mes) {
  const fim = `${ym}-31`, ls = S.data.lancamentos.filter(l => l.pessoaId === pid && l.data <= fim);
  const gasto = total(ls.filter(l => l.tipo === "despesa")), pago = total(ls.filter(l => l.tipo === "receita" && l.reembolso));
  return { gasto, pago, deve: r2(gasto - pago) };
}
const gastosDe = pid => doMes("despesa").filter(l => l.pessoaId === pid);
V.pessoas = () => {
  const ps = [...S.data.pessoas].sort((a, b) => (a.ordem ?? 1e9) - (b.ordem ?? 1e9) || a.nome.localeCompare(b.nome)), tudo = total(doMes("despesa")) || 1, validos = new Set(ps.map(p => p.id));
  const mesNome = MESES[Number(S.mes.slice(5)) - 1].toLowerCase();
  const card = (p, arr) => { const t = total(arr), kc = total(arr.filter(l => l.cartaoId)), c = p.id ? contaPessoa(p.id) : null;
    return `<div class="card pcard" data-act="verPessoa" data-id="${p.id}"><div class="hd">${p.id ? '<span class="grip" data-act="nada" title="Arrastar para mudar de grupo ou de ordem" aria-label="Arrastar">⠿</span>' : ""}${av(ini(p.nome), p.cor)}<div class="tx"><b>${esc(p.nome)}</b><small>${arr.length} ${arr.length === 1 ? "despesa" : "despesas"} no mês</small></div>
      <button class="link mais" data-act="novo" data-pessoa="${p.id}" title="Nova despesa">+</button>${p.id ? `<button data-act="editPessoa" data-id="${p.id}" title="Editar">${ico("mais")}</button>` : ""}</div>
      <div class="fat"><span>Gasto em ${mesNome}</span><b class="${t > 0 ? "neg" : ""}">${brl(t)}</b></div>
      ${c ? `<div class="prog" style="margin-top:10px"><i style="width:${c.gasto > 0 ? Math.max(0, Math.min(100, c.pago / c.gasto * 100)) : 0}%;background:var(--ok)"></i></div>
      <div class="tri" style="margin-top:12px"><div><small>Total a cobrar</small>${brl(c.gasto)}</div><div><small>Já pagou</small><span class="pos">${brl(c.pago)}</span></div><div><small>${c.deve < -0.005 ? "Crédito" : "Ainda deve"}</small><b class="${c.deve > 0.005 ? "neg" : "pos"}">${brl(Math.abs(c.deve))}</b></div></div>
      ${(() => { const es = emprestimos(p.id); if (!es.length) return ""; const prox = es.filter(e => e.vencimento).map(e => e.vencimento).sort(), venc = c.deve > 0.005 && prox.some(d => d < hoje()), alvo = prox.find(d => d >= hoje()) || prox[prox.length - 1];
        return `<div class="emp ${venc ? "neg" : "mut"}">🤝 Emprestado: <b>${brl(total(es))}</b>${alvo ? ` · ${venc ? "venceu em " + dataBR(prox.find(d => d < hoje())) : "pagar até " + dataBR(alvo)}` : ""}</div>`; })()}
      <div class="dash-l"></div><div class="ft" style="margin-top:0;flex-wrap:wrap"><span class="tag" style="background:${c.deve > 0.005 ? "#d9483b" : "#2e9e5b"}">${c.deve > 0.005 ? "Deve" : c.deve < -0.005 ? "Pagou a mais" : "Quitado"}</span><span><button class="link" data-act="emprestar" data-id="${p.id}">Emprestar</button> &nbsp; <button class="link" data-act="pagarPessoa" data-id="${p.id}">Registrar pagamento</button></span></div>`
      : `<div class="prog" style="margin-top:10px"><i style="width:${Math.min(100, t / tudo * 100)}%;background:${esc(p.cor)}"></i></div>
      <div class="tri" style="margin-top:12px"><div><small>No cartão</small>${brl(kc)}</div><div><small>Em conta</small>${brl(r2(t - kc))}</div><div><small>Do total</small>${(t / tudo * 100).toFixed(0)}%</div></div>`}</div>`; };
  const meus = doMes("despesa").filter(l => !validos.has(l.pessoaId));
  const outros = r2(ps.reduce((s0, p) => s0 + total(gastosDe(p.id)), 0));
  return `<div class="tools"><h2 style="flex:1">Gastos por pessoa</h2><button class="btn" data-act="editPessoa">Nova pessoa</button></div>
  <div class="grid cc">${card({ id: "", nome: "Eu", cor: "#3b7ddd" }, meus)}</div>
  ${GRUPOS.map(([k, n]) => { const g = ps.filter(p => grupoDe(p) === k), deve = r2(g.reduce((s0, p) => s0 + Math.max(0, contaPessoa(p.id).deve), 0));
    return `<div class="gh"><h3>${n}</h3><span>${g.length} ${g.length === 1 ? "pessoa" : "pessoas"} · a receber <b class="${deve > 0 ? "neg" : ""}">${brl(deve)}</b></span></div>
    <div class="grid cc pgrp" data-grupo="${k}">${g.map(p => card(p, gastosDe(p.id))).join("")}<div class="vazio">Arraste alguém para cá</div></div>`; }).join("")}
  <div class="sum"><span>Meus gastos no mês: <b>${brl(total(meus))}</b></span><span>Gastos de outras pessoas no mês: <b>${brl(outros)}</b></span><span>Total a receber até ${mesNome}: <b class="neg">${brl(r2(ps.reduce((s0, p) => s0 + Math.max(0, contaPessoa(p.id).deve), 0)))}</b></span></div>
  <div class="sum">${ps.length ? "Total a cobrar (gastos + empréstimos), já pagou e ainda deve somam tudo desde o início até o mês selecionado. Arraste pelo botão ⠿ para mudar a pessoa de grupo ou de ordem." : ""}</div>
  ${ps.length ? "" : '<div class="sum">Cadastre as pessoas da casa e, em cada despesa, escolha de quem é o gasto.</div>'}`;
};
function orcLista(curto) {
  const desp = doMes("despesa"), os = S.data.orcamentos;
  if (!os.length) return '<div class="empty">Nenhum orçamento definido.</div>';
  return os.map(o => {
    const c = cat(o.categoriaId), g = total(desp.filter(l => l.categoriaId === o.categoriaId)), p = o.valor ? g / o.valor * 100 : 0, resta = r2(o.valor - g);
    return `<div class="row" data-act="editOrc" data-id="${o.id}">${av(c.icone, c.cor)}<div class="tx"><div style="display:flex;justify-content:space-between"><span>${esc(c.nome)}</span><b class="${cls(resta)}">${brl(resta)}</b></div>
    <div class="prog" style="margin-top:5px"><i style="width:${Math.min(100, p)}%;background:${p > 100 ? "var(--bad)" : esc(c.cor)}"></i></div>
    ${curto ? "" : `<small>${brl(g)} de ${brl(o.valor)} · ${p.toFixed(0)}% utilizado</small>`}</div>${curto ? `<small class="mut">${p.toFixed(0)}%</small>` : ""}</div>`;
  }).join("");
}
V.orcamentos = () => `<div class="tools"><h2 style="flex:1">Orçamentos</h2><button class="btn" data-act="editOrc">Novo orçamento</button></div>
  <div class="card"><div class="sum" style="margin:0 0 6px">Valor que sobra em cada categoria neste mês</div>${orcLista(false)}</div>`;

V.relatorios = () => {
  const arr = doMes(S.aba), rk = porCategoria(arr), cor = S.aba === "despesa" ? "#d9483b" : "#2e9e5b";
  return `<div class="tabs"><button class="d ${S.aba === "despesa" ? "on" : ""}" data-act="aba" data-v="despesa">Despesas</button><button class="rc ${S.aba === "receita" ? "on" : ""}" data-act="aba" data-v="receita">Receitas</button></div>
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(290px,1fr))">
    <div class="card"><h3>Ranking de categorias</h3>${barras(rk)}</div>
    <div class="card"><h3>Evolução diária</h3>${arr.length ? diario(arr, cor) : '<div class="empty">Sem dados neste mês.</div>'}</div>
    <div class="card"><h3>Grupos e subgrupos</h3>${rk.length ? rk.map(g => { const sm = new Map(); arr.filter(l => (l.categoriaId || "") === g.id).forEach(l => sm.set(l.subgrupo || "Geral", (sm.get(l.subgrupo || "Geral") || 0) + l.valor)); const subs = [...sm].sort((a, b) => b[1] - a[1]);
      return `<div class="gr"><div class="gl"><i class="lg" style="background:${esc(g.c.cor)}"></i><b>${esc(g.c.icone + " " + g.c.nome)}</b><span>${g.p.toFixed(0)}%</span><b>${brl(g.v)}</b></div><div class="prog"><i style="width:${g.v / (rk[0].v || 1) * 100}%;background:${esc(g.c.cor)}"></i></div>
      ${subs.length === 1 && subs[0][0] === "Geral" ? "" : subs.map(([n, v]) => `<div class="sg"><span>${esc(n)}</span><div class="prog"><i style="width:${v / (g.v || 1) * 100}%;background:${esc(g.c.cor)};opacity:.6"></i></div><span>${brl(v)}</span></div>`).join("")}</div>`; }).join("") : '<div class="empty">Sem dados neste mês.</div>'}</div>
    <div class="card"><h3>${S.aba === "despesa" ? "Despesas" : "Receitas"} por categoria</h3>${donut(rk.map(r => ({ nome: r.c.icone + " " + r.c.nome, cor: r.c.cor, v: r.v })), brl(total(arr)))}</div>
  </div>`;
};
V.categorias = () => {
  const bloco = (t, nome) => `<div class="card"><h3>${nome}</h3>${S.data.categorias.filter(c => c.tipo === t).sort((a, b) => a.nome.localeCompare(b.nome)).map(c => `<div class="row" data-act="editCat" data-id="${c.id}">${av(c.icone, c.cor)}<div class="tx">${esc(c.nome)}</div></div>`).join("") || '<div class="empty">Nenhuma.</div>'}</div>`;
  return `<div class="tools"><h2 style="flex:1">Categorias</h2><button class="btn" data-act="editCat">Nova categoria</button></div>
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">${bloco("despesa", "Despesas")}${bloco("receita", "Receitas")}</div>`;
};
/* ---------- Dilcar Eventos (separado das finanças pessoais) ---------- */
const movs = pid => S.data.movProjeto.filter(x => x.projetoId === pid);
const resumoProj = p => { const ms = movs(p.id), rec = total(ms.filter(x => x.tipo === "recebimento")), gas = total(ms.filter(x => x.tipo === "gasto")); return { rec, gas, lucro: r2(rec - gas), falta: r2((p.valor || 0) - rec) }; };
const statBox = (cor, sym, v, lbl, c = "") => `<div class="card stat"><span class="dot" style="background:${cor}">${sym}</span><div><div class="v ${c}">${brl(v)}</div><small>${lbl}</small></div></div>`;
function gruposDe(ms) {
  const g = new Map();
  ms.filter(x => x.tipo === "gasto").forEach(x => { const k = x.grupo || "Sem grupo", o = g.get(k) || { nome: k, v: 0, subs: new Map() }; o.v += x.valor; const sk = x.subgrupo || "Geral"; o.subs.set(sk, (o.subs.get(sk) || 0) + x.valor); g.set(k, o); });
  return [...g.values()].sort((a, b) => b.v - a.v).map((o, i) => ({ ...o, v: r2(o.v), cor: PALETA[i % PALETA.length], subs: [...o.subs].map(([nome, v]) => ({ nome, v: r2(v) })).sort((a, b) => b.v - a.v) }));
}
function graficoMeses(ms) {
  const meses = [...new Set(ms.map(x => ymOf(x.data)))].sort(); if (!meses.length) return '<div class="empty">Sem lançamentos ainda.</div>';
  const d = meses.map(ym => ({ ym, r: total(ms.filter(x => x.tipo === "recebimento" && ymOf(x.data) === ym)), g: total(ms.filter(x => x.tipo === "gasto" && ymOf(x.data) === ym)) }));
  const max = Math.max(...d.map(x => Math.max(x.r, x.g)), 1), W = 340, H = 170, base = H - 24, slot = (W - 20) / d.length, bw = Math.min(26, slot / 2 - 4), h = v => v / max * (base - 22);
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%"><line x1="8" y1="${base}" x2="${W - 8}" y2="${base}" stroke="currentColor" opacity=".2"/>
  ${d.map((x, i) => { const cx = 10 + slot * i + slot / 2, bar = (v, dx, cor) => v > 0 ? `<rect x="${cx + dx}" y="${base - h(v)}" width="${bw}" height="${h(v)}" rx="4" fill="${cor}"><title>${brl(v)}</title></rect><text x="${cx + dx + bw / 2}" y="${base - h(v) - 4}" font-size="7.5" text-anchor="middle" fill="currentColor" opacity=".7">${v >= 1000 ? (v / 1000).toFixed(1).replace(".", ",") + " mil" : v.toFixed(0)}</text>` : "";
    return bar(x.r, -bw - 2, "#2e9e5b") + bar(x.g, 2, "#d9483b") + `<text x="${cx}" y="${H - 8}" font-size="9" text-anchor="middle" fill="currentColor" opacity=".6">${x.ym.slice(5)}/${x.ym.slice(2, 4)}</text>`; }).join("")}</svg>
  <div class="sum" style="margin-top:4px"><span><i class="lg" style="background:#2e9e5b"></i> Pagamentos recebidos</span><span><i class="lg" style="background:#d9483b"></i> Gastos</span></div>`;
}
function listaProjetos() {
  const ps = [...S.data.projetos].sort((a, b) => (a.data || "9999").localeCompare(b.data || "9999") || a.nome.localeCompare(b.nome));
  const R = ps.map(p => ({ p, ...resumoProj(p) })), T = k => r2(R.reduce((s0, x) => s0 + x[k], 0)), contr = r2(ps.reduce((s0, p) => s0 + (p.valor || 0), 0));
  return `<div class="tools"><h2 style="flex:1">Dilcar Eventos</h2><button class="btn" data-act="editProj">Novo projeto</button></div>
  <div class="stats" style="margin-bottom:14px">${statBox("#5b6ee0", "📋", contr, "Total contratado")}${statBox("#2e9e5b", "＋", T("rec"), "Pagamentos recebidos", "pos")}${statBox("#d9483b", "－", T("gas"), "Gastos dos projetos", "neg")}${statBox("#3b7ddd", "＝", T("lucro"), "Resultado (recebido − gastos)", cls(T("lucro")))}</div>
  ${R.length ? `<div class="grid cc">${R.map(({ p, rec, gas, lucro, falta }) => `<div class="card pcard" data-act="abrirProj" data-id="${p.id}"><div class="hd">${av(ini(p.nome), p.cor)}<div class="tx"><b>${esc(p.nome)}</b><small>${[p.cliente, p.data ? dataBR(p.data) : ""].filter(Boolean).map(esc).join(" · ") || "Projeto"}</small></div><button data-act="editProj" data-id="${p.id}" title="Editar projeto">${ico("mais")}</button></div>
    <div class="tri"><div><small>Contrato</small>${brl(p.valor || 0)}</div><div><small>Recebido</small><span class="pos">${brl(rec)}</span></div><div><small>Gastos</small><span class="neg">${brl(gas)}</span></div></div>
    <div class="prog"><i style="width:${p.valor ? Math.min(100, rec / p.valor * 100) : 0}%;background:var(--ok)"></i></div>
    <div class="dash-l"></div><div class="fat"><span>Resultado</span><b class="${cls(lucro)}">${brl(lucro)}</b></div>
    <div class="ft"><span class="tag" style="background:${p.status === "concluido" ? "#2e9e5b" : "#3b7ddd"}">${p.status === "concluido" ? "Concluído" : "Em andamento"}</span><span class="mut">${falta > 0.005 ? "A receber " + brl(falta) : "Contrato quitado"}</span></div></div>`).join("")}</div>` : '<div class="card empty">Nenhum projeto ainda. Toque em "Novo projeto" para criar o primeiro evento.</div>'}
  <div class="sum"><a class="pill" href="dilcar.html">📱 Lançamento rápido pelo celular</a></div>
  <div class="sum">O dinheiro dos projetos fica separado: não entra nas suas contas, no saldo nem nos relatórios pessoais.</div>`;
}
function paginaProjeto(p) {
  const ms = movs(p.id), r = resumoProj(p), gs = gruposDe(ms), ord = (a, b) => b.data.localeCompare(a.data);
  const li = (x, k) => `<div class="row" data-act="editMov" data-id="${x.id}"><div class="tx"><div>${esc(x.descricao)}</div><small>${dataBR(x.data)}${x.tipo === "gasto" ? " · " + esc([x.grupo || "Sem grupo", x.subgrupo].filter(Boolean).join(" › ")) : ""}</small></div><b class="${k}">${brl(x.valor)}</b></div>`;
  const rec = ms.filter(x => x.tipo === "recebimento").sort(ord), gas = ms.filter(x => x.tipo === "gasto").sort(ord);
  return `<div class="tools"><button class="pill" data-act="voltarProj">‹ Projetos</button><h2 style="flex:1;min-width:160px">${esc(p.nome)}</h2>
    <button class="btn" style="background:var(--ok)" data-act="novoMov" data-tipo="recebimento">+ Pagamento</button><button class="btn" style="background:var(--bad)" data-act="novoMov" data-tipo="gasto">+ Gasto</button><button class="btn ghost" data-act="editProj" data-id="${p.id}">Editar</button></div>
  <div class="sum" style="justify-content:flex-start;margin:0 2px 12px">${[p.cliente ? "Cliente: " + esc(p.cliente) : "", p.data ? "Data do evento: " + dataBR(p.data) : "", p.status === "concluido" ? "Concluído" : "Em andamento"].filter(Boolean).map(t => `<span>${t}</span>`).join("")}</div>
  <div class="stats s5" style="margin-bottom:14px">${statBox("#5b6ee0", "📋", p.valor || 0, "Valor do contrato")}${statBox("#2e9e5b", "＋", r.rec, "Recebido", "pos")}${statBox("#f29a38", "⏳", Math.max(0, r.falta), "A receber")}${statBox("#d9483b", "－", r.gas, "Gastos", "neg")}${statBox("#3b7ddd", "＝", r.lucro, "Resultado até agora", cls(r.lucro))}</div>
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr));align-items:start">
    <div class="card"><h3>Pagamentos x gastos por mês</h3>${graficoMeses(ms)}</div>
    <div class="card"><h3>Gastos por grupo</h3>${donut(gs.map(g => ({ nome: g.nome, cor: g.cor, v: g.v })), brl(r.gas))}</div>
    <div class="card"><h3>Grupos e subgrupos</h3>${gs.length ? gs.map(g => `<div class="gr"><div class="gl"><i class="lg" style="background:${g.cor}"></i><b>${esc(g.nome)}</b><span>${(g.v / (r.gas || 1) * 100).toFixed(0)}%</span><b>${brl(g.v)}</b></div><div class="prog"><i style="width:${g.v / (gs[0].v || 1) * 100}%;background:${g.cor}"></i></div>
      ${g.subs.map(sb => `<div class="sg"><span>${esc(sb.nome)}</span><div class="prog"><i style="width:${sb.v / (g.v || 1) * 100}%;background:${g.cor};opacity:.6"></i></div><span>${brl(sb.v)}</span></div>`).join("")}</div>`).join("") : '<div class="empty">Nenhum gasto lançado.</div>'}</div>
    <div class="card"><h3>Pagamentos recebidos <button class="link" data-act="novoMov" data-tipo="recebimento">+ novo</button></h3>${rec.map(x => li(x, "pos")).join("") || '<div class="empty">Nenhum pagamento recebido.</div>'}${rec.length ? `<div class="sum">Total recebido: <b class="pos">${brl(r.rec)}</b></div>` : ""}</div>
    <div class="card"><h3>Gastos <button class="link" data-act="novoMov" data-tipo="gasto">+ novo</button></h3>${gas.map(x => li(x, "neg")).join("") || '<div class="empty">Nenhum gasto lançado.</div>'}${gas.length ? `<div class="sum">Total de gastos: <b class="neg">${brl(r.gas)}</b></div>` : ""}</div>
  </div>`;
}
V.dilcar = () => { const p = S.proj && by("projetos", S.proj); return p ? paginaProjeto(p) : listaProjetos(); };
V.config = () => `<h2 style="margin-bottom:12px">Ajustes</h2><div class="card" style="max-width:520px">
  <div class="row" data-act="dark"><div class="tx">Tema escuro</div><span class="ck ${document.documentElement.classList.contains("dark") ? "on" : ""}">✓</span></div>
  <div class="row" data-act="csv"><div class="tx"><div>Exportar lançamentos (CSV)</div><small>Abre no Excel ou Google Planilhas</small></div></div>
  <div class="row" data-act="sair"><div class="tx"><div class="neg">Sair</div><small>${esc(S.demo ? "Modo demonstração — nada é salvo" : S.user?.email || "")}</small></div></div></div>
  <div class="sum" style="justify-content:flex-start;max-width:520px">${NAV.slice(2, -1).map(([k, n]) => `<button class="pill" data-act="nav" data-v="${k}">${n}</button>`).join("")}</div>`;

/* ---------- desenho ---------- */
function draw() {
  const root = $("#root");
  if (!S.user && !S.demo) return;
  if (!$("#app")) {
    root.innerHTML = `<div id="app"><header class="top"><div class="logo">${LOGO}<span>meu<b>financeiro</b></span></div><span class="sp"></span>
      <div class="mes"><button data-act="mes" data-v="-1" aria-label="Mês anterior">‹</button><span class="lbl" id="mlbl"></span><button data-act="mes" data-v="1" aria-label="Próximo mês">›</button></div>
      <button class="fab" data-act="novo" aria-label="Novo lançamento">+</button></header>
      <nav class="side" id="side"></nav><main id="main"></main><nav class="bot" id="bot"></nav></div><div id="modal"></div>`;
  }
  $("#mlbl").textContent = `${MESES[Number(S.mes.slice(5)) - 1]} ${S.mes.slice(0, 4)}`;
  const pendHoje = fixasMes(ymOf(hoje())).some(x => x.pend);
  $("#side").innerHTML = NAV.map(([k, n], i) => `${k === "config" || k === "dilcar" ? "<hr>" : ""}<button class="${S.view === k ? "on" : ""}" data-act="nav" data-v="${k}" title="${n}">${ico(k)}${k === "inicio" && pendHoje ? '<i class="ndot"></i>' : ""}</button>`).join("");
  const b = (k, n) => `<button class="${S.view === k ? "on" : ""}" data-act="nav" data-v="${k}">${ico(k === "config" ? "mais" : k)}${k === "inicio" && pendHoje ? '<i class="ndot"></i>' : ""}<span>${n}</span></button>`;
  $("#bot").innerHTML = b("inicio", "Início") + b("lancamentos", "Lançam.") + '<button class="fab" data-act="novo" aria-label="Novo lançamento">+</button>' + b("cartoes", "Cartões") + b("config", "Mais");
  const main = $("#main"), top = main.scrollTop;
  main.innerHTML = !S.demo && !S.carregado ? '<div class="empty">Carregando…</div>' : V[S.view]();
  main.scrollTop = top;
}

/* ---------- formulários ---------- */
function openForm({ title, fields, values = {}, onSave, onDelete, delLabel = "Excluir", extra }) {
  const v = { ...values }, box = $("#modal");
  const vis = f => !f.when || f.when(v);
  const opts = f => (typeof f.options === "function" ? f.options(v) : f.options);
  const body = () => fields.filter(vis).map(f => {
    const val = v[f.k] ?? "";
    if (f.type === "seg") return `<div class="f"><div class="seg">${opts(f).map(([k, n]) => `<button type="button" class="${val === k ? "on" : ""}" data-seg="${f.k}" data-v="${k}">${n}</button>`).join("")}</div></div>`;
    if (f.type === "check") return `<div class="f chk"><input type="checkbox" id="f-${f.k}" data-k="${f.k}" ${f.redraw ? "data-redraw" : ""} ${val ? "checked" : ""}><label for="f-${f.k}">${f.label}</label></div>`;
    if (f.type === "select") { const o = opts(f); if (!o.some(([k]) => k === val)) v[f.k] = o[0]?.[0] ?? ""; return `<div class="f"><label for="f-${f.k}">${f.label}</label><select id="f-${f.k}" data-k="${f.k}" ${f.redraw ? "data-redraw" : ""}>${o.map(([k, n]) => `<option value="${esc(k)}" ${v[f.k] === k ? "selected" : ""}>${esc(n)}</option>`).join("")}</select></div>`; }
    const t = f.type === "money" ? 'type="text" inputmode="decimal" placeholder="0,00"' : f.type === "number" ? 'type="number" inputmode="numeric"' : `type="${f.type || "text"}"`;
    const dl = f.list ? opts({ options: f.list }) : null;
    return `<div class="f"><label for="f-${f.k}">${f.label}</label><input id="f-${f.k}" data-k="${f.k}" ${t} value="${esc(val)}" autocomplete="off" ${dl ? `list="dl-${f.k}"` : ""}>${dl ? `<datalist id="dl-${f.k}">${dl.map(x => `<option value="${esc(x)}">`).join("")}</datalist>` : ""}</div>`;
  }).join("");
  let conf = false;
  const paint = () => {
    box.innerHTML = `<div class="ov"><form class="modal"><h2>${title}</h2><div id="fb">${body()}</div><div class="acts">
      ${onDelete ? `<button type="button" class="btn danger" data-x="del">${delLabel}</button>` : ""}${extra ? `<button type="button" class="btn danger" data-x="extra">${extra.label}</button>` : ""}
      <span class="sp"></span><button type="button" class="btn ghost" data-x="close">Cancelar</button><button class="btn">Salvar</button></div></form></div>`;
    const form = $("form", box);
    form.oninput = e => { const k = e.target.dataset.k; if (!k) return; v[k] = e.target.type === "checkbox" ? e.target.checked : e.target.value; if (e.target.hasAttribute("data-redraw")) $("#fb", box).innerHTML = body(); };
    form.onclick = async e => {
      const t = e.target.closest("[data-seg],[data-x]"); if (!t) { if (e.target.classList.contains("ov")) close(); return; }
      if (t.dataset.seg) { v[t.dataset.seg] = t.dataset.v; $("#fb", box).innerHTML = body(); return; }
      if (t.dataset.x === "close") return close();
      if (!conf || conf !== t.dataset.x) { conf = t.dataset.x; t.textContent = "Confirmar exclusão"; return; }
      await (t.dataset.x === "del" ? onDelete() : extra.fn()); close();
    };
    form.onsubmit = async e => { e.preventDefault(); try { if (await onSave(v) !== false) close(); } catch (err) { toast("Não foi possível salvar: " + (err.code || err.message)); } };
    $(".ov", box).onclick = e => { if (e.target.classList.contains("ov")) close(); };
  };
  const close = () => { box.innerHTML = ""; };
  paint();
}
const optContas = () => contasOrd().map(c => [c.id, c.nome]);
const optCats = t => S.data.categorias.filter(c => c.tipo === t).sort((a, b) => a.nome.localeCompare(b.nome)).map(c => [c.id, `${c.icone} ${c.nome}`]);

function formLanc(orig, cartaoId, pessoaId) {
  if (!S.data.contas.length) return toast("Cadastre uma conta primeiro.");
  const ed = !!orig, o = orig || {};
  const values = ed ? { tipo: o.tipo, descricao: o.descricao, valor: moneyIn(o.valor), data: o.data, categoriaId: o.categoriaId, origem: o.cartaoId ? "k:" + o.cartaoId : "c:" + o.contaId, pessoaId: o.pessoaId || "", subgrupo: o.subgrupo || "", destino: o.contaDestinoId, efetivada: o.efetivada, repetir: "variavel", parcelas: 2 }
    : { tipo: "despesa", descricao: "", valor: "", data: ymOf(hoje()) === S.mes ? hoje() : `${S.mes}-01`, origem: cartaoId ? "k:" + cartaoId : "c:" + contasOrd()[0].id, pessoaId: pessoaId || "", subgrupo: "", efetivada: true, repetir: "variavel", parcelas: 2 };
  openForm({
    title: ed ? "Editar lançamento" : "Novo lançamento", values,
    fields: [
      { k: "tipo", type: "seg", options: [["despesa", "Despesa"], ["receita", "Receita"], ["transferencia", "Transferência"]], when: () => !ed },
      { k: "descricao", label: "Descrição" }, { k: "valor", label: "Valor (R$)", type: "money" }, { k: "data", label: "Data", type: "date" },
      { k: "categoriaId", label: "Categoria (grupo)", type: "select", redraw: true, options: v => optCats(v.tipo), when: v => v.tipo !== "transferencia" && !o.reembolso },
      { k: "subgrupo", label: "Subgrupo (opcional — ex.: Gasolina, Farmácia)", list: v => [...new Set(S.data.lancamentos.filter(l => l.subgrupo && l.categoriaId === v.categoriaId).map(l => l.subgrupo))].sort((a, b) => a.localeCompare(b)), when: v => v.tipo !== "transferencia" && !o.reembolso },
      { k: "origem", label: "Pagar com", type: "select", redraw: true, options: () => [...optContas().map(([k, n]) => ["c:" + k, n]), ...S.data.cartoes.map(c => ["k:" + c.id, "💳 " + c.nome])], when: v => v.tipo === "despesa" },
      { k: "pessoaId", label: "Gasto de quem", type: "select", options: () => [["", "Eu"], ...[...S.data.pessoas].sort((a, b) => a.nome.localeCompare(b.nome)).map(p => [p.id, p.nome])], when: v => v.tipo === "despesa" && S.data.pessoas.length > 0 },
      { k: "origem", label: "Conta", type: "select", options: () => optContas().map(([k, n]) => ["c:" + k, n]), when: v => v.tipo === "receita" },
      { k: "origem", label: "Conta de origem", type: "select", options: () => optContas().map(([k, n]) => ["c:" + k, n]), when: v => v.tipo === "transferencia" },
      { k: "destino", label: "Conta de destino", type: "select", options: optContas, when: v => v.tipo === "transferencia" },
      { k: "efetivada", label: "Já foi paga / recebida", type: "check", when: v => !(v.tipo === "despesa" && v.origem?.startsWith("k:")) },
      { k: "repetir", label: "Repetição", type: "select", redraw: true, options: [["variavel", "Não repete"], ["fixa", "Fixa mensal (próximos 12 meses)"], ["parcelada", "Parcelada"]], when: v => !ed && v.tipo !== "transferencia" },
      { k: "parcelas", label: "Número de parcelas (o valor acima é o total)", type: "number", when: v => !ed && v.tipo !== "transferencia" && v.repetir === "parcelada" }
    ],
    onSave: async v => {
      const valor = parseMoney(v.valor); if (valor <= 0) { toast("Informe um valor maior que zero."); return false; }
      if (!v.data) { toast("Informe a data."); return false; }
      const noCartao = v.tipo === "despesa" && v.origem.startsWith("k:"), id = v.origem.slice(2);
      if (v.tipo === "transferencia" && v.destino === id) { toast("Escolha contas diferentes."); return false; }
      const b = { tipo: v.tipo, descricao: v.descricao.trim() || (v.tipo === "transferencia" ? "Transferência" : cat(v.categoriaId).nome), valor, data: v.data,
        categoriaId: v.tipo === "transferencia" || o.reembolso ? "" : v.categoriaId || "", subgrupo: v.tipo === "transferencia" || o.reembolso ? "" : (v.subgrupo || "").trim(), contaId: noCartao ? "" : id, cartaoId: noCartao ? id : "", contaDestinoId: v.tipo === "transferencia" ? v.destino : "", pessoaId: v.tipo === "despesa" ? v.pessoaId || "" : o.reembolso ? o.pessoaId : "", efetivada: noCartao ? true : !!v.efetivada };
      if (ed) return void await store.set("lancamentos", o.id, { ...o, ...b });
      const rep = v.tipo === "transferencia" ? "variavel" : v.repetir;
      if (rep === "variavel") return void await store.add("lancamentos", { ...b, recorrencia: "variavel" });
      const n = rep === "fixa" ? 12 : Math.max(2, Math.min(72, Math.floor(Number(v.parcelas) || 2))), g = uid(), cada = r2(valor / n);
      await store.addMany("lancamentos", Array.from({ length: n }, (_, i) => ({ ...b, recorrencia: rep, grupoId: g, data: addMesData(v.data, i), efetivada: noCartao ? true : i === 0 && b.efetivada,
        ...(rep === "parcelada" ? { valor: i === n - 1 ? r2(valor - cada * (n - 1)) : cada, parcela: i + 1, parcelas: n } : {}) })));
    },
    onDelete: ed ? () => store.del("lancamentos", o.id) : null,
    extra: ed && o.grupoId ? { label: "Excluir este e os próximos", fn: () => store.del("lancamentos", S.data.lancamentos.filter(l => l.grupoId === o.grupoId && l.data >= o.data).map(l => l.id)) } : null
  });
}
const crud = (col, title, fields, defaults, prep, podeExcluir) => id => {
  const o = by(col, id);
  openForm({ title: (o ? "Editar " : "Nov" + title[0] + " ") + title.slice(1), fields, values: o ? prep.in(o) : defaults(),
    onSave: async v => { const d = prep.out(v); if (!d) return false; o ? await store.set(col, o.id, { ...o, ...d }) : await store.add(col, d); },
    onDelete: o ? async () => { const motivo = podeExcluir?.(o); if (motivo) return toast(motivo); await store.del(col, o.id); } : null });
};
const formConta = crud("contas", "aconta", [{ k: "nome", label: "Nome da conta" }, { k: "saldoInicial", label: "Saldo inicial (R$)", type: "money" }, { k: "cor", label: "Cor", type: "color" }],
  () => ({ nome: "", saldoInicial: "", cor: "#3b7ddd" }),
  { in: o => ({ ...o, saldoInicial: (o.saldoInicial < 0 ? "-" : "") + moneyIn(Math.abs(o.saldoInicial || 0)) }), out: v => v.nome.trim() ? { nome: v.nome.trim(), saldoInicial: parseMoney(v.saldoInicial), cor: v.cor } : (toast("Informe o nome."), null) },
  o => S.data.lancamentos.some(l => l.contaId === o.id || l.contaDestinoId === o.id) ? "Esta conta tem lançamentos. Exclua-os antes." : S.data.cartoes.some(c => c.contaId === o.id) ? "Esta conta está ligada a um cartão." : "");
const formCartao = crud("cartoes", "ocartão", [{ k: "nome", label: "Nome do cartão" }, { k: "bandeira", label: "Bandeira" }, { k: "limite", label: "Limite (R$)", type: "money" }, { k: "fechamento", label: "Dia de fechamento da fatura", type: "number" }, { k: "vencimento", label: "Dia de vencimento (se for menor que o fechamento, vence no mês seguinte)", type: "number" }, { k: "contaId", label: "Conta de pagamento", type: "select", options: optContas }, { k: "cor", label: "Cor", type: "color" }],
  () => ({ nome: "", bandeira: "", limite: "", fechamento: 10, vencimento: 17, cor: "#7e22ce" }),
  { in: o => ({ ...o, limite: moneyIn(o.limite) }), out: v => { const dia = x => Math.max(1, Math.min(31, Math.floor(Number(x) || 1))); return v.nome.trim() ? { nome: v.nome.trim(), bandeira: (v.bandeira || "").trim(), limite: parseMoney(v.limite), fechamento: dia(v.fechamento), vencimento: dia(v.vencimento), contaId: v.contaId || "", cor: v.cor } : (toast("Informe o nome."), null); } },
  o => S.data.lancamentos.some(l => l.cartaoId === o.id) ? "Este cartão tem despesas. Exclua-as antes." : "");
const formCat = crud("categorias", "acategoria", [{ k: "tipo", type: "seg", options: [["despesa", "Despesa"], ["receita", "Receita"]] }, { k: "nome", label: "Nome" }, { k: "icone", label: "Ícone", type: "select", options: EMOJIS.map(e => [e, e]) }, { k: "cor", label: "Cor", type: "color" }],
  () => ({ tipo: "despesa", nome: "", icone: "📦", cor: "#4a9be0" }),
  { in: o => o, out: v => v.nome.trim() ? { tipo: v.tipo, nome: v.nome.trim(), icone: v.icone, cor: v.cor } : (toast("Informe o nome."), null) },
  o => S.data.lancamentos.some(l => l.categoriaId === o.id) ? "Esta categoria tem lançamentos." : S.data.orcamentos.some(x => x.categoriaId === o.id) ? "Esta categoria tem orçamento." : "");
const formPessoa = crud("pessoas", "apessoa", [{ k: "nome", label: "Nome" }, { k: "grupo", label: "Grupo", type: "select", options: GRUPOS }, { k: "cor", label: "Cor", type: "color" }],
  () => ({ nome: "", grupo: "familia", cor: "#e0564a" }), { in: o => ({ ...o, grupo: grupoDe(o) }), out: v => v.nome.trim() ? { nome: v.nome.trim(), grupo: v.grupo || "familia", cor: v.cor } : (toast("Informe o nome."), null) },
  o => S.data.lancamentos.some(l => l.pessoaId === o.id) ? "Esta pessoa tem despesas. Troque ou exclua as despesas antes." : "");
const formFixa = crud("fixas", "aconta mensal", [{ k: "nome", label: "Nome (ex.: Água, Luz)" }, { k: "dia", label: "Dia em que costuma vencer", type: "number" }, { k: "categoriaId", label: "Categoria", type: "select", options: () => optCats("despesa") }, { k: "contaId", label: "Conta em que costuma pagar", type: "select", options: optContas }],
  () => ({ nome: "", dia: 10 }), { in: o => o, out: v => v.nome.trim() ? { nome: v.nome.trim(), dia: Math.max(1, Math.min(31, Math.floor(Number(v.dia) || 10))), categoriaId: v.categoriaId || "", contaId: v.contaId || "" } : (toast("Informe o nome."), null) });
function formLancarFixa(id) {
  const f = by("fixas", id); if (!f) return; if (!S.data.contas.length) return toast("Cadastre uma conta primeiro.");
  const l = lancFixa(f), mes = `${MESES[Number(S.mes.slice(5)) - 1]} ${S.mes.slice(0, 4)}`;
  openForm({ title: `${esc(f.nome)} — ${mes}`,
    values: { valor: l ? moneyIn(l.valor) : "", vencimento: l?.vencimento || dataNoMes(S.mes, f.dia || 10), paga: !!l?.efetivada, dataPag: l?.efetivada ? l.data : hoje(), contaId: l?.contaId || f.contaId },
    fields: [{ k: "valor", label: "Valor deste mês (R$)", type: "money" }, { k: "vencimento", label: "Data de vencimento", type: "date" }, { k: "paga", label: "Já paguei", type: "check", redraw: true },
      { k: "dataPag", label: "Data do pagamento", type: "date", when: v => v.paga }, { k: "contaId", label: "Conta", type: "select", options: optContas }],
    onSave: async v => { const valor = parseMoney(v.valor); if (valor <= 0 || !v.vencimento) { toast("Informe o valor e o vencimento."); return false; } if (v.paga && !v.dataPag) { toast("Informe a data do pagamento."); return false; }
      const d = { ...(l || {}), tipo: "despesa", descricao: f.nome, valor, vencimento: v.vencimento, data: v.paga ? v.dataPag : v.vencimento, efetivada: !!v.paga, categoriaId: f.categoriaId || "", contaId: v.contaId, cartaoId: "", contaDestinoId: "", pessoaId: l?.pessoaId || "", recorrencia: "fixa", fixaId: f.id, mesRef: S.mes };
      l ? await store.set("lancamentos", l.id, d) : await store.add("lancamentos", d); },
    onDelete: l ? () => store.del("lancamentos", l.id) : null, delLabel: "Apagar lançamento do mês" });
}
const formProjeto = crud("projetos", "oprojeto", [{ k: "nome", label: "Nome do projeto / evento" }, { k: "cliente", label: "Cliente" }, { k: "data", label: "Data do evento", type: "date" }, { k: "valor", label: "Valor do contrato (R$)", type: "money" }, { k: "status", label: "Situação", type: "select", options: [["andamento", "Em andamento"], ["concluido", "Concluído"]] }, { k: "cor", label: "Cor", type: "color" }],
  () => ({ nome: "", cliente: "", data: "", valor: "", status: "andamento", cor: PALETA[S.data.projetos.length % PALETA.length] }),
  { in: o => ({ ...o, valor: moneyIn(o.valor) }), out: v => v.nome.trim() ? { nome: v.nome.trim(), cliente: (v.cliente || "").trim(), data: v.data || "", valor: parseMoney(v.valor), status: v.status || "andamento", cor: v.cor } : (toast("Informe o nome do projeto."), null) },
  o => S.data.movProjeto.some(x => x.projetoId === o.id) ? "Este projeto tem pagamentos ou gastos. Exclua-os antes." : "");
function formMov(tipo, id) {
  const o = by("movProjeto", id), t = o ? o.tipo : tipo, uniq = a => [...new Set(a.filter(Boolean))].sort((a1, b1) => a1.localeCompare(b1)), todos = S.data.movProjeto;
  openForm({ title: (o ? "Editar " : "Novo ") + (t === "gasto" ? "gasto do projeto" : "pagamento recebido"),
    values: o ? { ...o, valor: moneyIn(o.valor) } : { descricao: "", valor: "", data: hoje(), grupo: "", subgrupo: "" },
    fields: [{ k: "descricao", label: "Descrição" }, { k: "valor", label: "Valor (R$)", type: "money" }, { k: "data", label: "Data", type: "date" },
      { k: "grupo", label: "Grupo (ex.: Buffet, Decoração)", list: () => uniq([...GRUPOS_EV, ...todos.map(x => x.grupo)]), when: () => t === "gasto" },
      { k: "subgrupo", label: "Subgrupo (ex.: Carnes, Flores)", list: v => uniq(todos.filter(x => !v.grupo || x.grupo === v.grupo.trim()).map(x => x.subgrupo)), when: () => t === "gasto" }],
    onSave: async v => { const valor = parseMoney(v.valor); if (valor <= 0 || !v.data) { toast("Informe valor e data."); return false; }
      const d = { projetoId: o ? o.projetoId : S.proj, tipo: t, descricao: (v.descricao || "").trim() || (t === "gasto" ? (v.grupo || "Gasto") : "Pagamento"), valor, data: v.data, grupo: t === "gasto" ? (v.grupo || "").trim() : "", subgrupo: t === "gasto" ? (v.subgrupo || "").trim() : "" };
      o ? await store.set("movProjeto", o.id, d) : await store.add("movProjeto", d); },
    onDelete: o ? () => store.del("movProjeto", o.id) : null });
}
const formOrc = crud("orcamentos", "oorçamento", [{ k: "categoriaId", label: "Categoria", type: "select", options: () => optCats("despesa") }, { k: "valor", label: "Limite mensal (R$)", type: "money" }],
  () => ({ valor: "" }), { in: o => ({ ...o, valor: moneyIn(o.valor) }), out: v => { const valor = parseMoney(v.valor); return valor > 0 && v.categoriaId ? { categoriaId: v.categoriaId, valor } : (toast("Informe categoria e valor."), null); } });

function exportarCSV() {
  const q = s => `"${String(s ?? "").replace(/"/g, '""')}"`;
  const linhas = [["Data", "Tipo", "Descrição", "Categoria", "Subgrupo", "Conta/Cartão", "Destino", "Pessoa", "Valor", "Efetivada"].join(";"), ...[...S.data.lancamentos].sort((a, b) => a.data.localeCompare(b.data)).map(l =>
    [dataBR(l.data), l.tipo, q(l.descricao), q(l.tipo === "transferencia" ? "" : cat(l.categoriaId).nome), q(l.subgrupo || ""), q(l.cartaoId ? by("cartoes", l.cartaoId)?.nome : by("contas", l.contaId)?.nome), q(by("contas", l.contaDestinoId)?.nome || ""), q(l.tipo === "despesa" ? by("pessoas", l.pessoaId)?.nome || "Eu" : ""), l.valor.toFixed(2).replace(".", ","), l.efetivada ? "sim" : "não"].join(";"))];
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + linhas.join("\n")], { type: "text/csv" })); a.download = "lancamentos.csv"; a.click();
}

/* ---------- ações ---------- */
const A = {
  abrirProj: d => { S.proj = d.id; $("#main").scrollTop = 0; render(); }, voltarProj: () => { S.proj = null; render(); },
  editProj: d => formProjeto(d.id), novoMov: d => formMov(d.tipo), editMov: d => formMov(null, d.id),
  abrirCartao: d => { S.cartao = d.id; $("#main").scrollTop = 0; render(); }, voltarCartao: () => { S.cartao = null; render(); },
  nav: d => { S.proj = null; S.cartao = null; S.view = d.v; $("#main") && ($("#main").scrollTop = 0); render(); },
  mes: d => { S.mes = addMes(S.mes, Number(d.v)); render(); },
  filtro: d => { S.filtro = d.v; render(); },
  aba: d => { S.aba = d.v; render(); },
  novo: d => S.view === "dilcar" && !d.cartao && !d.pessoa ? (S.proj && by("projetos", S.proj) ? formMov("gasto") : formProjeto()) : formLanc(null, d.cartao || (S.view === "cartoes" && S.cartao && by("cartoes", S.cartao) ? S.cartao : undefined), d.pessoa),
  editL: d => { const l = by("lancamentos", d.id); l?.emprestimo ? formEmprestimo(l.pessoaId, l.id) : formLanc(l); },
  emprestar: d => formEmprestimo(d.id),
  toggleL: d => { const l = by("lancamentos", d.id); store.set("lancamentos", l.id, { ...l, efetivada: !l.efetivada }); },
  editConta: d => formConta(d.id), editCartao: d => S.data.contas.length ? formCartao(d.id) : toast("Cadastre uma conta primeiro."), editCat: d => formCat(d.id), editPessoa: d => formPessoa(d.id), editFixa: d => S.data.contas.length ? formFixa(d.id) : toast("Cadastre uma conta primeiro."), lancarFixa: d => formLancarFixa(d.id), editOrc: d => formOrc(d.id),
  pagar: d => { const c = by("cartoes", d.id), valor = fatTotal(c.id, S.mes);
    openForm({ title: `Pagar fatura — ${brl(valor)}`, values: { contaId: c.contaId, data: hoje() }, fields: [{ k: "contaId", label: "De qual conta saiu o dinheiro", type: "select", options: optContas }, { k: "data", label: "Data do pagamento", type: "date" }],
      onSave: v => store.set("cartoes", c.id, { ...c, pagas: { ...(c.pagas || {}), [S.mes]: { contaId: v.contaId, data: v.data || hoje(), valor } } }) }); },
  reabrir: d => { const c = by("cartoes", d.id), pagas = { ...(c.pagas || {}) }; delete pagas[S.mes]; store.set("cartoes", c.id, { ...c, pagas }); },
  verFatura: d => { const it = fatItens(d.id, S.mes).sort((a, b) => a.data.localeCompare(b.data));
    $("#modal").innerHTML = `<div class="ov" data-act="fechar"><div class="modal"><h2>Fatura — ${esc(by("cartoes", d.id).nome)}</h2>${it.map(l => `<div class="row" data-act="editL" data-id="${l.id}"><div class="tx"><div>${esc(l.descricao)}</div><small>${dataBR(l.data)} · ${sub(l)}</small></div><b>${brl(l.valor)}</b></div>`).join("") || '<div class="empty">Nenhuma despesa nesta fatura.</div>'}
    <div class="acts"><span class="sp"></span><button class="btn ghost" data-act="fechar" data-force="1">Fechar</button></div></div></div>`; },
  verPessoa: d => { const validos = new Set(S.data.pessoas.map(p => p.id)), p = by("pessoas", d.id), c = p ? contaPessoa(p.id) : null;
    const it = doMes("despesa").filter(l => !l.emprestimo && (p ? l.pessoaId === p.id : !validos.has(l.pessoaId))).sort((a, b) => a.data.localeCompare(b.data));
    const pg = p ? S.data.lancamentos.filter(l => l.reembolso && l.pessoaId === p.id && l.data <= `${S.mes}-31`).sort((a, b) => b.data.localeCompare(a.data)) : [];
    const li = (l, k) => `<div class="row" data-act="editL" data-id="${l.id}"><div class="tx"><div>${esc(l.descricao)}</div><small>${dataBR(l.data)} · ${sub(l)}</small></div><b class="${k}">${brl(l.valor)}</b></div>`;
    $("#modal").innerHTML = `<div class="ov" data-act="fechar"><div class="modal"><h2>${esc(p ? p.nome : "Eu")}</h2>
    ${c ? `<div class="tri" style="font-size:14px;margin-bottom:10px"><div><small>Total a cobrar</small>${brl(c.gasto)}</div><div><small>Já pagou</small><span class="pos">${brl(c.pago)}</span></div><div><small>${c.deve < -0.005 ? "Crédito" : "Ainda deve"}</small><b class="${c.deve > 0.005 ? "neg" : "pos"}">${brl(Math.abs(c.deve))}</b></div></div>` : ""}
    ${p && emprestimos(p.id).length ? `<div class="day">Empréstimos</div>${emprestimos(p.id).map(l => `<div class="row" data-act="editL" data-id="${l.id}"><div class="tx"><div>${esc(l.descricao)}</div><small>Emprestado em ${dataBR(l.data)}${l.vencimento ? ` · <span class="${c.deve > 0.005 && l.vencimento < hoje() ? "neg b" : ""}">${c.deve > 0.005 && l.vencimento < hoje() ? "venceu em" : "pagar até"} ${dataBR(l.vencimento)}</span>` : ""}</small></div><b>${brl(l.valor)}</b></div>`).join("")}` : ""}
    <div class="day">Despesas do mês — ${brl(total(it))}</div>${it.map(l => li(l, "")).join("") || '<div class="empty">Nenhuma despesa neste mês.</div>'}
    ${p ? `<div class="day">Pagamentos recebidos</div>${pg.map(l => li(l, "pos")).join("") || '<div class="empty">Nenhum pagamento registrado.</div>'}` : ""}
    <div class="acts">${p ? `<button class="btn ghost" data-act="emprestar" data-id="${p.id}">Emprestar</button><button class="btn" data-act="pagarPessoa" data-id="${p.id}">Registrar pagamento</button>` : ""}<span class="sp"></span><button class="btn ghost" data-act="fechar" data-force="1">Fechar</button></div></div></div>`; },
  pagarPessoa: d => { const p = by("pessoas", d.id), c = contaPessoa(p.id); if (!S.data.contas.length) return toast("Cadastre uma conta primeiro.");
    openForm({ title: `Pagamento de ${esc(p.nome)}`, values: { valor: c.deve > 0 ? moneyIn(c.deve) : "", data: ymOf(hoje()) === S.mes ? hoje() : `${S.mes}-01` },
      fields: [{ k: "valor", label: `Valor recebido (R$) — deve ${brl(Math.max(0, c.deve))}`, type: "money" }, { k: "data", label: "Data", type: "date" }, { k: "contaId", label: "Entrou na conta", type: "select", options: optContas }],
      onSave: async v => { const valor = parseMoney(v.valor); if (valor <= 0 || !v.data) { toast("Informe valor e data."); return false; }
        await store.add("lancamentos", { tipo: "receita", descricao: `Pagamento de ${p.nome}`, valor, data: v.data, categoriaId: "", contaId: v.contaId, cartaoId: "", contaDestinoId: "", pessoaId: p.id, reembolso: true, efetivada: true, recorrencia: "variavel" }); } }); },
  importar: d => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".ofx,.qfx,.csv,.txt,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; inp.style.display = "none"; inp.id = "impfile";
    inp.onchange = () => { const f = inp.files[0]; inp.remove(); if (f) importarArquivo(d.id, f).catch(err => toast("Não consegui ler o arquivo: " + err.message)); };
    document.getElementById("impfile")?.remove(); document.body.append(inp); inp.click(); },
  impTodas: () => { const algum = IMP.itens.some(x => x.on); IMP.itens.forEach(x => x.on = !algum && !x.credito); telaImportar(); },
  impAplicar: () => { const cId = $("#impcat").value, sg = $("#impsub").value.trim(); if (!cId && !sg) return toast("Escolha uma categoria ou digite um subgrupo.");
    IMP.itens.filter(x => x.on).forEach(x => { if (cId) x.categoriaId = cId; if (sg) x.subgrupo = sg; }); telaImportar(); },
  impSalvar: async () => { const sel = IMP.itens.filter(x => x.on); if (!sel.length) return toast("Marque pelo menos uma compra.");
    const novos = sel.map(x => { const p = /(\d{1,2})\s*(?:\/|de)\s*(\d{1,2})/.exec(x.descOrig), parc = p && Number(p[1]) <= Number(p[2]) && Number(p[2]) > 1;
      return { tipo: "despesa", descricao: x.nome.trim() || x.descOrig || "Compra no cartão", valor: x.valor, data: x.data, categoriaId: x.categoriaId || "", subgrupo: (x.subgrupo || "").trim(), contaId: "", cartaoId: IMP.cartaoId, contaDestinoId: "", pessoaId: x.pessoaId || "", efetivada: true,
        recorrencia: parc ? "parcelada" : "variavel", ...(parc ? { parcela: Number(p[1]), parcelas: Number(p[2]) } : {}), importId: x.importId, descOrig: x.descOrig, ...(IMP.modo === "fatura" ? { faturaRef: S.mes } : {}) }; });
    try { await store.addMany("lancamentos", novos); toast(`${novos.length} compras importadas (${brl(total(novos))}).`); IMP = null; $("#modal").innerHTML = ""; }
    catch (err) { toast("Não foi possível importar: " + (err.code || err.message)); } },
  fechar: (d, e) => { if (d.force || e.target.classList.contains("ov")) { $("#modal").innerHTML = ""; IMP = null; } },
  dark: () => { const on = document.documentElement.classList.toggle("dark"); try { localStorage.setItem("mf-dark", on ? "1" : "0"); } catch (e) {} render(); },
  csv: exportarCSV,
  sair: () => { if (S.demo) location.reload(); else fb.A.signOut(fb.auth); }
};
document.addEventListener("click", e => { const t = e.target.closest("[data-act]"); if (!t || t.closest("form.modal")) return; e.stopPropagation(); A[t.dataset.act]?.(t.dataset, e); });
document.addEventListener("input", e => { if (e.target.id === "busca") { S.busca = e.target.value; $("#lista").innerHTML = listaLanc(); } });

/* ---------- importar OFX / CSV no cartão ---------- */
const impData = t => { if (t instanceof Date) { if (isNaN(t)) return ""; const d = new Date(t.getTime() + 12 * 3600e3); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; } t = String(t ?? "").trim(); let m;
  if ((m = /^(\d{4})-(\d{2})-(\d{2})/.exec(t))) return `${m[1]}-${m[2]}-${m[3]}`;
  if ((m = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/.exec(t))) return `${m[3].length === 2 ? "20" + m[3] : m[3]}-${pad(m[2])}-${pad(m[1])}`;
  if ((m = /^(\d{4})(\d{2})(\d{2})/.exec(t))) return `${m[1]}-${m[2]}-${m[3]}`;
  return ""; };
const impValor = t => { if (typeof t === "number") return r2(t); if (t instanceof Date) return NaN; t = String(t ?? "").replace(/[R$\s"]/g, ""); if (!/\d/.test(t)) return NaN; const neg = /^-|-$|^\(.*\)$/.test(t); t = t.replace(/[()\-+]/g, "");
  const v = t.lastIndexOf(","), p = t.lastIndexOf(".");
  if (v >= 0 && p >= 0) t = v > p ? t.replace(/\./g, "").replace(",", ".") : t.replace(/,/g, "");
  else if (v >= 0) t = t.replace(",", "."); else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, "");
  const n = parseFloat(t); return isFinite(n) ? r2(neg ? -n : n) : NaN; };
function lerOFX(txt) {
  const tag = (b, n) => (new RegExp("<" + n + ">([^<\\r\\n]*)", "i").exec(b) || [])[1]?.trim() || "";
  return txt.split(/<STMTTRN>/i).slice(1).map(b => ({ data: impData(tag(b, "DTPOSTED")), valor: impValor(tag(b, "TRNAMT")), nome: tag(b, "MEMO") || tag(b, "NAME"), fit: tag(b, "FITID") })).filter(x => x.data && isFinite(x.valor));
}
function lerCSV(txt) {
  const linhas = txt.replace(/^\ufeff/, "").split(/\r?\n/).filter(l => l.trim()); if (!linhas.length) return [];
  const sep = [";", "\t", ","].map(d => [d, linhas[0].split(d).length]).sort((a, b) => b[1] - a[1])[0][0];
  const cel = l => { const out = []; let c = "", q = false; for (let i = 0; i < l.length; i++) { const ch = l[i]; if (q) { if (ch === '"') { if (l[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch; } else if (ch === '"') q = true; else if (ch === sep) { out.push(c); c = ""; } else c += ch; } out.push(c); return out.map(x => x.trim()); };
  return tabelaParaItens(linhas.map(cel));
}
// Recebe linhas (listas de células) de um CSV ou planilha e acha as colunas de data, descrição e valor
function tabelaParaItens(rows) {
  const txt = c => (c instanceof Date ? "" : String(c ?? "")).trim(), reD = /^data|date|^dt/, reV = /^valor$|amount|valor.*r\$|^valor|montante/, reN = /descri|title|hist|estabelec|lan[çc]amento|memo|nome|name|movimenta/;
  let ic = rows.findIndex(r => r.some(c => reD.test(txt(c).toLowerCase())) && r.some(c => reV.test(txt(c).toLowerCase())));
  const temCab = ic >= 0, cab = temCab ? rows[ic].map(c => txt(c).toLowerCase()) : [], acha = re => cab.findIndex(c => re.test(c));
  const corpo = (temCab ? rows.slice(ic + 1) : rows).filter(r => r.some(c => impData(c))), am = corpo[0] || [];
  let iD = acha(reD), iN = acha(reN), iV = acha(reV);
  if (iD < 0) iD = am.findIndex(c => impData(c));
  const pareceValor = c => typeof c === "number" || (isFinite(impValor(c)) && /[.,]\d{2}$|^-?\d+$/.test(txt(c).replace(/[R$\s]/g, "")));
  if (iV < 0) { for (let k = am.length - 1; k >= 0; k--) if (k !== iD && pareceValor(am[k])) { iV = k; break; } }
  if (iN < 0) iN = am.map((c, k) => [k, k === iD || k === iV ? -1 : txt(c).length]).sort((a, b) => b[1] - a[1])[0]?.[0] ?? -1;
  if (iD < 0 || iV < 0) return [];
  return corpo.map(r => ({ data: impData(r[iD]), valor: impValor(r[iV]), nome: txt(r[iN]), fit: "" })).filter(x => x.data && isFinite(x.valor) && x.valor !== 0);
}
async function lerPlanilha(buf) {
  const X = await import("https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs"), wb = X.read(buf, { type: "array", cellDates: true });
  let melhor = [];
  for (const n of wb.SheetNames) { const it = tabelaParaItens(X.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: true, defval: "" })); if (it.length > melhor.length) melhor = it; }
  return melhor;
}
let IMP = null;
async function importarArquivo(cartaoId, file) {
  const buf = await file.arrayBuffer(), b = new Uint8Array(buf.slice(0, 4)), planilha = /\.xlsx?$|\.xlsm$|\.ods$/i.test(file.name) || (b[0] === 0x50 && b[1] === 0x4b) || (b[0] === 0xd0 && b[1] === 0xcf); let txt = "";
  if (!planilha) { try { txt = new TextDecoder("utf-8", { fatal: true }).decode(buf); } catch (e) { txt = new TextDecoder("windows-1252").decode(buf); } }
  const ofx = !planilha && /<OFX>|<STMTTRN>/i.test(txt); let bruto;
  if (planilha) { toast("Lendo a planilha…"); try { bruto = await lerPlanilha(buf); } catch (e) { return toast("Não consegui abrir a planilha (precisa de internet na primeira vez): " + e.message); } }
  else bruto = ofx ? lerOFX(txt) : lerCSV(txt);
  if (!bruto.length) return toast("Não encontrei compras neste arquivo. Envie o OFX, CSV ou XLS da fatura.");
  const negs = bruto.filter(x => x.valor < 0).length, compraNeg = ofx ? negs > 0 : negs > bruto.length / 2;
  const norm = t => t.toLowerCase().replace(/\s+/g, " ").trim(), hist = new Map();
  S.data.lancamentos.forEach(l => { if (l.descOrig) hist.set(norm(l.descOrig), l); });
  const doCartao = S.data.lancamentos.filter(l => l.cartaoId === cartaoId);
  IMP = { cartaoId, arquivo: file.name, modo: "fatura", itens: bruto.map(x => {
    const credito = compraNeg ? x.valor > 0 : x.valor < 0, valor = Math.abs(x.valor), importId = x.fit || `${x.data}|${valor}|${norm(x.nome)}`, h = hist.get(norm(x.nome));
    const dup = doCartao.some(l => l.importId === importId || (l.data === x.data && l.valor === valor && norm(l.descOrig || l.descricao) === norm(x.nome)));
    return { on: !credito && !dup, credito, dup, data: x.data, valor, descOrig: x.nome, nome: h?.descricao || x.nome, categoriaId: h?.categoriaId || "", subgrupo: h?.subgrupo || "", pessoaId: h?.pessoaId || "", importId };
  }).sort((a, b) => a.data.localeCompare(b.data)) };
  telaImportar();
}
function impResumo() { const m = IMP.itens.filter(x => x.on); return `${m.length} de ${IMP.itens.length} marcadas · total ${brl(total(m))}`; }
function telaImportar() {
  const c = by("cartoes", IMP.cartaoId), cats = optCats("despesa"), ps = [...S.data.pessoas].sort((a, b) => a.nome.localeCompare(b.nome)), mes = `${MESES[Number(S.mes.slice(5)) - 1].toLowerCase()} de ${S.mes.slice(0, 4)}`;
  const selCat = (v, attr) => `<select ${attr}><option value="">— categoria —</option>${cats.map(([k, n]) => `<option value="${k}" ${k === v ? "selected" : ""}>${esc(n)}</option>`).join("")}</select>`;
  $("#modal").innerHTML = `<div class="ov"><div class="modal imp"><h2>Importar para ${esc(c.nome)}</h2>
    <div class="sum" style="justify-content:flex-start;margin:0 0 10px">${esc(IMP.arquivo)} · <b id="impres">${impResumo()}</b></div>
    <div class="f"><label for="impmodo">Em qual fatura lançar</label><select id="impmodo" data-impg="modo"><option value="fatura" ${IMP.modo === "fatura" ? "selected" : ""}>Tudo na fatura de ${mes} (mês selecionado no topo)</option><option value="data" ${IMP.modo === "data" ? "selected" : ""}>Pela data de cada compra e o dia de fechamento</option></select></div>
    <div class="impbar"><span>Aplicar às marcadas:</span>${selCat("", 'id="impcat"')}<input id="impsub" type="text" placeholder="Subgrupo" autocomplete="off"><button class="btn ghost" data-act="impAplicar">Aplicar</button><button class="btn ghost" data-act="impTodas">Marcar / desmarcar todas</button></div>
    <div class="implist">${IMP.itens.map((x, i) => `<div class="impi ${x.on ? "" : "off"}" data-i="${i}">
      <label class="impck"><input type="checkbox" data-imp="on" ${x.on ? "checked" : ""}> <span>${dataBR(x.data)}</span></label><b class="${x.credito ? "pos" : "neg"}">${brl(x.valor)}</b>
      ${x.dup ? '<span class="tag" style="background:#f29a38">Já importada</span>' : x.credito ? '<span class="tag" style="background:#2e9e5b">Pagamento / estorno</span>' : "<span></span>"}
      <input class="impn" type="text" data-imp="nome" value="${esc(x.nome)}" title="Nome original: ${esc(x.descOrig)}" autocomplete="off">
      ${selCat(x.categoriaId, 'data-imp="categoriaId"')}<input type="text" data-imp="subgrupo" value="${esc(x.subgrupo)}" placeholder="Subgrupo" autocomplete="off">
      ${ps.length ? `<select data-imp="pessoaId"><option value="">Eu</option>${ps.map(p => `<option value="${p.id}" ${p.id === x.pessoaId ? "selected" : ""}>${esc(p.nome)}</option>`).join("")}</select>` : ""}</div>`).join("")}</div>
    <div class="acts"><span class="sp"></span><button class="btn ghost" data-act="fechar" data-force="1">Cancelar</button><button class="btn" data-act="impSalvar">Importar marcadas</button></div></div></div>`;
}
document.addEventListener("input", e => {
  if (!IMP) return; const t = e.target;
  if (t.dataset.impg) { IMP[t.dataset.impg] = t.value; return; }
  const k = t.dataset.imp, row = t.closest(".impi"); if (!k || !row) return;
  const x = IMP.itens[Number(row.dataset.i)]; x[k] = t.type === "checkbox" ? t.checked : t.value;
  if (k === "on") { row.classList.toggle("off", !x.on); $("#impres").textContent = impResumo(); }
});

document.addEventListener("pointerdown", e => {
  const g = e.target.closest(".grip"); if (!g) return;
  e.preventDefault();
  const pc = g.closest(".pcard");
  if (pc) {
    pc.classList.add("drag"); document.body.classList.add("arrastando");
    let ult = e, vivo = true; const main = $("#main");
    const rolar = () => { if (!vivo) return; const r = main.getBoundingClientRect(), y = ult.clientY, v = y > r.bottom - 70 ? 14 : y < r.top + 50 ? -14 : 0;
      if (v) { const antes = main.scrollTop; main.scrollTop += v; if (main.scrollTop !== antes) move(ult); } requestAnimationFrame(rolar); };
    requestAnimationFrame(rolar);
    const move = ev => { ult = ev;
      const el = document.elementFromPoint(ev.clientX, ev.clientY), grp = el?.closest(".pgrp"); if (!grp) return;
      const alvo = el.closest(".pcard");
      if (alvo && alvo !== pc) { const b = alvo.getBoundingClientRect(); grp.insertBefore(pc, ev.clientX < b.left + b.width / 2 ? alvo : alvo.nextSibling); }
      else if (!alvo && pc.parentNode !== grp) grp.insertBefore(pc, grp.querySelector(".vazio"));
    };
    const fim = () => {
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", fim); window.removeEventListener("pointercancel", fim);
      vivo = false; pc.classList.remove("drag"); document.body.classList.remove("arrastando");
      const mud = [];
      document.querySelectorAll(".pgrp").forEach(grp => [...grp.querySelectorAll(".pcard")].forEach((c, i) => { const p = by("pessoas", c.dataset.id); if (p && (p.ordem !== i || grupoDe(p) !== grp.dataset.grupo || p.grupo !== grp.dataset.grupo)) mud.push(store.set("pessoas", p.id, { ...p, ordem: i, grupo: grp.dataset.grupo })); }));
      Promise.all(mud).then(() => render()).catch(err => toast("Não foi possível salvar: " + (err.code || err.message)));
    };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", fim); window.addEventListener("pointercancel", fim);
    return;
  }
  const tr = g.closest("tr"), tb = tr.parentNode; tr.classList.add("drag");
  const move = ev => {
    const alvo = [...tb.children].filter(r => r !== tr).find(r => { const b = r.getBoundingClientRect(); return ev.clientY < b.top + b.height / 2; });
    if (alvo) { if (tr.nextSibling !== alvo) tb.insertBefore(tr, alvo); } else if (tb.lastChild !== tr) tb.appendChild(tr);
  };
  const fim = () => {
    window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", fim); window.removeEventListener("pointercancel", fim);
    tr.classList.remove("drag");
    Promise.all([...tb.children].map((r, i) => { const c = by("contas", r.dataset.id); return c && c.ordem !== i ? store.set("contas", c.id, { ...c, ordem: i }) : null; }))
      .catch(err => toast("Não foi possível salvar a ordem: " + (err.code || err.message)));
  };
  window.addEventListener("pointermove", move); window.addEventListener("pointerup", fim); window.addEventListener("pointercancel", fim);
});

/* ---------- login ---------- */
const ERROS = { "auth/invalid-credential": "E-mail ou senha incorretos.", "auth/invalid-email": "E-mail inválido.", "auth/email-already-in-use": "Este e-mail já tem conta. Use Entrar.", "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.", "auth/missing-password": "Digite a senha.", "auth/too-many-requests": "Muitas tentativas. Tente mais tarde.", "auth/network-request-failed": "Sem conexão com a internet." };
function telaLogin(msg = "") {
  $("#root").innerHTML = `<div class="login"><form class="card"><div class="logo">${LOGO}<span>meu<b>financeiro</b></span></div>
    <div class="f"><label for="em">E-mail</label><input id="em" type="email" autocomplete="username" required></div>
    <div class="f"><label for="pw">Senha</label><input id="pw" type="password" autocomplete="current-password" required></div>
    <div class="err" id="err">${esc(msg)}</div><button class="btn">Entrar</button>
    <div class="alt" style="justify-content:center"><button type="button" class="link" id="reset">Esqueci a senha</button></div>
    <div class="alt" style="justify-content:center"><button type="button" class="link mut" id="demo">Ver demonstração</button></div></form></div>`;
  const err = e => { $("#err").textContent = ERROS[e.code] || "Não foi possível entrar (" + (e.code || e.message) + ")."; };
  const cred = () => [$("#em").value.trim(), $("#pw").value];
  $("form").onsubmit = e => { e.preventDefault(); if (!fb) return err({ code: "auth/network-request-failed" }); fb.A.signInWithEmailAndPassword(fb.auth, ...cred()).catch(err); };
  $("#reset").onclick = () => fb && fb.A.sendPasswordResetEmail(fb.auth, cred()[0]).then(() => { $("#err").textContent = "Enviamos um e-mail para redefinir a senha."; }).catch(err);
  $("#demo").onclick = entrarDemo;
}
function entrarDemo() { S.demo = true; store = demoStore(); semearDemo(); $("#root").innerHTML = ""; draw(); }

async function iniciar() {
  if (window.FORCE_DEMO || new URLSearchParams(location.search).has("demo")) return entrarDemo();
  try {
    const [app, A_, F] = await Promise.all([import(FB + "firebase-app.js"), import(FB + "firebase-auth.js"), import(FB + "firebase-firestore.js")]);
    const a = app.initializeApp(firebaseConfig);
    let db; try { db = F.initializeFirestore(a, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) }); } catch (e) { db = F.getFirestore(a); }
    fb = { A: A_, F, auth: A_.getAuth(a), db };
  } catch (e) { return telaLogin("Sem conexão com o servidor. Você pode ver a demonstração."); }
  fb.A.onAuthStateChanged(fb.auth, async u => {
    if (!u) { S.user = null; S.carregado = false; return telaLogin(); }
    S.user = u; $("#root").innerHTML = ""; store = fireStore(u); draw();
    try { const ref = fb.F.doc(fb.db, "users", u.uid), s = await fb.F.getDoc(ref); if (!s.exists()) { await fb.F.setDoc(ref, { criadoEm: hoje() }); await semearPadrao(); } }
    catch (e) { toast("Erro ao preparar a conta: " + (e.code || e.message)); }
  });
}
iniciar();
if ("serviceWorker" in navigator && location.protocol === "https:" && !window.FORCE_DEMO) navigator.serviceWorker.register("sw.js").catch(() => {});
