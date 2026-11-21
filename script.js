const PALAVRAS = [
 {
  "a": "MICROCONTROLADOR",
  "r": 1,
  "c": 0,
  "d": "H",
  "clue": "Chip pequeno com processador, memória e portas, usado no Arduino."
 },
 {
  "a": "UC",
  "r": 0,
  "c": 2,
  "d": "V",
  "clue": "Parte da CPU que manda os outros componentes trabalharem."
 },
 {
  "a": "DMA",
  "r": 0,
  "c": 0,
  "d": "V",
  "clue": "Deixa um dispositivo ler e gravar na memória sem passar pela CPU."
 },
 {
  "a": "REGISTRADORES",
  "r": 1,
  "c": 9,
  "d": "V",
  "clue": "Pequenos espaços dentro da CPU que guardam dados na hora."
 },
 {
  "a": "ULA",
  "r": 0,
  "c": 11,
  "d": "V",
  "clue": "Parte da CPU que faz as contas e compara valores."
 },
 {
  "a": "ROM",
  "r": 7,
  "c": 9,
  "d": "H",
  "clue": "Memória que já vem gravada de fábrica e não se apaga."
 },
 {
  "a": "MEMORIADEMASSA",
  "r": 12,
  "c": 1,
  "d": "H",
  "clue": "Onde ficam guardados arquivos e programas, como no HD e no SSD."
 },
 {
  "a": "EEPROM",
  "r": 7,
  "c": 1,
  "d": "V",
  "clue": "Memória que mantém tudo sem energia e pode ser apagada com eletricidade."
 },
 {
  "a": "DUALCORE",
  "r": 10,
  "c": 4,
  "d": "H",
  "clue": "Processador com dois núcleos."
 },
 {
  "a": "FLASH",
  "r": 9,
  "c": 13,
  "d": "V",
  "clue": "Memória que guarda sem energia e é apagada por blocos, como no pen drive."
 },
 {
  "a": "ADDRESSBUS",
  "r": 5,
  "c": 0,
  "d": "H",
  "clue": "Caminho que leva da CPU o local da memória que será acessado."
 },
 {
  "a": "DATABUS",
  "r": 1,
  "c": 13,
  "d": "V",
  "clue": "Caminho de ida e volta das informações entre CPU, memória e dispositivos."
 },
 {
  "a": "CPU",
  "r": 1,
  "c": 5,
  "d": "V",
  "clue": "É o cérebro do computador: executa as instruções dos programas."
 },
 {
  "a": "QUADCORE",
  "r": 7,
  "c": 4,
  "d": "V",
  "clue": "Processador com quatro núcleos."
 },
 {
  "a": "RAM",
  "r": 4,
  "c": 0,
  "d": "V",
  "clue": "Memória onde ficam os programas abertos; apaga ao desligar."
 },
 {
  "a": "CACHE",
  "r": 4,
  "c": 12,
  "d": "H",
  "clue": "Memória rápida perto da CPU que guarda o que ela mais usa."
 }
];
const LINHAS = 15, COLUNAS = 17;

// ---- estado ----
const tabuleiro = document.getElementById("tabuleiro");
const celulas = {};          // "r,c" -> {input, letra, palavras:[idx]}
let direcao = "H", atual = null;

// numeração: início de palavra, em ordem de leitura
const inicios = {};
PALAVRAS.forEach(p => { inicios[p.r + "," + p.c] = 1; });
let n = 0;
for (let r = 0; r < LINHAS; r++) for (let c = 0; c < COLUNAS; c++) {
  if (inicios[r + "," + c]) inicios[r + "," + c] = ++n;
}
PALAVRAS.forEach((p, i) => { p.num = inicios[p.r + "," + p.c]; p.i = i; });

// ---- monta o tabuleiro ----
tabuleiro.style.gridTemplateColumns = `repeat(${COLUNAS}, var(--cel))`;
PALAVRAS.forEach(p => {
  for (let k = 0; k < p.a.length; k++) {
    const r = p.r + (p.d === "V" ? k : 0), c = p.c + (p.d === "H" ? k : 0), id = r + "," + c;
    if (!celulas[id]) celulas[id] = { r, c, letra: p.a[k], palavras: [] };
    celulas[id].palavras.push(p.i);
  }
});
for (let r = 0; r < LINHAS; r++) for (let c = 0; c < COLUNAS; c++) {
  const id = r + "," + c, box = document.createElement("div");
  if (!celulas[id]) { box.className = "vazia"; tabuleiro.appendChild(box); continue; }
  box.className = "celula";
  if (inicios[id]) { const s = document.createElement("span"); s.className = "num"; s.textContent = inicios[id]; box.appendChild(s); }
  const inp = document.createElement("input");
  inp.maxLength = 1; inp.autocomplete = "off"; inp.setAttribute("aria-label", `linha ${r + 1}, coluna ${c + 1}`);
  inp.addEventListener("focus", () => selecionar(id));
  inp.addEventListener("mousedown", () => { if (atual === id) direcao = direcao === "H" ? "V" : "H"; });
  inp.addEventListener("input", () => {
    inp.value = inp.value.toUpperCase().replace(/[^A-Z]/g, "");
    limpaMarcas();
    if (inp.value) mover(id, 1);
  });
  inp.addEventListener("keydown", e => teclas(e, id, inp));
  box.appendChild(inp); tabuleiro.appendChild(box);
  celulas[id].box = box; celulas[id].input = inp;
}

// ---- navegação ----
function vizinho(id, dr, dc) { const x = celulas[id]; return celulas[(x.r + dr) + "," + (x.c + dc)]; }
function mover(id, passo) {
  const dr = direcao === "V" ? passo : 0, dc = direcao === "H" ? passo : 0;
  const v = vizinho(id, dr, dc);
  if (v) v.input.focus();
}
function teclas(e, id, inp) {
  const setas = { ArrowRight: [0, 1, "H"], ArrowLeft: [0, -1, "H"], ArrowDown: [1, 0, "V"], ArrowUp: [-1, 0, "V"] };
  if (setas[e.key]) {
    e.preventDefault(); const [dr, dc, d] = setas[e.key]; direcao = d;
    const v = vizinho(id, dr, dc); if (v) v.input.focus(); else selecionar(id);
  } else if (e.key === "Backspace" && !inp.value) {
    e.preventDefault(); mover(id, -1);
  }
}
function selecionar(id) {
  atual = id;
  const ps = celulas[id].palavras.map(i => PALAVRAS[i]);
  if (!ps.some(p => p.d === direcao)) direcao = ps[0].d;
  Object.values(celulas).forEach(x => x.box.classList.remove("ativa", "foco"));
  const pa = ps.find(p => p.d === direcao);
  for (let k = 0; k < pa.a.length; k++) {
    celulas[(pa.r + (pa.d === "V" ? k : 0)) + "," + (pa.c + (pa.d === "H" ? k : 0))].box.classList.add("ativa");
  }
  celulas[id].box.classList.add("foco");
  document.querySelectorAll(".pistas li").forEach(li => li.classList.toggle("sel", +li.dataset.i === pa.i));
}

// ---- pistas ----
["H", "V"].forEach(d => {
  const ul = document.getElementById(d === "H" ? "horizontais" : "verticais");
  PALAVRAS.filter(p => p.d === d).sort((a, b) => a.num - b.num).forEach(p => {
    const li = document.createElement("li");
    li.dataset.i = p.i;
    li.innerHTML = `<b>${p.num}.</b> <span></span> <em>(${p.a.length} letras)</em><i class="marca" aria-hidden="true"></i>`;
    li.querySelector("span").textContent = p.clue;
    li.addEventListener("click", () => {
      direcao = p.d; celulas[p.r + "," + p.c].input.focus(); selecionar(p.r + "," + p.c);
    });
    ul.appendChild(li);
  });
});

// ---- conferir / reiniciar ----
const placar = document.getElementById("placar");
function palavraDigitada(p) {
  let s = "";
  for (let k = 0; k < p.a.length; k++)
    s += celulas[(p.r + (p.d === "V" ? k : 0)) + "," + (p.c + (p.d === "H" ? k : 0))].input.value || "";
  return s;
}
function limpaMarcas() {
  Object.values(celulas).forEach(x => x.box.classList.remove("certa", "errada"));
  document.querySelectorAll(".pistas li").forEach(li => li.classList.remove("ok", "erro"));
  placar.textContent = "";
}
function conferir() {
  limpaMarcas();
  let acertos = 0;
  const certas = new Set();
  PALAVRAS.forEach(p => {
    const ok = palavraDigitada(p) === p.a;
    if (ok) acertos++;
    document.querySelector(`.pistas li[data-i="${p.i}"]`).classList.add(ok ? "ok" : "erro");
    for (let k = 0; k < p.a.length; k++) {
      const id = (p.r + (p.d === "V" ? k : 0)) + "," + (p.c + (p.d === "H" ? k : 0));
      if (ok) certas.add(id);
    }
  });
  Object.entries(celulas).forEach(([id, x]) => {
    if (certas.has(id)) x.box.classList.add("certa");
    else if (x.input.value) x.box.classList.add("errada");
  });
  placar.textContent = `${acertos} de ${PALAVRAS.length} palavras`;
  if (acertos === PALAVRAS.length) placar.textContent += " 🎉 Parabéns, você completou a cruzadinha!";
}
function reiniciar() {
  Object.values(celulas).forEach(x => { x.input.value = ""; });
  limpaMarcas();
  placar.textContent = `0 de ${PALAVRAS.length} palavras`;
}
document.getElementById("conferir").addEventListener("click", conferir);
document.getElementById("reiniciar").addEventListener("click", reiniciar);
placar.textContent = `0 de ${PALAVRAS.length} palavras`;
