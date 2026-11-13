// Dilcar Eventos — página de lançamento rápido pelo celular (mesmos dados do painel completo)
const firebaseConfig = {
  apiKey: "AIzaSyBmFTUgIvcMGA9A4B5Py6Rw3SIO7F9E2w0",
  authDomain: "financas-gabriel-carvalho.firebaseapp.com",
  projectId: "financas-gabriel-carvalho",
  storageBucket: "financas-gabriel-carvalho.firebasestorage.app",
  messagingSenderId: "986463923028",
  appId: "1:986463923028:web:741ca828cfba9bba4bf6c1"
};
const FB = "https://www.gstatic.com/firebasejs/10.14.1/";
const GRUPOS_EV = ["Buffet", "Bebidas", "Decoração", "Equipe", "Som e luz", "Locação", "Transporte", "Outros"];
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const r2 = n => Math.round(n * 100) / 100;
const brl = v => (v < -0.005 ? "-" : "") + "R$ " + Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const parseMoney = s => { s = String(s ?? "").trim().replace(/[R$\s]/g, ""); if (s.includes(",")) s = s.replace(/\./g, "").replace(",", "."); const n = parseFloat(s); return isFinite(n) ? r2(n) : 0; };
const pad = n => String(n).padStart(2, "0");
const hoje = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const dataBR = d => d.split("-").reverse().join("/");
const toast = m => { const t = document.createElement("div"); t.className = "toast"; t.style.bottom = "24px"; t.textContent = m; document.body.append(t); setTimeout(() => t.remove(), 2400); };
try { if (localStorage.getItem("mf-dark") === "1") document.documentElement.classList.add("dark"); } catch (e) {}

const S = { projetos: [], movs: [], proj: "", tipo: "gasto", pronto: false, f: { valor: "", descricao: "", data: hoje(), grupo: "", subgrupo: "" } };
try { S.proj = localStorage.getItem("dilcar-proj") || ""; } catch (e) {}
let fb = null, api = null, conf = "";

// Atualiza só o resumo e a lista, sem mexer no formulário que está sendo preenchido
function atualizar() {
  const antes = $("#proj") && [...$("#proj").options].map(o => o.value + o.text).join("|"), fm = $("#fm");
  if (!fm) return tela();
  const real = $("#root"); const fake = document.createElement("div"); fake.id = "root";
  real.id = "root-real"; document.body.append(fake); tela();
  const novoSel = $("#proj", fake) && [...$("#proj", fake).options].map(o => o.value + o.text).join("|"), baixo = $("#baixo", fake)?.innerHTML, dls = $("#dl-s", fake)?.innerHTML, dlg = $("#dl-g", fake)?.innerHTML;
  fake.remove(); real.id = "root";
  if (novoSel !== antes || baixo == null) return tela();
  $("#baixo").innerHTML = baixo; if ($("#dl-s") && dls != null) $("#dl-s").innerHTML = dls; if ($("#dl-g") && dlg != null) $("#dl-g").innerHTML = dlg;
}
function tela() {
  const ps = [...S.projetos].sort((a, b) => (a.status === "concluido") - (b.status === "concluido") || a.nome.localeCompare(b.nome));
  if (!ps.some(p => p.id === S.proj)) S.proj = ps[0]?.id || "";
  const p = ps.find(x => x.id === S.proj), ms = S.movs.filter(x => x.projetoId === S.proj);
  const soma = t => r2(ms.filter(x => x.tipo === t).reduce((s, x) => s + x.valor, 0)), rec = soma("recebimento"), gas = soma("gasto");
  const uniq = a => [...new Set(a.filter(Boolean))].sort((x, y) => x.localeCompare(y));
  const grupos = uniq([...GRUPOS_EV, ...S.movs.map(x => x.grupo)]), subs = uniq(S.movs.filter(x => !S.f.grupo || x.grupo === S.f.grupo.trim()).map(x => x.subgrupo));
  const ult = [...ms].sort((a, b) => (b.criado || b.data).localeCompare(a.criado || a.data)).slice(0, 12), g = S.tipo === "gasto";
  $("#root").innerHTML = `<div class="q"><header><h1>Dilcar Eventos</h1><a class="pill" href="./">Painel completo</a></header>
  ${!S.pronto ? '<div class="card empty">Carregando…</div>' : !ps.length ? '<div class="card empty">Nenhum projeto cadastrado. Crie o projeto no painel completo (menu Dilcar Eventos) e volte aqui para lançar.</div>' : `
  <form class="card" id="fm">
    <div class="f"><label for="proj">Projeto</label><select id="proj">${ps.map(x => `<option value="${x.id}" ${x.id === S.proj ? "selected" : ""}>${esc(x.nome)}${x.status === "concluido" ? " (concluído)" : ""}</option>`).join("")}</select></div>
    <div class="f"><div class="seg"><button type="button" data-tipo="gasto" class="g ${g ? "on" : ""}">－ Despesa</button><button type="button" data-tipo="recebimento" class="r ${g ? "" : "on"}">＋ Pagamento</button></div></div>
    <div class="f"><label for="valor">Valor (R$)</label><input id="valor" data-k="valor" type="text" inputmode="decimal" placeholder="0,00" value="${esc(S.f.valor)}" autocomplete="off"></div>
    <div class="f"><label for="descricao">Descrição</label><input id="descricao" data-k="descricao" type="text" value="${esc(S.f.descricao)}" placeholder="${g ? "Ex.: Carnes, flores, garçons" : "Ex.: Sinal, 2ª parcela"}" autocomplete="off"></div>
    ${g ? `<div class="f"><label for="grupo">Grupo</label><input id="grupo" data-k="grupo" type="text" list="dl-g" value="${esc(S.f.grupo)}" placeholder="Ex.: Buffet, Decoração" autocomplete="off"><datalist id="dl-g">${grupos.map(x => `<option value="${esc(x)}">`).join("")}</datalist></div>
    <div class="f"><label for="subgrupo">Subgrupo</label><input id="subgrupo" data-k="subgrupo" type="text" list="dl-s" value="${esc(S.f.subgrupo)}" placeholder="Ex.: Carnes, Flores" autocomplete="off"><datalist id="dl-s">${subs.map(x => `<option value="${esc(x)}">`).join("")}</datalist></div>` : ""}
    <div class="f"><label for="data">Data</label><input id="data" data-k="data" type="date" value="${esc(S.f.data)}"></div>
    <button class="btn salvar" style="background:${g ? "var(--bad)" : "var(--ok)"}">Salvar ${g ? "despesa" : "pagamento"}</button>
  </form>
  <div id="baixo"><div class="card"><h3>${esc(p.nome)}</h3><div class="tri"><div><small>Recebido</small><b class="pos">${brl(rec)}</b></div><div><small>Gastos</small><b class="neg">${brl(gas)}</b></div><div><small>Resultado</small><b class="${rec - gas < 0 ? "neg" : "pos"}">${brl(rec - gas)}</b></div></div>
    ${p.valor ? `<div class="prog"><i style="width:${Math.min(100, rec / p.valor * 100)}%;background:var(--ok)"></i></div><div class="sum" style="margin-top:8px">Contrato ${brl(p.valor)} · falta receber ${brl(Math.max(0, p.valor - rec))}</div>` : ""}</div>
  <div class="card"><h3>Últimos lançamentos</h3>${ult.map(x => `<div class="row" style="cursor:default"><div class="tx"><div>${esc(x.descricao)}</div><small>${dataBR(x.data)}${x.tipo === "gasto" ? " · " + esc([x.grupo || "Sem grupo", x.subgrupo].filter(Boolean).join(" › ")) : " · pagamento recebido"}</small></div><b class="${x.tipo === "gasto" ? "neg" : "pos"}">${brl(x.valor)}</b><button type="button" class="x ${conf === x.id ? "c" : ""}" data-del="${x.id}">${conf === x.id ? "Confirmar" : "Excluir"}</button></div>`).join("") || '<div class="empty">Nada lançado neste projeto ainda.</div>'}</div></div>`}
  ${api?.sair ? '<div class="sum"><button class="link mut" id="sair">Sair</button></div>' : ""}</div>`;
}
document.addEventListener("input", e => { const k = e.target.dataset?.k; if (k) S.f[k] = e.target.value; });
document.addEventListener("change", e => {
  if (e.target.id === "proj") { S.proj = e.target.value; try { localStorage.setItem("dilcar-proj", S.proj); } catch (err) {} tela(); }
  if (e.target.id === "grupo") atualizar();
});
document.addEventListener("click", async e => {
  const t = e.target.closest("[data-tipo],[data-del],#sair"); if (!t) return;
  if (t.id === "sair") return api.sair();
  if (t.dataset.tipo) { S.tipo = t.dataset.tipo; return tela(); }
  if (conf !== t.dataset.del) { conf = t.dataset.del; return atualizar(); }
  conf = ""; try { await api.del(t.dataset.del); toast("Excluído."); } catch (err) { toast("Não foi possível excluir: " + (err.code || err.message)); }
});
document.addEventListener("submit", async e => {
  if (e.target.id !== "fm") return; e.preventDefault();
  const valor = parseMoney(S.f.valor), g = S.tipo === "gasto";
  if (valor <= 0) return toast("Informe o valor."); if (!S.f.data) return toast("Informe a data.");
  const d = { projetoId: S.proj, tipo: S.tipo, descricao: S.f.descricao.trim() || (g ? S.f.grupo.trim() || "Gasto" : "Pagamento"), valor, data: S.f.data, grupo: g ? S.f.grupo.trim() : "", subgrupo: g ? S.f.subgrupo.trim() : "", criado: new Date().toISOString() };
  const b = $(".salvar"); b.disabled = true;
  try { await api.add(d); S.f = { ...S.f, valor: "", descricao: "", subgrupo: "" }; toast(`${g ? "Despesa" : "Pagamento"} de ${brl(valor)} salvo.`); tela(); }
  catch (err) { b.disabled = false; toast("Não foi possível salvar: " + (err.code || err.message)); }
});

const ERROS = { "auth/invalid-credential": "E-mail ou senha incorretos.", "auth/invalid-email": "E-mail inválido.", "auth/too-many-requests": "Muitas tentativas. Tente mais tarde.", "auth/network-request-failed": "Sem conexão com a internet." };
function telaLogin(msg = "") {
  $("#root").innerHTML = `<div class="login"><form class="card" id="lg"><div class="logo"><span>Dilcar <b>Eventos</b></span></div>
    <div class="f"><label for="em">E-mail</label><input id="em" type="email" autocomplete="username" required></div>
    <div class="f"><label for="pw">Senha</label><input id="pw" type="password" autocomplete="current-password" required></div>
    <div class="err" id="err">${esc(msg)}</div><button class="btn">Entrar</button></form></div>`;
  $("#lg").onsubmit = e => { e.preventDefault(); if (!fb) return; fb.A.signInWithEmailAndPassword(fb.auth, $("#em").value.trim(), $("#pw").value).catch(err => { $("#err").textContent = ERROS[err.code] || "Não foi possível entrar (" + (err.code || err.message) + ")."; }); };
}
function demo() {
  const id = () => Math.random().toString(36).slice(2);
  S.projetos = [{ id: "p1", nome: "Casamento Ana e João", valor: 18000, status: "andamento" }, { id: "p2", nome: "Aniversário 15 anos", valor: 9000, status: "concluido" }];
  S.movs = [{ id: id(), projetoId: "p1", tipo: "recebimento", descricao: "Sinal", valor: 5400, data: hoje(), grupo: "", subgrupo: "" }, { id: id(), projetoId: "p1", tipo: "gasto", descricao: "Flores", valor: 1800, data: hoje(), grupo: "Decoração", subgrupo: "Flores" }];
  S.pronto = true; api = { add: async d => { S.movs.push({ ...d, id: id() }); }, del: async i => { S.movs = S.movs.filter(x => x.id !== i); atualizar(); } }; tela();
}
async function iniciar() {
  if (window.FORCE_DEMO || new URLSearchParams(location.search).has("demo")) return demo();
  try {
    const [app, A, F] = await Promise.all([import(FB + "firebase-app.js"), import(FB + "firebase-auth.js"), import(FB + "firebase-firestore.js")]);
    const a = app.initializeApp(firebaseConfig);
    let db; try { db = F.initializeFirestore(a, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) }); } catch (e) { db = F.getFirestore(a); }
    fb = { A, F, auth: A.getAuth(a), db };
  } catch (e) { return telaLogin("Sem conexão com o servidor."); }
  fb.A.onAuthStateChanged(fb.auth, u => {
    if (!u) { S.pronto = false; return telaLogin(); }
    const { F, db } = fb, col = n => F.collection(db, "users", u.uid, n), ok = new Set();
    const ouvir = (n, k) => F.onSnapshot(col(n), s => { S[k] = s.docs.map(d => ({ ...d.data(), id: d.id })); ok.add(n); if (ok.size === 2) S.pronto = true; atualizar(); },
      e => toast(e.code === "permission-denied" ? "Esta conta não tem acesso aos projetos." : "Erro ao ler dados: " + e.code));
    ouvir("projetos", "projetos"); ouvir("movProjeto", "movs");
    api = { add: d => F.addDoc(col("movProjeto"), d), del: i => F.deleteDoc(F.doc(col("movProjeto"), i)), sair: () => fb.A.signOut(fb.auth) };
    tela();
  });
}
iniciar();
if ("serviceWorker" in navigator && location.protocol === "https:" && !window.FORCE_DEMO) navigator.serviceWorker.register("sw.js").catch(() => {});
