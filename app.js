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
const COLS = ["contas", "cartoes", "categorias", "lancamentos", "orcamentos", "pessoas", "fixas", "projetos", "movProjeto", "energia", "config", "objetivos"];
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

/* ---------- utilidades ---------- */
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const r2 = n => Math.round(n * 100) / 100;
const brl = v => { if (S.priv) return "R$ ••••"; v = Math.abs(v) < 0.005 ? 0 : v; return (v < 0 ? "-" : "") + "R$ " + Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
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
  energia: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  dilcar: '<path d="M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.4l6-.8z"/>',
  objetivos: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.3"/>',
  projecao: '<path d="M3 17l6-6 4 4 8-9"/><path d="M15 6h6v6"/>',
  calendario: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  olho: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  mais: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>'
};
const ico = n => `<svg class="ico" viewBox="0 0 24 24">${I[n]}</svg>`;
const LOGO = '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="11" fill="none" stroke="#3b7ddd" stroke-width="6"/><path d="M16 5a11 11 0 0 1 9.5 16.5" fill="none" stroke="#2e9e5b" stroke-width="6" stroke-linecap="round"/></svg>';
const NAV = [["inicio", "Início"], ["lancamentos", "Lançamentos"], ["contas", "Contas"], ["cartoes", "Cartões"], ["pessoas", "Pessoas"], ["orcamentos", "Orçamentos"], ["objetivos", "Objetivos"], ["relatorios", "Relatórios"], ["projecao", "Projeção de saldo"], ["calendario", "Calendário"], ["categorias", "Categorias"], ["energia", "Energia"], ["dilcar", "Dilcar Eventos"], ["config", "Ajustes"]];
const MENU = [["", ["inicio", "contas", "lancamentos", "cartoes", "pessoas"]], ["Planejar", ["orcamentos", "objetivos"]], ["Analisar", ["relatorios", "projecao", "calendario", "categorias"]], ["Outros", ["energia", "dilcar"]], ["", ["config"]]];
const EMOJIS = ["🍽️","🛒","🏠","🚗","⛽","💊","🎓","🎮","👨‍👩‍👧","👕","✈️","📱","💡","🐶","🎁","💼","💰","🛍️","📅","🏋️","☕","🧾","📦","➕"];
const GRUPOS_EV = ["Buffet", "Bebidas", "Decoração", "Equipe", "Som e luz", "Locação", "Transporte", "Outros"];
const PALETA = ["#4a9be0", "#f5b335", "#e0564a", "#7e57c2", "#2f8f83", "#f29a38", "#3f51b5", "#26a69a", "#e57373", "#78909c"];
const GRUPOS = [["familia", "Família"], ["parentes", "Parentes"], ["amigos", "Amigos"], ["empresas", "Empresas"]];
let grupoNovo = "familia";
const grupoDe = p => GRUPOS.some(([k]) => k === p.grupo) ? p.grupo : "familia";
const CATS_PADRAO = [
  ["Alimentação","🍽️","#f5b335","despesa"],["Mercado","🛒","#f29a38","despesa"],["Moradia","🏠","#7e57c2","despesa"],["Carro","🚗","#e0564a","despesa"],
  ["Contas fixas","📅","#4a9be0","despesa"],["Saúde","💊","#e57373","despesa"],["Educação","🎓","#2f8f83","despesa"],["Lazer","🎮","#3f51b5","despesa"],
  ["Família","👨‍👩‍👧","#26a69a","despesa"],["Outros","📦","#78909c","despesa"],
  ["Salário","💼","#43a047","receita"],["Vendas","🛍️","#26a69a","receita"],["Outras receitas","➕","#66bb6a","receita"]
];

/* ---------- estado ---------- */
const S = { priv: false, menu: false, per: "mes", ref: hoje(), cartao: null, proj: null, user: null, demo: false, mes: ymOf(hoje()), view: "inicio", filtro: "todos", busca: "", aba: "despesa", carregado: false,
  data: Object.fromEntries(COLS.map(c => [c, []])) };
let store = null, fb = null, pend = false;
const render = () => { if (pend) return; pend = true; const go = () => { pend = false; draw(); }; document.hidden ? setTimeout(go, 0) : requestAnimationFrame(go); };
const by = (col, id) => S.data[col].find(x => x.id === id);
const contasOrd = () => [...S.data.contas].sort((a, b) => (a.ordem ?? 1e9) - (b.ordem ?? 1e9) || a.nome.localeCompare(b.nome));
const cat = id => id === "__emp" ? { nome: "Empréstimos", icone: "🤝", cor: "#5b6ee0" } : by("categorias", id) || { nome: "Sem categoria", icone: "📦", cor: "#90a4ae" };
const toast = m => { const t = document.createElement("div"); t.className = "toast"; t.textContent = m; document.body.append(t); setTimeout(() => t.remove(), 2600); };
try { S.priv = localStorage.getItem("mf-priv") === "1"; } catch (e) {}
try { const p = localStorage.getItem("mf-per"); if (["dia", "semana", "mes", "ano"].includes(p)) S.per = p; } catch (e) {}
try { if (localStorage.getItem("mf-dark") === "1") document.documentElement.classList.add("dark"); } catch (e) {}

/* ---------- armazenamento ---------- */
function demoStore() {
  const D = S.data;
  return {
    async add(col, o) { const id = uid(); D[col].push({ ...o, id }); render(); return id; },
    async addMany(col, arr) { arr.forEach(o => D[col].push({ ...o, id: uid() })); render(); },
    async set(col, id, o) { const i = D[col].findIndex(x => x.id === id); if (i >= 0) D[col][i] = { ...o, id }; else D[col].push({ ...o, id }); render(); },
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
  D.pessoas = [{ id: "e1", nome: "Empresa Exemplo Ltda", cor: "#5b6ee0", grupo: "empresas" }, { id: "m", nome: "Mãe", cor: "#e0564a", grupo: "familia" }, { id: "i", nome: "Irmão", cor: "#2f8f83", grupo: "familia" }, { id: "t", nome: "Tia", cor: "#7e57c2", grupo: "parentes" }, { id: "x", nome: "Amigo", cor: "#f29a38", grupo: "amigos" }];
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
  D.energia = [{ id: "e0", data: dataNoMes(addMes(m, -3), 14), gerAcum: 70000, medAcum: 34000 },
    { id: "e1", data: dataNoMes(addMes(m, -2), 12), consumido: 310, injetado: 420, gerAcum: 70780, solData: dataNoMes(addMes(m, -2), 14), medAcum: 34668, medData: dataNoMes(addMes(m, -2), 14) },
    { id: "e2", data: dataNoMes(addMes(m, -1), 12), consumido: 355, injetado: 380, gerAcum: 71515, medAcum: 35380 },
    { id: "e3", data: dataNoMes(m, 9), consumido: 402, injetado: 301 }, { id: "e4", data: dataNoMes(m, 13), gerAcum: 72260, medAcum: 36230 }].map(e => ({ mes: ymOf(e.data), creditoFatura: "", valor: 0, ...e }));
  D.config = [{ id: "energia", creditoInicial: 150 }];
  D.objetivos = [{ id: "o1", nome: "Reserva de emergência", alvo: 10000, guardado: 3500, prazo: dataNoMes(addMes(m, 10), 30), cor: "#2f8f83" }, { id: "o2", nome: "Viagem", alvo: 4000, guardado: 4000, prazo: "", cor: "#f29a38" }];
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
function resumoConta(c, ym, ini0 = `${ym}-01`, fim = `${ym}-31`) {
  const mv = movimentos(c.id);
  const soma = f => r2(mv.filter(f).reduce((s, x) => s + x.v, 0));
  const noMes = x => x.d >= ini0 && x.d <= fim;
  const inicial = r2((c.saldoInicial || 0) + soma(x => x.ok && x.d < ini0));
  const rec = soma(x => x.ok && noMes(x) && x.t === "r"), des = -soma(x => x.ok && noMes(x) && x.t === "d");
  const tc = soma(x => x.ok && noMes(x) && x.t === "tc"), td = -soma(x => x.ok && noMes(x) && x.t === "td");
  const saldo = r2(inicial + rec - des + tc - td);
  const previsto = r2((c.saldoInicial || 0) + soma(x => x.d <= fim));
  return { inicial, rec, des, tc, td, saldo, previsto };
}
const addDias = (d, n) => { const t = new Date(Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10) + n)); return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`; };
const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
// Período do resumo (tela Início): dia, semana (domingo a sábado), mês ou ano
function periodo(desl = 0) {
  const p = S.per;
  if (p === "dia") { const d = addDias(S.ref, desl); return { ini: d, fim: d, label: `${dataBR(d)} (${DIAS[new Date(d + "T12:00").getDay()]})`, nome: "no dia", ant: "dia anterior" }; }
  if (p === "semana") { const dom = addDias(S.ref, -new Date(S.ref + "T12:00").getDay() + 7 * desl), sab = addDias(dom, 6); return { ini: dom, fim: sab, label: `${dataBR(dom).slice(0, 5)} a ${dataBR(sab)}`, nome: "na semana", ant: "semana anterior" }; }
  if (p === "ano") { const y = Number(S.mes.slice(0, 4)) + desl; return { ini: `${y}-01-01`, fim: `${y}-12-31`, label: `Ano de ${y}`, nome: "no ano", ant: "ano anterior" }; }
  const ym = addMes(S.mes, desl); return { ini: `${ym}-01`, fim: `${ym}-31`, label: `${MESES[Number(ym.slice(5)) - 1]} ${ym.slice(0, 4)}`, nome: "no mês", ant: "mês anterior" };
}
const noPer = (tipo, P) => S.data.lancamentos.filter(l => l.tipo === tipo && l.data >= P.ini && l.data <= P.fim);
const faturasNoPer = P => { let t = 0; for (const c of S.data.cartoes) for (let ym = ymOf(P.ini); ym <= ymOf(P.fim); ym = addMes(ym, 1)) { const v = dataNoMes(ym, c.vencimento || 10); if (v >= P.ini && v <= P.fim) t += fatTotal(c.id, ym); } return r2(t); };
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
function barras(rows, clic) {
  if (!rows.length) return '<div class="empty">Sem dados neste mês.</div>';
  const max = rows[0].v || 1;
  return `<div class="bars">${rows.slice(0, 8).map(r => `<div class="bar ${clic ? "clk" : ""}" ${clic ? `data-act="det" data-k="cat" data-id="${esc(r.id)}"` : ""}><span class="n">${esc(r.c.nome)}</span><div><div class="t" style="width:${Math.max(4, r.v / max * 100)}%;background:${esc(r.c.cor)}">${r.p.toFixed(1)}%</div></div></div>`).join("")}</div>`;
}
function donut(segs, centro) {
  const t = segs.reduce((s, x) => s + x.v, 0);
  if (!t) return '<div class="empty">Sem dados neste mês.</div>';
  let acc = 0;
  const arcs = segs.filter(s => s.v > 0).map(s => { const p = s.v / t * 100, o = 25 - acc; acc += p; return `<circle cx="21" cy="21" r="15.915" fill="none" stroke="${esc(s.cor)}" stroke-width="6.5" stroke-dasharray="${p} ${100 - p}" stroke-dashoffset="${o}"/>`; }).join("");
  return `<svg class="donut" viewBox="0 0 42 42">${arcs}<text x="21" y="22" text-anchor="middle" font-size="3.4" font-weight="700" fill="currentColor">${esc(centro)}</text></svg>
  <div class="leg">${segs.map(s => `<div ${s.attr ? s.attr + ' class="clk"' : ""}><i style="background:${esc(s.cor)}"></i><span>${esc(s.nome)}</span><b>${brl(s.v)}</b></div>`).join("")}</div>`;
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
// Janela de detalhes usada pelos cartões clicáveis do resumo
function modalLista(titulo, ls, pre = "") {
  ls = [...ls].sort((a, b) => b.data.localeCompare(a.data)); const rk = porCategoria(ls.filter(l => l.tipo !== "transferencia"));
  $("#modal").innerHTML = `<div class="ov" data-act="fechar"><div class="modal" style="max-width:540px"><h2>${titulo}</h2>${pre}
    <div class="sum" style="justify-content:flex-start;margin:0 0 10px"><span>${ls.length} ${ls.length === 1 ? "lançamento" : "lançamentos"}</span><span>total <b>${brl(total(ls))}</b></span></div>
    ${rk.length > 1 ? `<div style="margin-bottom:8px">${barras(rk)}</div>` : ""}${ls.map(l => `<div class="day" style="padding:8px 4px 0">${dataBR(l.data)}</div>${linha(l)}`).join("") || '<div class="empty">Nenhum lançamento.</div>'}
    <div class="acts"><span class="sp"></span><button class="btn ghost" data-act="fechar" data-force="1">Fechar</button></div></div></div>`;
}
const linhaInfo = (rot, val, c = "") => `<div><span>${rot}</span><b class="${c}">${val}</b></div>`;
function detalhe(d) {
  const P = periodo(), desp = noPer("despesa", P), rec = noPer("receita", P), k = d.k;
  if (k === "des") return modalLista(`Despesas ${P.nome} — ${P.label}`, desp);
  if (k === "rec") return modalLista(`Receitas ${P.nome} — ${P.label}`, rec);
  if (k === "bal") return modalLista(`Balanço ${P.nome} — ${P.label}`, [...rec, ...desp], `<div class="leg" style="margin-bottom:10px">${linhaInfo("Receitas", brl(total(rec)), "pos")}${linhaInfo("Despesas", brl(total(desp)), "neg")}${linhaInfo("Balanço (receitas − despesas)", brl(total(rec) - total(desp)), cls(total(rec) - total(desp)))}</div>`);
  if (k === "cat") { const ls = desp.filter(l => (l.emprestimo ? "__emp" : l.categoriaId || "") === d.id), c = cat(d.id), sm = new Map(); ls.forEach(l => sm.set(l.subgrupo || "Sem subgrupo", (sm.get(l.subgrupo || "Sem subgrupo") || 0) + l.valor));
    const subs = [...sm].sort((a, b) => b[1] - a[1]), t = total(ls) || 1, tudo = total(desp) || 1;
    return modalLista(`${c.icone} ${esc(c.nome)} — ${P.label}`, ls, `<div class="leg" style="margin-bottom:10px">${linhaInfo("Parte do total gasto", (t / tudo * 100).toFixed(1).replace(".", ",") + "%")}${subs.length > 1 || subs[0]?.[0] !== "Sem subgrupo" ? subs.map(([n, v]) => linhaInfo("› " + esc(n), brl(v))).join("") : ""}</div>`); }
  if (k === "rcr") return modalLista(`Despesas ${{ fixa: "fixas", parcelada: "parceladas", variavel: "variáveis" }[d.v]} — ${P.label}`, desp.filter(l => (l.recorrencia || "variavel") === d.v));
  if (k === "conta") { const c = by("contas", d.id), r = resumoConta(c, S.mes, P.ini, P.fim), ls = S.data.lancamentos.filter(l => !l.cartaoId && (l.contaId === c.id || l.contaDestinoId === c.id) && l.data >= P.ini && l.data <= P.fim);
    return modalLista(`${esc(c.nome)} — ${P.label}`, ls, `<div class="leg" style="margin-bottom:10px">${linhaInfo("Saldo antes do período", brl(r.inicial))}${linhaInfo("Receitas", brl(r.rec), "pos")}${linhaInfo("Despesas (inclui faturas pagas)", brl(r.des), "neg")}${linhaInfo("Transferências recebidas / enviadas", `${brl(r.tc)} / ${brl(r.td)}`)}${linhaInfo("Saldo no fim do período", brl(r.saldo), cls(r.saldo))}${linhaInfo("Previsto (com pendentes)", brl(r.previsto), cls(r.previsto))}</div><div class="acts" style="justify-content:flex-start;margin:0 0 10px"><button class="btn ghost" data-act="editConta" data-id="${c.id}">Editar conta</button></div>`); }
  if (k === "saldo") { const rs = contasOrd().map(c => ({ c, ...resumoConta(c, S.mes, P.ini, P.fim) })), pend = S.data.lancamentos.filter(l => !l.efetivada && !l.cartaoId && l.data <= P.fim);
    const fats = S.data.cartoes.flatMap(c => [...new Set(S.data.lancamentos.filter(l => l.cartaoId === c.id).map(fatMes))].filter(ym => !c.pagas?.[ym] && dataNoMes(ym, c.vencimento || 10) <= P.fim).map(ym => ({ c, ym, v: fatTotal(c.id, ym) }))).filter(x => x.v > 0);
    return modalLista(`Detalhamento do saldo — ${P.label}`, pend, `<div class="leg" style="margin-bottom:10px">${rs.map(x => linhaInfo(`${esc(x.c.nome)} <small class="mut">(previsto ${brl(x.previsto)})</small>`, brl(x.saldo), cls(x.saldo))).join("")}
      ${linhaInfo("Saldo no fim do período", brl(r2(rs.reduce((a, x) => a + x.saldo, 0))), "b")}${fats.map(x => linhaInfo(`💳 Fatura ${esc(x.c.nome)} de ${MESES[Number(x.ym.slice(5)) - 1].toLowerCase()} (a pagar)`, "-" + brl(x.v), "neg")).join("")}${linhaInfo("Saldo previsto", brl(r2(rs.reduce((a, x) => a + x.previsto, 0))), "b")}</div><div class="day" style="padding-left:4px">Lançamentos pendentes que entram no previsto</div>`); }
}
function evolucao7() {
  const fim = hoje(), dias = Array.from({ length: 7 }, (_, i) => addDias(fim, i - 6)), vs = dias.map(d => total(S.data.lancamentos.filter(l => l.tipo === "despesa" && l.data === d)));
  const max = Math.max(...vs, 1), W = 320, H = 130, x = i => 16 + i * (W - 32) / 6, y = v => H - 26 - v / max * (H - 44), pts = vs.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%"><polygon points="16,${H - 26} ${pts} ${W - 16},${H - 26}" fill="#d9483b" opacity=".12"/><polyline points="${pts}" fill="none" stroke="#d9483b" stroke-width="1.8"/>
  ${vs.map((v, i) => `<g data-act="dia" data-d="${dias[i]}" style="cursor:pointer"><rect x="${x(i) - 20}" y="0" width="40" height="${H}" fill="transparent"/><circle cx="${x(i)}" cy="${y(v)}" r="3" fill="#d9483b"><title>${dataBR(dias[i])}: ${brl(v)}</title></circle><text x="${x(i)}" y="${H - 8}" font-size="8.5" text-anchor="middle" fill="currentColor" opacity=".6">${dataBR(dias[i]).slice(0, 5)}</text></g>`).join("")}</svg>
  <div class="sum" style="margin-top:2px">Total nos 7 dias: <b class="neg">${brl(total(vs.map(v => ({ valor: v }))))}</b> · toque em um dia para ver</div>`;
}
function seisMeses() {
  const ms = Array.from({ length: 6 }, (_, i) => addMes(S.mes, i - 5)), d = ms.map(ym => ({ ym, r: total(doMes("receita", ym)), g: total(doMes("despesa", ym)) })), max = Math.max(...d.map(x => Math.max(x.r, x.g)), 1), W = 320, H = 150, base = H - 24, slot = (W - 12) / 6, bw = 15, h = v => v / max * (base - 12);
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%"><line x1="6" y1="${base}" x2="${W - 6}" y2="${base}" stroke="currentColor" opacity=".2"/>${d.map((x, i) => { const cx = 6 + slot * i + slot / 2;
    return `<g data-act="irMes" data-v="${x.ym}" style="cursor:pointer"><rect x="${cx - slot / 2}" y="0" width="${slot}" height="${H}" fill="${x.ym === S.mes ? "currentColor" : "transparent"}" opacity=".05"/><rect x="${cx - bw - 1}" y="${base - h(x.r)}" width="${bw}" height="${h(x.r)}" rx="3" fill="#2e9e5b"><title>Receitas: ${brl(x.r)}</title></rect><rect x="${cx + 1}" y="${base - h(x.g)}" width="${bw}" height="${h(x.g)}" rx="3" fill="#d9483b"><title>Despesas: ${brl(x.g)}</title></rect><text x="${cx}" y="${H - 8}" font-size="9" text-anchor="middle" fill="currentColor" opacity=".6">${MESES[Number(x.ym.slice(5)) - 1].slice(0, 3).toLowerCase()}</text></g>`; }).join("")}</svg>
  <div class="sum" style="margin-top:2px"><span><i class="lg" style="background:#2e9e5b"></i>Receitas</span><span><i class="lg" style="background:#d9483b"></i>Despesas</span><span>· toque em um mês para abrir</span></div>`;
}
V.inicio = () => {
  const P = periodo(), PA = periodo(-1), m = S.mes;
  const rs = contasOrd().map(c => ({ c, ...resumoConta(c, m, P.ini, P.fim) }));
  const T = k => r2(rs.reduce((s, x) => s + x[k], 0));
  const desp = noPer("despesa", P), rec = noPer("receita", P), ef = a => total(a.filter(l => l.efetivada)), bal = r2(total(rec) - total(desp));
  const fat = faturasNoPer(P), fatAnt = faturasNoPer(PA), variacao = (a, b) => b > 0 ? `<span class="chip">${a >= b ? "↗" : "↘"} ${Math.abs((a - b) / b * 100).toFixed(0)}% vs. ${P.ant}</span>` : "";
  const rk = porCategoria(desp);
  const rc = k => total(desp.filter(l => (l.recorrencia || "variavel") === k));
  const stat = (act, cor, sym, v, lbl, extra = "", c = "") => `<div class="card stat clk" ${act}><span class="dot" style="background:${cor}">${sym}</span><div><div class="v ${c}">${brl(v)}</div><small>${lbl}</small>${extra}</div></div>`;
  const prev = v => `<small class="mut">Previsto ${brl(v)}</small>`;
  const pend = S.data.lancamentos.filter(l => !l.efetivada && !l.cartaoId && l.data <= P.fim).sort((a, b) => a.data.localeCompare(b.data));
  const devem = S.data.pessoas.map(p => ({ p, ...contaPessoa(p.id) })).filter(x => x.deve > 0.005).sort((a, b) => b.deve - a.deve);
  const objs = [...S.data.objetivos].sort((a, b) => (a.prazo || "9999").localeCompare(b.prazo || "9999"));
  return `${avisoFixas()}<div class="pertop"><div class="seg per">${[["dia", "Diário"], ["semana", "Semanal"], ["mes", "Mensal"], ["ano", "Anual"]].map(([k, n]) => `<button class="${S.per === k ? "on" : ""}" data-act="per" data-v="${k}">${n}</button>`).join("")}</div><span class="mut">Resumo ${P.nome}: <b>${P.label}</b> · toque nos quadros para ver os detalhes</span></div>
  <div class="grid dash">
  <div class="card clk" data-act="det" data-k="saldo"><div class="tl">
    <div><span class="v">${brl(T("inicial"))}</span><small>Inicial (antes do período)</small></div>
    <div class="now"><span class="v ${cls(T("saldo"))}">${brl(T("saldo"))}</span><small>Saldo no fim do período</small></div>
    <div><span class="v">${brl(T("previsto"))}</span><small>Previsto</small></div></div><div class="vermais">ver detalhamento ›</div></div>
  <div class="card"><h3>Ranking de categorias <button class="link" data-act="det" data-k="des">ver tudo</button></h3>${barras(rk, true)}${rk.length ? `<div class="sum">Total gasto ${P.nome}: ${brl(total(desp))} · toque em uma categoria</div>` : ""}</div>
  <div class="c-side">
    ${cardFixas()}
    <div class="card"><h3>A pagar e a receber <small class="mut" style="font-weight:400">${pend.length} pendente${pend.length === 1 ? "" : "s"}</small></h3>${pend.slice(0, 6).map(l => `<div class="row" data-act="editL" data-id="${l.id}">${av(cat(l.emprestimo ? "__emp" : l.categoriaId).icone, cat(l.emprestimo ? "__emp" : l.categoriaId).cor)}<div class="tx"><div>${esc(l.descricao)}</div><small class="${l.data < hoje() ? "neg" : ""}">${l.data < hoje() ? "venceu em" : "para"} ${dataBR(l.data)}</small></div><span class="val ${l.tipo === "receita" ? "pos" : "neg"}">${brl(l.valor)}</span><button class="ck" data-act="toggleL" data-id="${l.id}" title="Marcar como pago/recebido">✓</button></div>`).join("") || '<div class="empty">Nada pendente até o fim do período.</div>'}
      ${pend.length > 6 ? `<div class="sum"><button class="link" data-act="det" data-k="saldo">ver os ${pend.length} pendentes</button></div>` : ""}</div>
    ${S.data.cartoes.length ? `<div class="card"><h3>Cartões de crédito <button class="link" data-act="nav" data-v="cartoes">ver</button></h3>${S.data.cartoes.map(c => { const st = stFatura(c), ab = emAberto(c); return `<div class="row" data-act="irCartao" data-id="${c.id}">${av(ini(c.nome), c.cor)}<div class="tx"><div>${esc(c.nome)}</div><small>vence ${dataBR(st.venc).slice(0, 5)} · disponível ${brl((c.limite || 0) - ab)}</small><div style="margin-top:4px">${st.tags}</div></div><span class="val ${st.paga ? "" : "neg"}">${brl(st.paga ? st.paga.valor : st.ft)}</span></div>`; }).join("")}</div>` : ""}
    <div class="card"><h3>Orçamentos de despesas <button class="link" data-act="nav" data-v="orcamentos">ver</button></h3>${orcLista(true)}</div>
    <div class="card"><h3>Despesas por recorrência</h3>${donut([{ nome: "Fixas", cor: "#4a9be0", v: rc("fixa"), attr: 'data-act="det" data-k="rcr" data-v="fixa"' }, { nome: "Parceladas", cor: "#f5b335", v: rc("parcelada"), attr: 'data-act="det" data-k="rcr" data-v="parcelada"' }, { nome: "Variáveis", cor: "#e0564a", v: rc("variavel"), attr: 'data-act="det" data-k="rcr" data-v="variavel"' }], brl(total(desp)))}</div>
  </div>
  <div class="c-main">
    <div class="stats s5">
      ${stat('data-act="nav" data-v="contas"', "#3b7ddd", "🏦", T("saldo"), "Saldo nas contas", prev(T("previsto")), cls(T("saldo")))}
      ${stat('data-act="det" data-k="rec"', "#2e9e5b", "＋", ef(rec), "Receitas recebidas", prev(total(rec)) + variacao(total(rec), total(noPer("receita", PA))), "pos")}
      ${stat('data-act="det" data-k="des"', "#d9483b", "－", ef(desp), "Despesas pagas", prev(total(desp)) + variacao(total(desp), total(noPer("despesa", PA))), "neg")}
      ${stat('data-act="det" data-k="bal"', "#f5b335", "⇅", r2(ef(rec) - ef(desp)), "Balanço", prev(bal), cls(ef(rec) - ef(desp)))}
      ${stat('data-act="nav" data-v="cartoes"', "#5b6ee0", "💳", fat, S.per === "mes" ? "Total faturas" : "Faturas que vencem no período", variacao(fat, fatAnt))}
    </div>
    <div class="card"><h3>Contas <button class="link" data-act="nav" data-v="contas">ver</button></h3>${tabContas(rs, true, 'det" data-k="conta')}</div>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr));align-items:start">
      <div class="card"><h3>Evolução das despesas <small class="mut" style="font-weight:400">últimos 7 dias</small></h3>${evolucao7()}</div>
      <div class="card"><h3>Últimas despesas <button class="link" data-act="nav" data-v="lancamentos">ver</button></h3>${S.data.lancamentos.filter(l => l.tipo === "despesa" && l.data <= hoje()).sort((a, b) => b.data.localeCompare(a.data)).slice(0, 5).map(linha).join("") || '<div class="empty">Nenhuma despesa ainda.</div>'}</div>
      <div class="card"><h3>Receitas x despesas <small class="mut" style="font-weight:400">últimos 6 meses</small></h3>${seisMeses()}</div>
      <div class="card"><h3>Receitas por categoria <button class="link" data-act="det" data-k="rec">ver</button></h3>${donut(porCategoria(rec).map(r => ({ nome: r.c.icone + " " + r.c.nome, cor: r.c.cor, v: r.v })), brl(total(rec)))}</div>
      ${S.data.pessoas.length ? `<div class="card"><h3>A receber de pessoas e empresas <button class="link" data-act="nav" data-v="pessoas">ver</button></h3>${devem.slice(0, 5).map(x => `<div class="row" data-act="verPessoa" data-id="${x.p.id}">${av(ini(x.p.nome), x.p.cor)}<div class="tx"><div>${esc(x.p.nome)}</div><small>já pagou ${brl(x.pago)} de ${brl(x.gasto)}</small></div><span class="val neg">${brl(x.deve)}</span></div>`).join("") || '<div class="empty">Ninguém devendo. 👍</div>'}${devem.length ? `<div class="sum">Total a receber: <b class="neg">${brl(r2(devem.reduce((a, x) => a + x.deve, 0)))}</b></div>` : ""}</div>` : ""}
      ${objs.length ? `<div class="card"><h3>Objetivos <button class="link" data-act="nav" data-v="objetivos">ver</button></h3>${objs.slice(0, 4).map(o => { const p = o.alvo ? (o.guardado || 0) / o.alvo * 100 : 0; return `<div class="row" data-act="nav" data-v="objetivos">${av("🎯", o.cor)}<div class="tx"><div style="display:flex;justify-content:space-between"><span>${esc(o.nome)}</span><b>${p.toFixed(0)}%</b></div><div class="prog" style="margin-top:5px"><i style="width:${Math.min(100, p)}%;background:${esc(o.cor)}"></i></div><small>${brl(o.guardado || 0)} de ${brl(o.alvo || 0)}</small></div></div>`; }).join("")}</div>` : ""}
    </div>
  </div></div>`;
};
function tabContas(rs, curto, act = "editConta") {
  if (!rs.length) return '<div class="empty">Nenhuma conta cadastrada.</div>';
  const T = k => r2(rs.reduce((s, x) => s + x[k], 0)), td = (v, c = "") => `<td class="${c}">${brl(v)}</td>`;
  return `<div style="overflow:auto"><table><thead><tr><th>Descrição</th>${curto ? "" : '<th class="hs">Saldo inicial</th>'}<th>Receitas</th><th>Despesas</th>${curto ? "" : '<th class="hs">Transf. créd.</th><th class="hs">Transf. déb.</th>'}<th>Saldo</th><th class="hs">Previsto</th></tr></thead>
  <tbody>${rs.map(x => `<tr class="click" data-act="${act}" data-id="${x.c.id}"><td><div class="who">${curto ? "" : '<span class="grip" data-act="nada" title="Arrastar para reordenar" aria-label="Arrastar para reordenar">⠿</span>'}${av(ini(x.c.nome), x.c.cor)}${esc(x.c.nome)}</div></td>${curto ? "" : td(x.inicial, "hs " + cls(x.inicial))}${td(x.rec)}${td(x.des)}${curto ? "" : td(x.tc, "hs") + td(x.td, "hs")}${td(x.saldo, "b " + cls(x.saldo))}${td(x.previsto, "hs " + cls(x.previsto))}</tr>`).join("")}</tbody>
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
const fixasMes = (ym = S.mes) => S.data.fixas.map(f => ({ f, ...statusFixa(f, ym) })).sort((a, b) => b.venc.localeCompare(a.venc) || a.f.nome.localeCompare(b.f.nome));
function cardFixas() {
  const fs = fixasMes(), pagas = fs.filter(x => x.k === 3).length, tot = r2(fs.reduce((s0, x) => s0 + (x.l?.valor || 0), 0));
  return `<div class="card" id="cfixas"><h3>Contas mensais <button class="link" data-act="editFixa">+ nova</button></h3>
  ${fs.map(x => { const c = cat(x.f.categoriaId); return `<div class="row" data-act="lancarFixa" data-id="${x.f.id}">${av(c.icone, c.cor)}<div class="tx"><div>${esc(x.f.nome)}</div><small>${x.txt}</small></div>
    <div class="r"><div class="b">${x.l ? brl(x.l.valor) : "—"}</div><span class="tag" style="background:${x.cor}">${x.tag}</span></div><button data-act="editFixa" data-id="${x.f.id}" title="Editar conta mensal">${ico("mais")}</button></div>`; }).join("")
    || '<div class="empty">Cadastre água, luz, internet… e o app lembra você todo mês.</div>'}
  ${fs.length ? `<div class="sum">${pagas} de ${fs.length} pagas · lançado no mês: <b>${brl(tot)}</b></div>` : ""}</div>`;
}
// O aviso só aparece quando chega o dia do vencimento (ou depois) e a conta mensal ainda não foi paga
const fixasVencidas = (ym = S.mes) => fixasMes(ym).filter(x => x.k !== 3 && x.venc <= hoje());
function avisoFixas() {
  const p = fixasVencidas(); if (!p.length) return "";
  const at = p.filter(x => x.venc < hoje()).length, quando = x => x.venc === hoje() ? "vence hoje" : `venceu em ${dataBR(x.venc).slice(0, 5)}`;
  return `<div class="aviso ${at ? "ruim" : ""}" data-act="lancarFixa" data-id="${p[0].f.id}"><b>${at ? "⚠" : "🔔"} ${p.length} ${p.length === 1 ? "conta mensal para pagar" : "contas mensais para pagar"}:</b> ${p.map(x => `${esc(x.f.nome)} — ${quando(x)}${x.l ? " · " + brl(x.l.valor) : " · falta lançar o valor"}`).join(" · ")}</div>`;
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
  return `<div class="tools"><h2 style="flex:1">Gastos por pessoa e empresa</h2><button class="btn" data-act="editPessoa">Nova pessoa</button><button class="btn ghost" data-act="editPessoa" data-grupo="empresas">Nova empresa</button></div>
  <div class="grid cc">${card({ id: "", nome: "Eu", cor: "#3b7ddd" }, meus)}</div>
  ${(() => { const bloco = ([k, n]) => { const g = ps.filter(p => grupoDe(p) === k), deve = r2(g.reduce((s0, p) => s0 + Math.max(0, contaPessoa(p.id).deve), 0)), emp = k === "empresas";
      return `<div class="gh"><h3>${n}</h3><span>${g.length} ${emp ? (g.length === 1 ? "empresa" : "empresas") : g.length === 1 ? "pessoa" : "pessoas"} · a receber <b class="${deve > 0 ? "neg" : ""}">${brl(deve)}</b></span></div>
      <div class="grid cc pgrp" data-grupo="${k}">${g.map(p => card(p, gastosDe(p.id))).join("")}<div class="vazio">${emp ? "Arraste ou cadastre uma empresa aqui" : "Arraste alguém para cá"}</div></div>`; };
    return `<div class="pe"><div>${GRUPOS.filter(([k]) => k !== "empresas").map(bloco).join("")}</div><div class="pe-emp">${bloco(GRUPOS.find(([k]) => k === "empresas"))}</div></div>`; })()}
  <div class="sum"><span>Meus gastos no mês: <b>${brl(total(meus))}</b></span><span>Gastos de pessoas e empresas no mês: <b>${brl(outros)}</b></span><span>Total a receber até ${mesNome}: <b class="neg">${brl(r2(ps.reduce((s0, p) => s0 + Math.max(0, contaPessoa(p.id).deve), 0)))}</b></span></div>
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
/* ---------- Energia (Equatorial + solar) ---------- */
const kwh = v => (Math.abs(v) < 0.005 ? 0 : v).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " kWh";
const numE = v => v === "" || v == null ? null : parseMoney(v);
// Para cada mês: solar usado na hora = gerado − injetado; consumo da casa = rede + solar usado na hora;
// créditos do mês = injetado − consumido da rede; estoque = soma acumulada (nunca abaixo de zero)
const dataLeit = e => e.data || `${e.mes}-01`;
const diasEntre = (a, b) => Math.round((Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8)) - Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8))) / 864e5);
// Cada fonte (Equatorial, Solplanet, medidor) pode ser lida em dias diferentes. A Equatorial informa o total do período (fatura);
// o inversor e o medidor mostram um número acumulado, então o consumo sai da diferença entre duas leituras. Cada trecho vira uma
// média por dia e o app recalcula quanto cabe exatamente nos dias da Equatorial.
const temEq = e => (Number(e.consumido) || 0) > 0 || (Number(e.injetado) || 0) > 0;
function segEquatorial() {
  let ant = null; const out = [];
  for (const e of S.data.energia.filter(temEq).sort((a, b) => dataLeit(a).localeCompare(dataLeit(b)))) {
    const fim = dataLeit(e); let ini = e.eqIni || ant || addDias(fim, -30); const estimado = !e.eqIni && !ant; if (ini >= fim) ini = addDias(fim, -1);
    out.push({ id: e.id, ini, fim, dias: diasEntre(ini, fim), estimado }); ant = fim;
  }
  return out;
}
function segFonte(acumK, valK, fimK, iniK) {
  let ant = null, antAcum = null, antAcumData = null; const out = [], fimDe = e => e[fimK] || dataLeit(e);
  for (const e of [...S.data.energia].sort((a, b) => fimDe(a).localeCompare(fimDe(b)))) {
    const fim = fimDe(e), a = Number(e[acumK]) || 0, v = Number(e[valK]) || 0;
    if (a > 0) {
      if (antAcum != null && fim > antAcumData && a >= antAcum) { const dias = diasEntre(antAcumData, fim); out.push({ id: e.id, ini: antAcumData, fim, dias, v: r2(a - antAcum), taxa: (a - antAcum) / dias, de: antAcum, ate: a, acum: true }); }
      antAcum = a; antAcumData = fim; ant = fim;
    } else if (v > 0) {
      let ini = e[iniK] || ant || addDias(fim, -30); const estimado = !e[iniK] && !ant; if (ini >= fim) ini = addDias(fim, -1);
      const dias = diasEntre(ini, fim); out.push({ id: e.id, ini, fim, dias, v, taxa: v / dias, estimado }); ant = fim;
    }
  }
  return { segs: out, leituras: S.data.energia.filter(e => (Number(e[acumK]) || 0) > 0).length };
}
// Energia de uma fonte dentro do intervalo (a, b]: soma dias × média diária; dias sem leitura usam a média do trecho mais próximo
function energiaNo(segs, a, b) {
  if (!segs.length) return null; let tot = 0, fora = 0;
  for (let d = addDias(a, 1); d <= b; d = addDias(d, 1)) {
    let sg = segs.find(x => d > x.ini && d <= x.fim);
    if (!sg) { fora++; sg = segs.find(x => x.ini >= d) || segs[segs.length - 1]; }
    tot += sg.taxa;
  }
  return { v: r2(tot), fora, usados: segs.filter(x => x.fim > a && x.ini < b) };
}
function energiaCalc() {
  let estoque = Number(by("config", "energia")?.creditoInicial) || 0;
  const sol = segFonte("gerAcum", "gerado", "solData", "solIni"), med = segFonte("medAcum", "medidor", "medData", "medIni");
  return segEquatorial().map(q => {
    const e = by("energia", q.id), cons = e.consumido || 0, inj = e.injetado || 0, g = energiaNo(sol.segs, q.ini, q.fim), mm = energiaNo(med.segs, q.ini, q.fim);
    const ger = g ? g.v : null, direto = g ? r2(ger - inj) : null, casa = g ? r2(cons + direto) : null, saldoMes = r2(inj - cons), antes = estoque;
    const usados = saldoMes < 0 ? Math.min(antes, -saldoMes) : 0, pagar = saldoMes < 0 ? r2(-saldoMes - usados) : 0;
    estoque = r2(Math.max(0, antes + saldoMes));
    const informado = e.creditoFatura !== "" && e.creditoFatura != null; if (informado) estoque = Number(e.creditoFatura) || 0;
    const exato = (r, sg) => r && r.fora === 0 && r.usados.length === 1 && r.usados[0].ini === q.ini && r.usados[0].fim === q.fim;
    return { e, data: q.fim, de: q.ini, dias: q.dias, estimado: q.estimado, cons, inj, ger, g, gerAj: !!g && !exato(g), mm, medAj: !!mm && !exato(mm), solLeit: sol.leituras, medLeit: med.leituras,
      direto, casa, saldoMes, usados: r2(usados), pagar, estoque, informado, med: mm ? mm.v : null, dif: mm && g ? r2(mm.v - casa) : null,
      pAuto: ger > 0 ? direto / ger * 100 : 0, pSolar: casa > 0 ? direto / casa * 100 : 0 };
  });
}
function graficoEnergia(rows) {
  const d = rows.slice(-12); if (!d.length) return '<div class="empty">Sem dados ainda.</div>';
  const pd = (x, k) => Math.max(0, x[k] || 0) / (x.dias || 1), sr = [["ger", "#f5b335", "Gerado"], ["direto", "#2e9e5b", "Solar usado na hora"], ["inj", "#4a9be0", "Injetado"], ["cons", "#d9483b", "Consumido da rede"]];
  const max = Math.max(...d.flatMap(x => sr.map(([k]) => pd(x, k))), 1), W = 360, H = 180, base = H - 24, slot = (W - 16) / d.length, bw = Math.min(14, slot / 4 - 2), h = v => v / max * (base - 14);
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:640px;display:block;margin:0 auto"><line x1="6" y1="${base}" x2="${W - 6}" y2="${base}" stroke="currentColor" opacity=".2"/>
  ${d.map((x, i) => { const x0 = 8 + slot * i + (slot - (bw + 2) * 4) / 2; return sr.map(([k, cor, n], j) => `<rect x="${x0 + j * (bw + 2)}" y="${base - h(pd(x, k))}" width="${bw}" height="${h(pd(x, k))}" rx="3" fill="${cor}"><title>${n}: ${kwh(pd(x, k))}/dia</title></rect>`).join("") + `<text x="${8 + slot * i + slot / 2}" y="${H - 8}" font-size="9" text-anchor="middle" fill="currentColor" opacity=".6">${dataBR(x.data).slice(0, 5)}</text>`; }).join("")}</svg>
  <div class="sum" style="margin-top:4px">${sr.map(([, cor, n]) => `<span><i class="lg" style="background:${cor}"></i>${n}</span>`).join("")}<span>· valores em kWh por dia</span></div>`;
}
V.energia = () => {
  const rows = energiaCalc(), x = [...rows].reverse().find(r => ymOf(r.data) === S.mes), mes = `${MESES[Number(S.mes.slice(5)) - 1]} ${S.mes.slice(0, 4)}`, ini = Number(by("config", "energia")?.creditoInicial) || 0;
  const ant = [...rows].reverse().find(r => ymOf(r.data) < S.mes), estoqueAtual = x ? x.estoque : ant ? ant.estoque : ini, K = v => v == null ? "—" : kwh(v);
  const box = (cor, sym, v, lbl, c = "", extra = "") => `<div class="card stat"><span class="dot" style="background:${cor}">${sym}</span><div><div class="v ${c}">${v}</div><small>${lbl}</small>${extra}</div></div>`;
  const falta = n => n === 0 ? "nenhuma leitura lançada ainda" : "só há 1 leitura acumulada; o cálculo começa quando você lançar a próxima";
  const aj = (r, nome, n) => !r ? `<div><span>${nome}: ${falta(n)}</span><b>—</b></div>` : (r.usados.length ? r.usados.map(sg => `<div><span>${nome}: ${sg.acum ? `de ${kwh(sg.de).replace(" kWh", "")} para ${kwh(sg.ate)}` : `${kwh(sg.v)}`} entre ${dataBR(sg.ini).slice(0, 5)} e ${dataBR(sg.fim).slice(0, 5)} (${sg.dias} dias${sg.estimado ? ", início estimado" : ""}) = ${kwh(sg.v)} · ${kwh(sg.taxa)}/dia</span><b></b></div>`).join("") : `<div><span>${nome}: nenhuma leitura cai dentro deste período; usei a média diária da leitura mais próxima</span><b></b></div>`) + `<div><span>${nome} nos ${x.dias} dias da Equatorial${r.fora ? ` (${r.fora} ${r.fora === 1 ? "dia estimado" : "dias estimados"})` : ""}</span><b>${kwh(r.v)}</b></div>`;
  const pd = (r, v) => v == null ? "—" : kwh(v / (r.dias || 1));
  const lanc = [...S.data.energia].sort((a, b) => dataLeit(b).localeCompare(dataLeit(a)));
  return `<div class="tools"><h2 style="flex:1">Energia</h2><button class="btn" data-act="editEnergia">Nova leitura</button><button class="btn ghost" data-act="energiaIni">Créditos iniciais</button></div>
  ${x ? `<div class="sum" style="justify-content:flex-start;margin:0 2px 12px"><span>Período da Equatorial: <b>${dataBR(x.de)} a ${dataBR(x.data)}</b> (${x.dias} dias${x.estimado ? " — início estimado em 30 dias; edite e informe a data da leitura anterior" : ""})</span>${x.casa != null ? `<span>média da casa: <b>${kwh(x.dias > 0 ? x.casa / x.dias : 0)}/dia</b></span>` : ""}</div>
  <div class="stats s5" style="margin-bottom:14px">
    ${box("#f5b335", "☀", K(x.ger), "Gerado (Solplanet)", "", x.ger == null ? '<span class="chip">aguardando a próxima leitura</span>' : x.gerAj ? '<span class="chip">ajustado ao período da Equatorial</span>' : "")}
    ${box("#2e9e5b", "⚡", K(x.direto), "Solar usado na hora", x.direto == null ? "" : x.direto < 0 ? "neg" : "pos", x.direto == null ? "" : `<span class="chip">${x.pAuto.toFixed(0)}% do que foi gerado</span>`)}
    ${box("#4a9be0", "↗", kwh(x.inj), "Injetado na Equatorial")}
    ${box("#d9483b", "↘", kwh(x.cons), "Consumido da Equatorial")}
    ${box("#7e57c2", "🏠", K(x.casa), "Consumo da casa (calculado)", "", x.casa == null ? "" : `<span class="chip">${x.pSolar.toFixed(0)}% veio do solar</span>`)}
    ${box(x.saldoMes >= 0 ? "#2e9e5b" : "#f29a38", "±", (x.saldoMes >= 0 ? "+" : "−") + kwh(Math.abs(x.saldoMes)), x.saldoMes >= 0 ? "Créditos adicionados no período" : "Faltou no período (injetado − consumido)", x.saldoMes >= 0 ? "pos" : "neg", x.saldoMes < 0 ? `<span class="chip">usou ${kwh(x.usados)} do estoque${x.pagar > 0 ? " · " + kwh(x.pagar) + " sem crédito" : ""}</span>` : "")}
    ${box("#3b7ddd", "🔋", kwh(x.estoque), "Estoque de créditos na Equatorial", "", x.informado ? '<span class="chip">valor informado da fatura</span>' : "")}
  </div>
  ${x.direto != null && x.direto < 0 ? '<div class="aviso ruim" style="cursor:default">O injetado ficou maior que o gerado neste período, o que não é possível. Confira as datas e os valores da Solplanet.</div>' : ""}
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr));align-items:start;margin-bottom:14px">
    <div class="card"><h3>Conferência com o medidor privado</h3>${x.med != null && x.casa != null ? `<div class="leg"><div style="border:0"><span>Medidor privado no período da Equatorial</span><b>${kwh(x.med)}</b></div><div><span>Calculado: rede (${kwh(x.cons)}) + solar usado na hora (${kwh(x.direto)})</span><b>${kwh(x.casa)}</b></div>
      <div><span>Diferença (medidor − calculado)</span><b class="${Math.abs(x.dif) > Math.max(5, x.casa * 0.03) ? "neg" : "pos"}">${x.dif >= 0 ? "+" : "−"}${kwh(Math.abs(x.dif))}${x.casa ? ` (${(x.dif / x.casa * 100).toFixed(1).replace(".", ",")}%)` : ""}</b></div>
      <div><span>Solar usado na hora segundo o medidor (medidor − rede)</span><b>${kwh(r2(x.med - x.cons))}</b></div></div>
      <div class="sum" style="justify-content:flex-start">${Math.abs(x.dif) > Math.max(5, x.casa * 0.03) ? "A diferença passou de 3%. Enquanto houver dias estimados isso é esperado; tende a diminuir com mais leituras." : "As medições batem (diferença de até 3%)."}</div>` : x.med != null ? `<div class="leg"><div style="border:0"><span>Medidor privado no período da Equatorial</span><b>${kwh(x.med)}</b></div><div><span>Solar usado na hora segundo o medidor (medidor − rede)</span><b>${kwh(r2(x.med - x.cons))}</b></div></div><div class="sum" style="justify-content:flex-start">Falta a geração da Solplanet para fechar a conferência.</div>` : `<div class="empty">Medidor privado: ${falta(x.medLeit)}.</div>`}</div>
    <div class="card"><h3>Padronização das datas</h3><div class="leg"><div style="border:0"><span>Equatorial: ${dataBR(x.de).slice(0, 5)} a ${dataBR(x.data).slice(0, 5)} (${x.dias} dias) — é o período de referência</span><b></b></div>${aj(x.g, "Solplanet", x.solLeit)}${aj(x.mm, "Medidor", x.medLeit)}</div>
      <div class="sum" style="justify-content:flex-start">O inversor e o medidor mostram números acumulados. O app pega a diferença entre duas leituras, transforma em média por dia e recalcula para os mesmos dias da fatura da Equatorial, mesmo que você tenha olhado cada um em um dia diferente.</div></div>
  </div>` : `<div class="card empty" style="margin-bottom:14px">Nenhuma fatura da Equatorial lançada em ${mes.toLowerCase()}. Estoque de créditos até aqui: <b>${kwh(estoqueAtual)}</b>.</div>`}
  <div class="card" style="margin-bottom:14px"><h3>Comparação entre períodos (média por dia)</h3>${rows.length ? graficoEnergia(rows) + `<div style="overflow:auto;margin-top:10px"><table><thead><tr><th>Leitura</th><th>Dias</th><th>Gerado/dia</th><th>Usado na hora/dia</th><th>Injetado/dia</th><th>Consumido rede/dia</th><th>Casa/dia</th><th>Medidor/dia</th></tr></thead><tbody>
    ${[...rows].reverse().map(r => `<tr class="click" data-act="editEnergia" data-id="${r.e.id}"><td>${dataBR(r.data)}</td><td>${r.dias}</td><td>${pd(r, r.ger)}</td><td>${pd(r, r.direto)}</td><td>${pd(r, r.inj)}</td><td>${pd(r, r.cons)}</td><td class="b">${pd(r, r.casa)}</td><td>${pd(r, r.med)}</td></tr>`).join("")}</tbody></table></div>` : '<div class="empty">Lance uma fatura da Equatorial para começar.</div>'}</div>
  <div class="card" style="margin-bottom:14px"><h3>Histórico (totais do período da Equatorial)</h3>${rows.length ? `<div style="overflow:auto"><table><thead><tr><th>Data da leitura</th><th>Dias</th><th>Gerado</th><th>Usado na hora</th><th>Injetado</th><th>Consumido rede</th><th>Casa (calc.)</th><th>Medidor</th><th>Diferença</th><th>Créditos do período</th><th>Estoque</th></tr></thead><tbody>
    ${[...rows].reverse().map(r => `<tr class="click" data-act="editEnergia" data-id="${r.e.id}"><td>${dataBR(r.data)}</td><td>${r.dias}</td><td>${K(r.ger)}${r.gerAj ? " ~" : ""}</td><td>${K(r.direto)}</td><td>${kwh(r.inj)}</td><td>${kwh(r.cons)}</td><td>${K(r.casa)}</td><td>${K(r.med)}${r.medAj ? " ~" : ""}</td><td>${r.dif == null ? "—" : (r.dif >= 0 ? "+" : "−") + kwh(Math.abs(r.dif))}</td><td class="${cls(r.saldoMes)}">${(r.saldoMes >= 0 ? "+" : "−") + kwh(Math.abs(r.saldoMes))}</td><td class="b">${kwh(r.estoque)}${r.informado ? " *" : ""}</td></tr>`).join("")}</tbody></table></div>
    <div class="sum">~ valor ajustado ao período da Equatorial · * estoque informado por você a partir da fatura · créditos iniciais: ${kwh(ini)}.</div>` : '<div class="empty">Nenhuma fatura lançada.</div>'}</div>
  <div class="card"><h3>Leituras lançadas</h3>${lanc.map(e => `<div class="row" data-act="editEnergia" data-id="${e.id}"><div class="tx"><div>${dataBR(dataLeit(e))}</div><small>${[temEq(e) ? `Equatorial: consumiu ${kwh(e.consumido || 0)}, injetou ${kwh(e.injetado || 0)}` : "", e.gerAcum ? `Solplanet acumulado: ${kwh(e.gerAcum)}${e.solData && e.solData !== dataLeit(e) ? " em " + dataBR(e.solData).slice(0, 5) : ""}` : e.gerado ? `Solplanet no período: ${kwh(e.gerado)}` : "", e.medAcum ? `Medidor acumulado: ${kwh(e.medAcum)}${e.medData && e.medData !== dataLeit(e) ? " em " + dataBR(e.medData).slice(0, 5) : ""}` : e.medidor ? `Medidor no período: ${kwh(e.medidor)}` : ""].filter(Boolean).join(" · ") || "sem valores"}</small></div><span class="link">editar</span></div>`).join("") || '<div class="empty">Toque em "Nova leitura" para registrar a primeira.</div>'}</div>`;
};
function formEnergia(id) {
  const o = by("energia", id), n = v => v ? moneyIn(v) : "", hj = ymOf(hoje()) === S.mes ? hoje() : `${S.mes}-01`;
  openForm({ title: o ? "Editar leitura de energia" : "Nova leitura de energia",
    values: o ? { data: dataLeit(o), eqIni: o.eqIni || "", consumido: n(o.consumido), injetado: n(o.injetado), gerAcum: n(o.gerAcum), solData: o.solData || "", gerado: n(o.gerado), solIni: o.solIni || "", medAcum: n(o.medAcum), medData: o.medData || "", medidor: n(o.medidor), medIni: o.medIni || "", creditoFatura: o.creditoFatura === "" || o.creditoFatura == null ? "" : moneyIn(o.creditoFatura) || "0", valor: n(o.valor) } : { data: hj },
    fields: [{ k: "data", label: "Data deste lançamento (na fatura: a data da leitura atual)", type: "date" },
      { type: "titulo", label: "Equatorial — preencha só quando chegar a fatura" }, { k: "consumido", label: "Energia consumida da rede no período (kWh)", type: "money" }, { k: "injetado", label: "Energia injetada na rede no período (kWh)", type: "money" }, { k: "eqIni", label: "Data da leitura anterior da fatura (opcional — se vazio, usa a fatura anterior)", type: "date" },
      { type: "titulo", label: "Solplanet (inversor)" }, { k: "gerAcum", label: "Geração total acumulada que aparece no app (kWh)", type: "money" }, { k: "solData", label: "Dia em que você olhou (se vazio, a data do lançamento)", type: "date" },
      { type: "titulo", label: "Medidor privado" }, { k: "medAcum", label: "Número acumulado que aparece no medidor (kWh)", type: "money" }, { k: "medData", label: "Dia em que você olhou (se vazio, a data do lançamento)", type: "date" },
      { type: "titulo", label: "Alternativa: se você só tem o valor do período" }, { k: "gerado", label: "Solplanet — gerado só no período (kWh)", type: "money" }, { k: "solIni", label: "Solplanet — desde que dia (opcional)", type: "date" }, { k: "medidor", label: "Medidor — consumo só no período (kWh)", type: "money" }, { k: "medIni", label: "Medidor — desde que dia (opcional)", type: "date" },
      { type: "titulo", label: "Opcional" }, { k: "creditoFatura", label: "Saldo de créditos que veio na fatura (kWh)", type: "money" }, { k: "valor", label: "Valor da conta (R$)", type: "money" }],
    onSave: async v => { if (!/^\d{4}-\d{2}-\d{2}$/.test(v.data || "")) { toast("Informe a data do lançamento."); return false; }
      const outro = S.data.energia.find(e => dataLeit(e) === v.data && e.id !== o?.id); if (outro) { toast("Já existe um lançamento nessa data. Toque nele em Leituras lançadas para editar."); return false; }
      for (const [a, b, nome] of [[v.eqIni, v.data, "Equatorial"], [v.solIni, v.solData || v.data, "Solplanet"], [v.medIni, v.medData || v.data, "medidor"]]) if (a && a >= b) { toast(`Na parte ${nome}, a data inicial precisa ser antes da final.`); return false; }
      const d = { data: v.data, mes: ymOf(v.data), eqIni: v.eqIni || "", consumido: parseMoney(v.consumido), injetado: parseMoney(v.injetado), gerAcum: parseMoney(v.gerAcum), gerado: parseMoney(v.gerado), solData: v.solData || "", solIni: v.solIni || "", medAcum: parseMoney(v.medAcum), medidor: parseMoney(v.medidor), medData: v.medData || "", medIni: v.medIni || "", creditoFatura: String(v.creditoFatura ?? "").trim() === "" ? "" : parseMoney(v.creditoFatura), valor: parseMoney(v.valor) };
      if (!temEq(d) && !d.gerAcum && !d.gerado && !d.medAcum && !d.medidor) { toast("Preencha pelo menos um valor."); return false; }
      o ? await store.set("energia", o.id, d) : await store.add("energia", d); },
    onDelete: o ? () => store.del("energia", o.id) : null });
}

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
/* ---------- Projeção de saldo ---------- */
V.projecao = () => {
  const meses = Array.from({ length: 12 }, (_, i) => addMes(S.mes, i)), d = meses.map(ym => { const rs = S.data.contas.map(c => resumoConta(c, ym)); return { ym, rec: total(doMes("receita", ym)), des: total(doMes("despesa", ym)), saldo: r2(rs.reduce((a, r) => a + r.previsto, 0)) }; });
  const mx = Math.max(...d.map(x => Math.max(x.rec, x.des, x.saldo)), 1), mn = Math.min(...d.map(x => x.saldo), 0), W = 720, H = 240, base = H - 28, y = v => base - (v - mn) / (mx - mn || 1) * (base - 16), slot = (W - 20) / 12, bw = Math.min(16, slot / 2 - 4), lab = ym => `${MESES[Number(ym.slice(5)) - 1].slice(0, 3).toLowerCase()}/${ym.slice(2, 4)}`;
  const pts = d.map((x, i) => `${(10 + slot * i + slot / 2).toFixed(1)},${y(x.saldo).toFixed(1)}`).join(" ");
  return `<h2 style="margin-bottom:12px">Projeção de saldo <small class="mut" style="font-weight:400;font-size:13px">próximos 12 meses a partir de ${lab(S.mes)}</small></h2>
  <div class="card" style="margin-bottom:14px"><svg viewBox="0 0 ${W} ${H}" style="width:100%"><line x1="6" y1="${y(0)}" x2="${W - 6}" y2="${y(0)}" stroke="currentColor" opacity=".25"/>
    ${d.map((x, i) => { const cx = 10 + slot * i + slot / 2; return `<rect x="${cx - bw - 1}" y="${y(x.rec)}" width="${bw}" height="${Math.max(0, y(0) - y(x.rec))}" rx="3" fill="#2e9e5b" opacity=".55"><title>Receitas: ${brl(x.rec)}</title></rect><rect x="${cx + 1}" y="${y(x.des)}" width="${bw}" height="${Math.max(0, y(0) - y(x.des))}" rx="3" fill="#d9483b" opacity=".55"><title>Despesas: ${brl(x.des)}</title></rect><text x="${cx}" y="${H - 8}" font-size="10" text-anchor="middle" fill="currentColor" opacity=".6">${lab(x.ym)}</text>`; }).join("")}
    <polyline points="${pts}" fill="none" stroke="#3b7ddd" stroke-width="2.5"/>${d.map((x, i) => `<circle cx="${10 + slot * i + slot / 2}" cy="${y(x.saldo)}" r="3.5" fill="#3b7ddd"><title>${lab(x.ym)}: ${brl(x.saldo)}</title></circle>`).join("")}</svg>
    <div class="sum"><span><i class="lg" style="background:#2e9e5b"></i>Receitas</span><span><i class="lg" style="background:#d9483b"></i>Despesas</span><span><i class="lg" style="background:#3b7ddd"></i>Saldo previsto no fim do mês</span></div></div>
  <div class="card"><div style="overflow:auto"><table><thead><tr><th>Mês</th><th>Receitas</th><th>Despesas</th><th>Resultado do mês</th><th>Saldo previsto</th></tr></thead><tbody>${d.map(x => `<tr><td>${MESES[Number(x.ym.slice(5)) - 1]} ${x.ym.slice(0, 4)}</td><td class="pos">${brl(x.rec)}</td><td class="neg">${brl(x.des)}</td><td class="${cls(x.rec - x.des)}">${brl(x.rec - x.des)}</td><td class="b ${cls(x.saldo)}">${brl(x.saldo)}</td></tr>`).join("")}</tbody></table></div>
  <div class="sum">Considera o que já está lançado: despesas fixas e parceladas dos próximos meses, faturas de cartão em aberto e lançamentos pendentes. Contas mensais ainda sem valor (água, luz) não entram.</div></div>`;
};
/* ---------- Calendário ---------- */
// Lista separada por grupo (categoria), com subtotal de cada grupo
function porGrupoHtml(titulo, ls, cor, linhas = true) {
  if (!ls.length) return "";
  return `<div class="sec"><span>${titulo}</span><b class="${cor}">${brl(total(ls))}</b></div>${porCategoria(ls).map(g => { const it = ls.filter(l => (l.emprestimo ? "__emp" : l.categoriaId || "") === g.id).sort((a, b) => a.data.localeCompare(b.data));
    return `<div class="grp"><div class="gl" style="margin:8px 0 2px"><i class="lg" style="background:${esc(g.c.cor)}"></i><b>${esc(g.c.icone + " " + g.c.nome)}</b><span>${it.length} ${it.length === 1 ? "lançamento" : "lançamentos"} · ${g.p.toFixed(0)}%</span><b class="${cor}">${brl(g.v)}</b></div>${linhas ? it.map(linha).join("") : `<div class="prog" style="margin-bottom:6px"><i style="width:${g.p}%;background:${esc(g.c.cor)}"></i></div>`}</div>`; }).join("")}`;
}
V.calendario = () => {
  const ym = S.mes, n = ultimoDia(ym), ini = new Date(`${ym}-01T12:00`).getDay(), cel = [];
  for (let i = 0; i < ini; i++) cel.push('<div class="cd vz"></div>');
  for (let dia = 1; dia <= n; dia++) { const d = `${ym}-${pad(dia)}`, ls = S.data.lancamentos.filter(l => l.data === d), des = total(ls.filter(l => l.tipo === "despesa")), rec = total(ls.filter(l => l.tipo === "receita"));
    const venc = S.data.cartoes.some(c => dataNoMes(ym, c.vencimento || 10) === d && fatTotal(c.id, ym) > 0 && !c.pagas?.[ym]), fx = fixasMes(ym).some(x => x.k !== 3 && x.venc === d);
    cel.push(`<button class="cd ${d === hoje() ? "hj" : ""}" data-act="dia" data-d="${d}"><b>${dia}</b>${rec ? `<span class="pos">+${S.priv ? "••" : rec.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>` : ""}${des ? `<span class="neg">-${S.priv ? "••" : des.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>` : ""}<i>${venc ? "💳" : ""}${fx ? "🔔" : ""}</i></button>`); }
  return `<h2 style="margin-bottom:12px">Calendário</h2><div class="card"><div class="cal">${["dom", "seg", "ter", "qua", "qui", "sex", "sáb"].map(x => `<div class="cdh">${x}</div>`).join("")}${cel.join("")}</div>
  <div class="sum"><span class="pos">+ receitas do dia</span><span class="neg">− despesas do dia</span><span>💳 vencimento de fatura</span><span>🔔 conta mensal a pagar</span></div><div class="sum">Toque em um dia para ver as entradas e as despesas separadas por grupo, ou adicionar um lançamento naquela data.</div></div>
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(290px,1fr));align-items:start;margin-top:14px">
    <div class="card"><h3>Entradas do mês por grupo</h3>${porGrupoHtml("Total de entradas", doMes("receita", ym), "pos", false) || '<div class="empty">Nenhuma entrada neste mês.</div>'}</div>
    <div class="card"><h3>Despesas do mês por grupo</h3>${porGrupoHtml("Total de despesas", doMes("despesa", ym), "neg", false) || '<div class="empty">Nenhuma despesa neste mês.</div>'}</div>
  </div>`;
};
/* ---------- Objetivos ---------- */
V.objetivos = () => {
  const os = [...S.data.objetivos].sort((a, b) => (a.prazo || "9999").localeCompare(b.prazo || "9999"));
  return `<div class="tools"><h2 style="flex:1">Objetivos</h2><button class="btn" data-act="editObj">Novo objetivo</button></div>
  ${os.length ? `<div class="grid cc">${os.map(o => { const g = o.guardado || 0, p = o.alvo ? g / o.alvo * 100 : 0, falta = r2(Math.max(0, (o.alvo || 0) - g)), meses = o.prazo && o.prazo > hoje() ? Math.max(1, Math.ceil(diasEntre(hoje(), o.prazo) / 30.4)) : 0;
    return `<div class="card"><div class="hd">${av("🎯", o.cor)}<div class="tx"><b>${esc(o.nome)}</b><small>${o.prazo ? "até " + dataBR(o.prazo) : "sem prazo"}</small></div><button data-act="editObj" data-id="${o.id}" title="Editar">${ico("mais")}</button></div>
      <div class="fat"><span>Guardado</span><b class="pos">${brl(g)}</b></div><div class="prog" style="margin-top:10px"><i style="width:${Math.min(100, p)}%;background:${esc(o.cor)}"></i></div>
      <div class="tri" style="margin-top:12px"><div><small>Meta</small>${brl(o.alvo || 0)}</div><div><small>Falta</small>${brl(falta)}</div><div><small>Concluído</small>${p.toFixed(0)}%</div></div>
      ${falta > 0 && meses ? `<div class="emp mut">Guardando ${brl(falta / meses)} por mês você chega lá no prazo (${meses} ${meses === 1 ? "mês" : "meses"}).</div>` : falta <= 0 ? '<div class="emp pos">Objetivo alcançado 🎉</div>' : ""}
      <div class="dash-l"></div><div class="ft" style="margin-top:0"><span class="tag" style="background:${falta <= 0 ? "#2e9e5b" : "#3b7ddd"}">${falta <= 0 ? "Concluído" : "Em andamento"}</span><span><button class="link" data-act="objMov" data-id="${o.id}" data-s="-1">Retirar</button> &nbsp; <button class="link" data-act="objMov" data-id="${o.id}" data-s="1">Guardar</button></span></div></div>`; }).join("")}</div>
    <div class="sum">Total guardado: <b class="pos">${brl(total(os.map(o => ({ valor: o.guardado || 0 }))))}</b> de ${brl(total(os.map(o => ({ valor: o.alvo || 0 }))))}</div>` : '<div class="card empty">Nenhum objetivo ainda. Crie um para acompanhar quanto falta (viagem, reserva de emergência, carro…).</div>'}`;
};
V.config = () => `<h2 style="margin-bottom:12px">Ajustes</h2><div class="card" style="max-width:520px">
  <div class="row" data-act="dark"><div class="tx">Tema escuro</div><span class="ck ${document.documentElement.classList.contains("dark") ? "on" : ""}">✓</span></div>
  <div class="row" data-act="csv"><div class="tx"><div>Exportar lançamentos (CSV)</div><small>Abre no Excel ou Google Planilhas</small></div></div>
  <div class="row" data-act="sair"><div class="tx"><div class="neg">Sair</div><small>${esc(S.demo ? "Modo demonstração — nada é salvo" : S.user?.email || "")}</small></div></div></div>`;

/* ---------- desenho ---------- */
function draw() {
  const root = $("#root");
  if (!S.user && !S.demo) return;
  if (!$("#app")) {
    root.innerHTML = `<div id="app"><header class="top"><button class="hb" data-act="menu" aria-label="Abrir menu">${ico("menu")}</button><div class="logo">${LOGO}<span>meu<b>financeiro</b></span></div><span class="sp"></span>
      <button class="hb" id="bpriv" data-act="priv" aria-label="Modo privado: esconder valores" title="Modo privado">${ico("olho")}</button>
      <div class="mes"><button data-act="mes" data-v="-1" aria-label="Mês anterior">‹</button><span class="lbl" id="mlbl"></span><button data-act="mes" data-v="1" aria-label="Próximo mês">›</button></div>
      <button class="fab" data-act="novo" aria-label="Novo lançamento">+</button></header>
      <nav class="side" id="side"></nav><main id="main"></main><nav class="bot" id="bot"></nav></div><div id="drawer"></div><div id="modal"></div>`;
  }
  $("#mlbl").textContent = S.view === "inicio" && S.per !== "mes" ? periodo().label.replace("Ano de ", "") : `${MESES[Number(S.mes.slice(5)) - 1]} ${S.mes.slice(0, 4)}`;
  const pendHoje = fixasVencidas(ymOf(hoje())).length > 0;
  $("#side").innerHTML = NAV.map(([k, n], i) => `${k === "config" || k === "energia" ? "<hr>" : ""}<button class="${S.view === k ? "on" : ""}" data-act="nav" data-v="${k}" title="${n}">${ico(k)}${k === "inicio" && pendHoje ? '<i class="ndot"></i>' : ""}</button>`).join("");
  const b = (k, n) => `<button class="${S.view === k ? "on" : ""}" data-act="nav" data-v="${k}">${ico(k === "config" ? "mais" : k)}${k === "inicio" && pendHoje ? '<i class="ndot"></i>' : ""}<span>${n}</span></button>`;
  $("#bot").innerHTML = b("inicio", "Início") + b("lancamentos", "Lançam.") + '<button class="fab" data-act="novo" aria-label="Novo lançamento">+</button>' + b("cartoes", "Cartões") + `<button data-act="menu">${ico("menu")}<span>Menu</span></button>`;
  $("#bpriv").classList.toggle("on", S.priv);
  const nome = k => NAV.find(([x]) => x === k)[1];
  $("#drawer").innerHTML = S.menu ? `<div class="dw-ov" data-act="menuFechar"><nav class="dw"><div class="dw-top"><div class="logo">${LOGO}<span>meu<b>financeiro</b></span></div><small>${esc(S.demo ? "Modo demonstração" : S.user?.email || "")}</small></div>
    ${MENU.map(([t, ks]) => `${t ? `<div class="dw-t">${t}</div>` : '<div class="dw-sep"></div>'}${ks.map(k => `<button class="${S.view === k ? "on" : ""}" data-act="nav" data-v="${k}">${ico(k)}<span>${nome(k)}</span>${k === "inicio" && pendHoje ? '<i class="ndot" style="position:static;margin-left:auto"></i>' : ""}</button>`).join("")}`).join("")}
    <div class="dw-sep"></div><button data-act="priv">${ico("olho")}<span>Modo privado</span><span class="ck ${S.priv ? "on" : ""}" style="margin-left:auto;width:22px;height:22px;font-size:11px">✓</span></button>
    <button data-act="dark">${ico("config")}<span>Tema escuro</span><span class="ck ${document.documentElement.classList.contains("dark") ? "on" : ""}" style="margin-left:auto;width:22px;height:22px;font-size:11px">✓</span></button></nav></div>` : "";
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
    if (f.type === "titulo") return `<div class="ftit">${f.label}</div>`;
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

function formLanc(orig, cartaoId, pessoaId, dataPre) {
  if (!S.data.contas.length) return toast("Cadastre uma conta primeiro.");
  const ed = !!orig, o = orig || {};
  const values = ed ? { tipo: o.tipo, descricao: o.descricao, valor: moneyIn(o.valor), data: o.data, categoriaId: o.categoriaId, origem: o.cartaoId ? "k:" + o.cartaoId : "c:" + o.contaId, pessoaId: o.pessoaId || "", subgrupo: o.subgrupo || "", destino: o.contaDestinoId, efetivada: o.efetivada, repetir: "variavel", parcelas: 2 }
    : { tipo: "despesa", descricao: "", valor: "", data: dataPre || (ymOf(hoje()) === S.mes ? hoje() : `${S.mes}-01`), origem: cartaoId ? "k:" + cartaoId : "c:" + contasOrd()[0].id, pessoaId: pessoaId || "", subgrupo: "", efetivada: true, repetir: "variavel", parcelas: 2 };
  openForm({
    title: ed ? "Editar lançamento" : "Novo lançamento", values,
    fields: [
      { k: "tipo", type: "seg", options: [["despesa", "Despesa"], ["receita", "Receita"], ["transferencia", "Transferência"]], when: () => !ed },
      { k: "descricao", label: "Descrição" }, { k: "valor", label: "Valor (R$)", type: "money" }, { k: "data", label: "Data", type: "date" },
      { k: "categoriaId", label: "Categoria (grupo)", type: "select", redraw: true, options: v => optCats(v.tipo), when: v => v.tipo !== "transferencia" && !o.reembolso },
      { k: "subgrupo", label: "Subgrupo (opcional — ex.: Gasolina, Farmácia)", list: v => [...new Set(S.data.lancamentos.filter(l => l.subgrupo && l.categoriaId === v.categoriaId).map(l => l.subgrupo))].sort((a, b) => a.localeCompare(b)), when: v => v.tipo !== "transferencia" && !o.reembolso },
      { k: "origem", label: "Pagar com", type: "select", redraw: true, options: () => [...optContas().map(([k, n]) => ["c:" + k, n]), ...S.data.cartoes.map(c => ["k:" + c.id, "💳 " + c.nome])], when: v => v.tipo === "despesa" },
      { k: "pessoaId", label: "Gasto de quem (pessoa ou empresa)", type: "select", options: () => [["", "Eu"], ...[...S.data.pessoas].sort((a, b) => (grupoDe(a) === "empresas") - (grupoDe(b) === "empresas") || a.nome.localeCompare(b.nome)).map(p => [p.id, (grupoDe(p) === "empresas" ? "🏢 " : "") + p.nome])], when: v => v.tipo === "despesa" && S.data.pessoas.length > 0 },
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
  () => ({ nome: "", grupo: grupoNovo, cor: grupoNovo === "empresas" ? "#5b6ee0" : "#e0564a" }), { in: o => ({ ...o, grupo: grupoDe(o) }), out: v => v.nome.trim() ? { nome: v.nome.trim(), grupo: v.grupo || "familia", cor: v.cor } : (toast("Informe o nome."), null) },
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
const formObj = crud("objetivos", "oobjetivo", [{ k: "nome", label: "Nome do objetivo" }, { k: "alvo", label: "Valor da meta (R$)", type: "money" }, { k: "guardado", label: "Quanto já tem guardado (R$)", type: "money" }, { k: "prazo", label: "Prazo (opcional)", type: "date" }, { k: "cor", label: "Cor", type: "color" }],
  () => ({ nome: "", alvo: "", guardado: "", prazo: "", cor: "#2f8f83" }), { in: o => ({ ...o, alvo: moneyIn(o.alvo), guardado: moneyIn(o.guardado) }), out: v => { const alvo = parseMoney(v.alvo); return v.nome.trim() && alvo > 0 ? { nome: v.nome.trim(), alvo, guardado: parseMoney(v.guardado), prazo: v.prazo || "", cor: v.cor } : (toast("Informe o nome e o valor da meta."), null); } });
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
  menu: () => { S.menu = !S.menu; render(); }, menuFechar: (d, e) => { if (e.target.classList.contains("dw-ov")) { S.menu = false; render(); } },
  priv: () => { S.priv = !S.priv; try { localStorage.setItem("mf-priv", S.priv ? "1" : "0"); } catch (e) {} render(); },
  nav: d => { S.menu = false; S.proj = null; S.cartao = null; S.view = d.v; $("#main") && ($("#main").scrollTop = 0); render(); },
  mes: d => { const n = Number(d.v), p = S.view === "inicio" ? S.per : "mes";
    if (p === "dia" || p === "semana") { S.ref = addDias(S.ref, n * (p === "dia" ? 1 : 7)); S.mes = ymOf(S.ref); }
    else { S.mes = addMes(S.mes, n * (p === "ano" ? 12 : 1)); S.ref = S.mes === ymOf(hoje()) ? hoje() : `${S.mes}-01`; }
    render(); },
  per: d => { S.per = d.v; if (ymOf(S.ref) !== S.mes) S.ref = S.mes === ymOf(hoje()) ? hoje() : `${S.mes}-01`; try { localStorage.setItem("mf-per", S.per); } catch (e) {} render(); },
  filtro: d => { S.filtro = d.v; render(); },
  aba: d => { S.aba = d.v; render(); },
  novo: d => S.view === "objetivos" ? formObj() : S.view === "energia" ? formEnergia() : S.view === "dilcar" && !d.cartao && !d.pessoa ? (S.proj && by("projetos", S.proj) ? formMov("gasto") : formProjeto()) : formLanc(null, d.cartao || (S.view === "cartoes" && S.cartao && by("cartoes", S.cartao) ? S.cartao : undefined), d.pessoa),
  det: d => detalhe(d), irCartao: d => { S.menu = false; S.view = "cartoes"; S.cartao = d.id; $("#main").scrollTop = 0; render(); },
  irMes: d => { S.mes = d.v; S.per = "mes"; S.ref = S.mes === ymOf(hoje()) ? hoje() : `${S.mes}-01`; render(); },
  editObj: d => formObj(d.id),
  objMov: d => { const o = by("objetivos", d.id), s = Number(d.s); openForm({ title: `${s > 0 ? "Guardar em" : "Retirar de"} ${esc(o.nome)}`, values: { v: "" }, fields: [{ k: "v", label: "Valor (R$)", type: "money" }],
    onSave: async v => { const x = parseMoney(v.v); if (x <= 0) { toast("Informe o valor."); return false; } await store.set("objetivos", o.id, { ...o, guardado: r2(Math.max(0, (o.guardado || 0) + s * x)) }); } }); },
  dia: d => { const ls = S.data.lancamentos.filter(l => l.data === d.d), rec = ls.filter(l => l.tipo === "receita"), des = ls.filter(l => l.tipo === "despesa"), tr = ls.filter(l => l.tipo === "transferencia");
    $("#modal").innerHTML = `<div class="ov" data-act="fechar"><div class="modal" style="max-width:520px"><h2>${dataBR(d.d)} <small class="mut" style="font-weight:400;font-size:13px">${DIAS[new Date(d.d + "T12:00").getDay()]}</small></h2>
    ${ls.length ? `<div class="tri" style="font-size:14px;margin-bottom:6px"><div><small>Entradas</small><b class="pos">${brl(total(rec))}</b></div><div><small>Despesas</small><b class="neg">${brl(total(des))}</b></div><div><small>Resultado do dia</small><b class="${cls(total(rec) - total(des))}">${brl(total(rec) - total(des))}</b></div></div>` : ""}
    ${porGrupoHtml("Entradas", rec, "pos")}${porGrupoHtml("Despesas", des, "neg")}${tr.length ? `<div class="sec">Transferências</div>${tr.map(linha).join("")}` : ""}${ls.length ? "" : '<div class="empty">Nenhum lançamento neste dia.</div>'}
    <div class="acts"><button class="btn" data-act="novoDia" data-d="${d.d}">+ Lançamento neste dia</button><span class="sp"></span><button class="btn ghost" data-act="fechar" data-force="1">Fechar</button></div></div></div>`; },
  novoDia: d => formLanc(null, undefined, undefined, d.d),
  editEnergia: d => formEnergia(d.id),
  energiaIni: () => openForm({ title: "Créditos iniciais na Equatorial", values: { v: moneyIn(Number(by("config", "energia")?.creditoInicial) || 0) }, fields: [{ k: "v", label: "Saldo de créditos antes do primeiro mês lançado (kWh)", type: "money" }],
    onSave: v => store.set("config", "energia", { ...(by("config", "energia") || {}), creditoInicial: parseMoney(v.v) }) }),
  editL: d => { const l = by("lancamentos", d.id); l?.emprestimo ? formEmprestimo(l.pessoaId, l.id) : formLanc(l); },
  emprestar: d => formEmprestimo(d.id),
  toggleL: d => { const l = by("lancamentos", d.id); store.set("lancamentos", l.id, { ...l, efetivada: !l.efetivada }); },
  editConta: d => formConta(d.id), editCartao: d => S.data.contas.length ? formCartao(d.id) : toast("Cadastre uma conta primeiro."), editCat: d => formCat(d.id), editPessoa: d => { grupoNovo = d.grupo || "familia"; formPessoa(d.id); }, editFixa: d => S.data.contas.length ? formFixa(d.id) : toast("Cadastre uma conta primeiro."), lancarFixa: d => formLancarFixa(d.id), editOrc: d => formOrc(d.id),
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
    const novos = sel.map(x => { const p = x.parcela ? [0, ...x.parcela] : null, parc = !!p, naFatura = IMP.modo === "fatura";
      // No modo "tudo nesta fatura", a parcela 9/10 de uma compra de fevereiro é lançada na data da 9ª parcela, não na data da compra
      let data = naFatura && parc && p[1] > 1 ? addMesData(x.data, p[1] - 1) : x.data;
      if (naFatura && data > `${S.mes}-31`) data = x.data;
      return { tipo: "despesa", descricao: x.nome.trim() || x.descOrig || "Compra no cartão", valor: x.valor, data, ...(data !== x.data ? { dataCompra: x.data } : {}), categoriaId: x.categoriaId || "", subgrupo: (x.subgrupo || "").trim(), contaId: "", cartaoId: IMP.cartaoId, contaDestinoId: "", pessoaId: x.pessoaId || "", efetivada: true,
        recorrencia: parc ? "parcelada" : "variavel", ...(parc ? { parcela: Number(p[1]), parcelas: Number(p[2]) } : {}), importId: x.importId, descOrig: x.descOrig, ...(naFatura ? { faturaRef: S.mes } : {}) }; });
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
  const temCab = ic >= 0, cab = temCab ? rows[ic].map(c => txt(c).toLowerCase()) : [], acha = (re, nao) => cab.findIndex(c => re.test(c) && !(nao && nao.test(c)));
  const corpo = (temCab ? rows.slice(ic + 1) : rows).filter(r => r.some(c => impData(c))), am = corpo[0] || [];
  const reFora = /us\$|usd|d[oó]lar|cota[çc]/, rePort = /nome no cart|portador|titular|final do cart|cart[aã]o$/;
  let iD = acha(reD), iN = acha(/descri/, rePort), iV = acha(/valor.*(r\$|reais|brl)/, reFora);
  if (iN < 0) iN = acha(reN, rePort); if (iV < 0) iV = acha(reV, reFora);
  const iP = acha(/^parcela/), iT = acha(/nome no cart|portador|titular/), iF = acha(/final do cart/);
  if (iD < 0) iD = am.findIndex(c => impData(c));
  const pareceValor = c => typeof c === "number" || (isFinite(impValor(c)) && /[.,]\d{2}$|^-?\d+$/.test(txt(c).replace(/[R$\s]/g, "")));
  if (iV < 0) { for (let k = am.length - 1; k >= 0; k--) if (k !== iD && pareceValor(am[k])) { iV = k; break; } }
  if (iN < 0) iN = am.map((c, k) => [k, k === iD || k === iV ? -1 : txt(c).length]).sort((a, b) => b[1] - a[1])[0]?.[0] ?? -1;
  if (iD < 0 || iV < 0) return [];
  return corpo.map(r => ({ data: impData(r[iD]), valor: impValor(r[iV]), nome: txt(r[iN]), fit: "", parc: iP >= 0 ? txt(r[iP]) : "", obs: [iT >= 0 ? txt(r[iT]) : "", iF >= 0 && txt(r[iF]) ? "final " + txt(r[iF]) : ""].filter(Boolean).join(" · ") })).filter(x => x.data && isFinite(x.valor) && x.valor !== 0);
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
  bruto.forEach(x => { x.nome = String(x.nome || "").replace(/\s+/g, " ").trim(); });
  IMP = { cartaoId, arquivo: file.name, modo: "fatura", itens: bruto.map(x => {
    const pm = /(\d{1,2})\s*(?:\/|de)\s*(\d{1,2})/.exec(x.parc || "") || /(\d{1,2})\s*(?:\/|de)\s*(\d{1,2})/.exec(x.nome), parcela = pm && Number(pm[1]) <= Number(pm[2]) && Number(pm[2]) > 1 ? [Number(pm[1]), Number(pm[2])] : null;
    const credito = compraNeg ? x.valor > 0 : x.valor < 0, valor = Math.abs(x.valor), importId = x.fit || `${x.data}|${valor}|${norm(x.nome)}${parcela ? "|" + parcela.join("/") : ""}`, h = hist.get(norm(x.nome));
    const dup = doCartao.some(l => l.importId === importId || ((l.dataCompra || l.data) === x.data && l.valor === valor && norm(l.descOrig || l.descricao) === norm(x.nome)));
    const talvez = !dup && !credito && doCartao.some(l => (l.dataCompra || l.data) === x.data && l.valor === valor);
    return { on: !credito && !dup && !talvez, credito, dup, talvez, parcela, obs: x.obs || "", data: x.data, valor, descOrig: x.nome, nome: h?.descricao || x.nome, categoriaId: h?.categoriaId || "", subgrupo: h?.subgrupo || "", pessoaId: h?.pessoaId || "", importId };
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
      ${x.dup ? '<span class="tag" style="background:#f29a38">Já importada</span>' : x.talvez ? '<span class="tag" style="background:#f29a38" title="Já existe neste cartão uma compra com a mesma data e o mesmo valor">Possível repetida</span>' : x.credito ? '<span class="tag" style="background:#2e9e5b">Pagamento / estorno</span>' : "<span></span>"}
      <input class="impn" type="text" data-imp="nome" value="${esc(x.nome)}" title="Nome original: ${esc(x.descOrig)}" autocomplete="off">
      ${x.parcela || x.obs ? `<small class="impo">${[x.parcela ? `Parcela ${x.parcela[0]}/${x.parcela[1]}` : "", esc(x.obs)].filter(Boolean).join(" · ")}</small>` : ""}
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
