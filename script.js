/* =====================================================
   INIT SEGURO (CRIA ADMIN)
===================================================== */
(function init() {
  let usuarios = JSON.parse(localStorage.getItem("usuarios"));
  if (!usuarios || !usuarios.admin) {
    usuarios = { admin: { senha: "admin123", perfil: "admin" } };
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
  }
})();

/* =====================================================
   LOGIN
===================================================== */
function entrar() {
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || {};
  const loginEl = document.getElementById("login");
  const senhaEl = document.getElementById("senha");

  if (!loginEl || !senhaEl) return;

  const u = loginEl.value.trim();
  const s = senhaEl.value.trim();

  if (!u || !s) return alert("Preencha login e senha");
  if (!usuarios[u]) return alert("Usuário não existe");
  if (usuarios[u].senha !== s) return alert("Senha incorreta");

  localStorage.setItem(
    "usuarioLogado",
    JSON.stringify({ login: u, perfil: usuarios[u].perfil })
  );

  location.href = usuarios[u].perfil === "admin"
    ? "admin.html"
    : "cracha.html";
}

/* =====================================================
   PROTEÇÃO DE PÁGINAS
===================================================== */
(function protegerPaginas() {
  const path = location.pathname;
  const ehLogin = path.endsWith("/") || path.endsWith("/index.html");
  if (ehLogin) return;

  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuarioLogado || !usuarioLogado.perfil) {
    localStorage.removeItem("usuarioLogado");
    location.href = "index.html";
    return;
  }

  if (path.endsWith("/admin.html") && usuarioLogado.perfil !== "admin") {
    location.href = "cracha.html";
  }
})();

/* =====================================================
   LOGOUT
===================================================== */
function logout() {
  localStorage.removeItem("usuarioLogado");
  location.href = "index.html";
}

/* =====================================================
   ADMIN
===================================================== */
function criarFuncionario() {
  const loginEl = document.getElementById("novoLogin");
  const senhaEl = document.getElementById("novaSenha");
  if (!loginEl || !senhaEl) return;

  const login = loginEl.value.trim();
  const senha = senhaEl.value.trim();
  if (!login || !senha) return alert("Preencha tudo");

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || {};
  if (usuarios[login]) return alert("Usuário já existe");

  usuarios[login] = { senha, perfil: "funcionario" };
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  loginEl.value = "";
  senhaEl.value = "";
  listarFuncionarios();
}

function listarFuncionarios() {
  const lista = document.getElementById("lista");
  if (!lista) return;

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || {};
  lista.innerHTML = "";

  Object.keys(usuarios).forEach(u => {
    if (usuarios[u].perfil === "funcionario") {
      lista.innerHTML += `
        <li>${u}
          <button onclick="excluirFuncionario('${u}')">❌</button>
        </li>`;
    }
  });
}

function excluirFuncionario(u) {
  if (!confirm("Excluir funcionário?")) return;
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || {};
  delete usuarios[u];
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  listarFuncionarios();
}

document.addEventListener("DOMContentLoaded", listarFuncionarios);

/* =====================================================
   CRACHÁ
===================================================== */
const tamanhos = {
  cr80:{w:5.4,h:8.6},
  a7:{w:7.4,h:10.5},
  a6:{w:10.5,h:14.8},
  "10x15":{w:10,h:15},
  "12x15":{w:12,h:15}
};
const cmParaPx = cm => cm * 118;

function gerarIdUnico() {
  return "CR-" + Date.now().toString(36).toUpperCase();
}

function gerarCracha() {
  const cracha = document.getElementById("cracha");
  const tipo = document.getElementById("tipo");
  if (!cracha || !tipo) return;

  cracha.style.width = cmParaPx(tamanhos[tipo.value].w) + "px";
  cracha.style.height = cmParaPx(tamanhos[tipo.value].h) + "px";

  document.getElementById("nomePrev").innerText =
    document.getElementById("nome").value;

  document.getElementById("setorPrev").innerText =
    document.getElementById("setor").value;

  const id = gerarIdUnico();
  document.getElementById("idCracha").innerText = id;

  const foto = document.getElementById("foto").files[0];
  if (foto) {
    const r = new FileReader();
    r.onload = e => document.getElementById("fotoPrev").src = e.target.result;
    r.readAsDataURL(foto);
  }

  const fundo = document.getElementById("fundo").files[0];
  if (fundo) {
    const r = new FileReader();
    r.onload = e => document.getElementById("bg").src = e.target.result;
    r.readAsDataURL(fundo);
  }

  gerarQRCode(id);
}

function gerarQRCode(id) {
  const qr = document.getElementById("qrcode");
  qr.innerHTML = "";
  new QRCode(qr, {
    text: JSON.stringify({ id }),
    width: 90,
    height: 90
  });
}

/* =====================================================
   DRAG & DROP
===================================================== */
function tornarArrastavel(el, key) {
  let offsetX = 0, offsetY = 0, dragging = false;

  el.addEventListener("mousedown", e => {
    dragging = true;
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;
  });

  document.addEventListener("mousemove", e => {
    if (!dragging) return;
    el.style.left = e.clientX - offsetX + "px";
    el.style.top = e.clientY - offsetY + "px";
    el.style.transform = "none";
  });

  document.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;
    localStorage.setItem(key, JSON.stringify({
      left: el.style.left,
      top: el.style.top
    }));
  });

  const salvo = localStorage.getItem(key);
  if (salvo) {
    const pos = JSON.parse(salvo);
    el.style.left = pos.left;
    el.style.top = pos.top;
    el.style.transform = "none";
  }
}

function resetarPosicoes() {
  localStorage.removeItem("pos_nome");
  localStorage.removeItem("pos_setor");
  location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
  const nomePrev = document.getElementById("nomePrev");
  const setorPrev = document.getElementById("setorPrev");

  if (nomePrev) tornarArrastavel(nomePrev, "pos_nome");
  if (setorPrev) tornarArrastavel(setorPrev, "pos_setor");
});

/* =====================================================
   EXPORTAÇÃO
===================================================== */
function baixarPNG() {
  html2canvas(document.getElementById("cracha"), {
    scale: 3,
    ignoreElements: el => el.tagName === "IMG" && !el.src
  }).then(canvas => {
    const a = document.createElement("a");
    a.download = "cracha.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  });
}

async function baixarPDF() {
  const { jsPDF } = window.jspdf;
  const tipo = document.getElementById("tipo").value;
  const w = tamanhos[tipo].w;
  const h = tamanhos[tipo].h;

  const canvas = await html2canvas(document.getElementById("cracha"), {
    scale: 3,
    ignoreElements: el => el.tagName === "IMG" && !el.src
  });

  const pdf = new jsPDF({
    orientation: h > w ? "portrait" : "landscape",
    unit: "cm",
    format: [w, h]
  });

  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, w, h);
  pdf.save("cracha.pdf");
}

