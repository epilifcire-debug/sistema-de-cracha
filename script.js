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
  const u = document.getElementById("login")?.value?.trim();
  const s = document.getElementById("senha")?.value?.trim();

  if (!u || !s) return alert("Preencha login e senha");
  if (!usuarios[u]) return alert("Usuário não existe");
  if (usuarios[u].senha !== s) return alert("Senha incorreta");

  const usuarioLogado = { login: u, perfil: usuarios[u].perfil };
  localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));

  location.href = usuarioLogado.perfil === "admin"
    ? "admin.html"
    : "cracha.html";
}

/* =====================================================
   PROTEÇÃO (GITHUB PAGES SAFE)
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
  const login = document.getElementById("novoLogin")?.value?.trim();
  const senha = document.getElementById("novaSenha")?.value?.trim();
  if (!login || !senha) return alert("Preencha tudo");

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || {};
  if (usuarios[login]) return alert("Usuário já existe");

  usuarios[login] = { senha, perfil: "funcionario" };
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
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
  cr80:{w:5.4,h:8.6}, a7:{w:7.4,h:10.5},
  a6:{w:10.5,h:14.8}, "10x15":{w:10,h:15}, "12x15":{w:12,h:15}
};
const cmParaPx = cm => cm * 118;

function gerarIdUnico() {
  const d = new Date().toISOString().slice(0,10).replace(/-/g,"");
  const r = Math.random().toString(36).substr(2,6).toUpperCase();
  return `CR-${d}-${r}`;
}

function gerarCracha() {
  const t = tipo.value;
  cracha.style.width = cmParaPx(tamanhos[t].w)+"px";
  cracha.style.height = cmParaPx(tamanhos[t].h)+"px";

  nomePrev.innerText = nome.value;
  setorPrev.innerText = setor.value;

  const id = gerarIdUnico();
  if (idCracha) idCracha.innerText = id;

  if (foto.files[0]) {
    const r = new FileReader();
    r.onload = e => fotoPrev.src = e.target.result;
    r.readAsDataURL(foto.files[0]);
  }

  if (fundo.files[0]) {
    const r = new FileReader();
    r.onload = e => bg.src = e.target.result;
    r.readAsDataURL(fundo.files[0]);
  }

  gerarQRCode(id);
}

function gerarQRCode(id) {
  if (!qrcode) return;
  qrcode.innerHTML = "";
  new QRCode(qrcode, {
    text: JSON.stringify({
      id,
      nome: nome.value,
      setor: setor.value,
      usuario: JSON.parse(localStorage.getItem("usuarioLogado")).login,
      criadoEm: new Date().toISOString()
    }),
    width: 90,
    height: 90
  });
}

function baixarPNG() {
  html2canvas(cracha, { scale: 3 }).then(c => {
    const a = document.createElement("a");
    a.download = "cracha.png";
    a.href = c.toDataURL();
    a.click();
  });
}

async function baixarPDF() {
  const { jsPDF } = window.jspdf;
  const t = tipo.value;
  const w = tamanhos[t].w, h = tamanhos[t].h;

  const c = await html2canvas(cracha, { scale: 3 });
  const pdf = new jsPDF({
    orientation: h > w ? "portrait" : "landscape",
    unit: "cm",
    format: [w, h]
  });

  pdf.addImage(c.toDataURL(), "PNG", 0, 0, w, h);
  pdf.save("cracha-impressao.pdf");
}
