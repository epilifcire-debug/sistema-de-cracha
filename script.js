/* =====================================================
   INIT SEGURO (CRIA ADMIN SE NÃO EXISTIR)
===================================================== */
(function init() {
  let usuarios = JSON.parse(localStorage.getItem("usuarios"));

  if (!usuarios || !usuarios.admin) {
    usuarios = {
      admin: { senha: "admin123", perfil: "admin" }
    };
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
  }
})();

/* =====================================================
   LOGIN
===================================================== */
function entrar() {
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || {};

  const u = document.getElementById("login").value.trim();
  const s = document.getElementById("senha").value.trim();

  if (!u || !s) {
    alert("Preencha login e senha");
    return;
  }

  if (!usuarios[u]) {
    alert("Usuário não existe");
    return;
  }

  if (usuarios[u].senha !== s) {
    alert("Senha incorreta");
    return;
  }

  const usuarioLogado = {
    login: u,
    perfil: usuarios[u].perfil
  };

  localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));

  if (usuarioLogado.perfil === "admin") {
    location.href = "admin.html";
  } else {
    location.href = "cracha.html";
  }
}

/* =====================================================
   PROTEÇÃO DE PÁGINAS (GITHUB PAGES SAFE)
===================================================== */
(function protegerPaginas() {
  const path = location.pathname;
  const paginaLogin =
    path.endsWith("/") ||
    path.endsWith("/index.html");

  if (paginaLogin) return;

  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

  if (!usuarioLogado || !usuarioLogado.perfil) {
    localStorage.removeItem("usuarioLogado");
    location.href = "index.html";
    return;
  }

  if (
    path.endsWith("/admin.html") &&
    usuarioLogado.perfil !== "admin"
  ) {
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
  const login = document.getElementById("novoLogin").value.trim();
  const senha = document.getElementById("novaSenha").value.trim();

  if (!login || !senha) {
    alert("Preencha login e senha");
    return;
  }

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || {};

  if (usuarios[login]) {
    alert("Usuário já existe");
    return;
  }

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
        <li>
          ${u}
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
