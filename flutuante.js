// Ferramentas flutuantes: bloco de notas e calculadora, disponíveis em qualquer aba. Cada janela pode ser arrastada e fixada.
const LS = { get: (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
const el = (h) => { const t = document.createElement("div"); t.innerHTML = h.trim(); return t.firstChild; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// avaliador de expressões sem eval: + − × ÷ ( ) % e vírgula decimal
function calcular(txt) {
  const s = txt.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/,/g, ".").replace(/\s+/g, ""); let i = 0;
  const num = () => { const m = /^\d*\.?\d+/.exec(s.slice(i)); if (!m) throw 0; i += m[0].length; return parseFloat(m[0]); };
  const fat = () => { let v; if (s[i] === "(") { i++; v = soma(); if (s[i] !== ")") throw 0; i++; } else if (s[i] === "-") { i++; v = -fat(); } else if (s[i] === "+") { i++; v = fat(); } else v = num(); while (s[i] === "%") { v /= 100; i++; } return v; };
  const mul = () => { let v = fat(); while (s[i] === "*" || s[i] === "/") { const o = s[i++], b = fat(); if (o === "/" && b === 0) throw 0; v = o === "*" ? v * b : v / b; } return v; };
  const soma = () => { let v = mul(); while (s[i] === "+" || s[i] === "-") { const o = s[i++], b = mul(); v = o === "+" ? v + b : v - b; } return v; };
  const r = soma(); if (i < s.length || !isFinite(r)) throw 0; return Math.round(r * 1e10) / 1e10;
}
const fmt = n => String(n).replace(".", ",");

// ---- notas sincronizadas (documento "config/notas" no Firestore; cópia local para uso sem internet) ----
let gravarNota = null, nota = (() => { const v = LS.get("mf-notas", ""); return typeof v === "string" ? { texto: v, ts: 0 } : { texto: v.texto || "", ts: v.ts || 0 }; })(), sujo = false, tmr = null, taNotas = null, ultimoEnvio = 0;
function enviar() { if (!gravarNota) return; clearTimeout(tmr); const env = { ...nota }; Promise.resolve(gravarNota({ texto: env.texto, ts: env.ts })).then(() => { if (nota.ts === env.ts) sujo = false; ultimoEnvio = env.ts; }).catch(() => {}); }
// chamado a cada atualização dos dados: traz a versão mais nova da nuvem ou envia a local
export function sincronizarNotas(doc, carregado) {
  if (!gravarNota || sujo || !carregado) return;
  if (!doc) { if (nota.texto.trim() && nota.ts !== ultimoEnvio) { if (!nota.ts) { nota.ts = Date.now(); LS.set("mf-notas", nota); } enviar(); } return; }
  if ((doc.ts || 0) > nota.ts) { nota = { texto: doc.texto || "", ts: doc.ts }; LS.set("mf-notas", nota); if (taNotas && taNotas.value !== nota.texto) { taNotas.value = nota.texto; taNotas.dispatchEvent(new Event("flut-atualizada")); } }
  else if ((doc.ts || 0) < nota.ts && nota.ts !== ultimoEnvio) enviar();
}

export function iniciarFlutuantes(opc = {}) {
  gravarNota = opc.gravar || null;
  if (document.getElementById("flut")) return;
  const raiz = el(`<div id="flut"><div class="flb"><button type="button" data-w="notas" title="Bloco de notas" aria-label="Bloco de notas">📝</button><button type="button" data-w="calc" title="Calculadora" aria-label="Calculadora">🧮</button></div></div>`);
  document.body.append(raiz);
  const estado = LS.get("mf-flut", {}), salvar = () => LS.set("mf-flut", estado), wins = {};
  const defs = {
    notas: { t: "📝 Bloco de notas", w: 300, h: 300, corpo: `<textarea class="fnota" placeholder="Anote aqui… (sincroniza com seus outros aparelhos)" spellcheck="true"></textarea><div class="fnb"><button type="button" data-n="copiar">Copiar</button><button type="button" data-n="limpar">Limpar</button><span class="fcont"></span></div>` },
    calc: { t: "🧮 Calculadora", w: 264, h: 0, corpo: `<div class="fhist"></div><input class="fdisp" inputmode="none" autocomplete="off" placeholder="0" aria-label="Expressão"><div class="fkeys">${["C", "(", ")", "÷", "7", "8", "9", "×", "4", "5", "6", "−", "1", "2", "3", "+", "0", ",", "⌫", "="].map(k => `<button type="button" class="${"÷×−+".includes(k) ? "op" : k === "=" ? "eq" : k === "C" || k === "⌫" ? "fn" : ""}" data-k="${k}">${k}</button>`).join("")}</div><div class="fnb"><button type="button" data-k="%">%</button><button type="button" data-n="copiarR">Copiar resultado</button></div>` }
  };
  function posicionar(w, id) { const p = estado[id] || {}, r = w.getBoundingClientRect(); let x = p.x, y = p.y; if (x == null) { x = innerWidth - r.width - 16; y = id === "calc" ? 70 : innerHeight - r.height - 100; if (id === "notas" && innerWidth >= 700) { x -= 276; y = 70; } } w.style.left = clamp(x, 4, Math.max(4, innerWidth - r.width - 4)) + "px"; w.style.top = clamp(y, 4, Math.max(4, innerHeight - r.height - 4)) + "px"; }
  function abrir(id) {
    if (wins[id]) { wins[id].remove(); delete wins[id]; estado[id] = { ...estado[id], aberta: false }; salvar(); marcar(); return; }
    const d = defs[id], fix = !!estado[id]?.fixa;
    const w = el(`<section class="fwin ${fix ? "fixa" : ""}" data-id="${id}" style="width:${d.w}px${d.h ? ";height:" + d.h + "px" : ""}"><header><span class="ft">${d.t}</span><button type="button" class="fpin ${fix ? "on" : ""}" data-n="fixar" title="${fix ? "Fixada neste local — toque para soltar" : "Fixar neste local"}">${fix ? "📌 Fixada" : "📍 Fixar"}</button><button type="button" data-n="fechar" aria-label="Fechar">✕</button></header><div class="fcorpo">${d.corpo}</div></section>`);
    raiz.append(w); wins[id] = w; estado[id] = { ...estado[id], aberta: true }; salvar(); posicionar(w, id); marcar(); ligar(w, id);
    if (id === "notas") { const ta = w.querySelector("textarea"); taNotas = ta; ta.value = nota.texto; const c = () => { w.querySelector(".fcont").textContent = ta.value.length + " caracteres" + (gravarNota ? (sujo ? " · salvando…" : " · sincronizado") : ""); }; c();
      ta.oninput = () => { nota = { texto: ta.value, ts: Date.now() }; sujo = true; LS.set("mf-notas", nota); c(); clearTimeout(tmr); tmr = setTimeout(enviar, 700); }; ta.addEventListener("flut-atualizada", c); setInterval(() => { if (!w.isConnected) return; c(); }, 1500); }
    else w.querySelector(".fdisp").focus({ preventScroll: true });
  }
  function marcar() { raiz.querySelectorAll(".flb button").forEach(b => b.classList.toggle("on", !!wins[b.dataset.w])); }
  function ligar(w, id) {
    const h = w.querySelector("header"); let dr = null;
    h.addEventListener("pointerdown", e => { if (e.target.closest("button") || estado[id]?.fixa) return; const r = w.getBoundingClientRect(); dr = { dx: e.clientX - r.left, dy: e.clientY - r.top }; h.setPointerCapture(e.pointerId); w.classList.add("arr"); });
    h.addEventListener("pointermove", e => { if (!dr) return; const r = w.getBoundingClientRect(); w.style.left = clamp(e.clientX - dr.dx, 0, innerWidth - r.width) + "px"; w.style.top = clamp(e.clientY - dr.dy, 0, innerHeight - r.height) + "px"; });
    const fim = () => { if (!dr) return; dr = null; w.classList.remove("arr"); estado[id] = { ...estado[id], x: parseFloat(w.style.left), y: parseFloat(w.style.top) }; salvar(); };
    h.addEventListener("pointerup", fim); h.addEventListener("pointercancel", fim);
    w.addEventListener("pointerdown", () => { raiz.querySelectorAll(".fwin").forEach(o => o.style.zIndex = 1); w.style.zIndex = 2; }, true);
    w.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; const n = b.dataset.n, k = b.dataset.k;
      if (n === "fechar") abrir(id);
      else if (n === "fixar") { const f = !estado[id]?.fixa, r = w.getBoundingClientRect(); estado[id] = { ...estado[id], fixa: f, x: r.left, y: r.top }; salvar(); w.classList.toggle("fixa", f); b.classList.toggle("on", f); b.textContent = f ? "📌 Fixada" : "📍 Fixar"; b.title = f ? "Fixada neste local — toque para soltar" : "Fixar neste local"; }
      else if (n === "limpar") { const ta = w.querySelector("textarea"); if (ta.value && confirm("Apagar todo o texto do bloco de notas?")) { ta.value = ""; ta.oninput(); } }
      else if (n === "copiar") navigator.clipboard?.writeText(w.querySelector("textarea").value);
      else if (n === "copiarR") navigator.clipboard?.writeText(w.dataset.res || w.querySelector(".fdisp").value);
      else if (k) tecla(w, k); });
    if (id === "calc") w.querySelector(".fdisp").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); tecla(w, "="); } else if (e.key === "Escape") tecla(w, "C"); });
  }
  function tecla(w, k) {
    const di = w.querySelector(".fdisp"), hi = w.querySelector(".fhist");
    if (k === "C") { di.value = ""; hi.textContent = ""; delete w.dataset.res; }
    else if (k === "⌫") di.value = di.value.slice(0, -1);
    else if (k === "=") { if (!di.value.trim()) return; try { const r = fmt(calcular(di.value)); hi.textContent = di.value + " ="; di.value = r; w.dataset.res = r; di.classList.remove("erro"); } catch (e) { di.classList.add("erro"); setTimeout(() => di.classList.remove("erro"), 600); } }
    else { if (w.dataset.res && di.value === w.dataset.res && /\d|,/.test(k)) { di.value = ""; hi.textContent = ""; } di.value += k; delete w.dataset.res; }
    di.focus({ preventScroll: true });
  }
  raiz.querySelector(".flb").addEventListener("click", e => { const b = e.target.closest("button[data-w]"); if (b) abrir(b.dataset.w); });
  addEventListener("resize", () => Object.entries(wins).forEach(([id, w]) => posicionar(w, id)));
  // reabre as janelas que estavam fixadas
  Object.entries(estado).forEach(([id, e]) => { if (e?.fixa && e.aberta && defs[id]) abrir(id); });
}
