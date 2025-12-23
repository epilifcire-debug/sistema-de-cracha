/* =====================================================
   LOGIN / PROTEÇÃO (RESUMIDO)
===================================================== */
(function init() {
  let usuarios = JSON.parse(localStorage.getItem("usuarios"));
  if (!usuarios || !usuarios.admin) {
    usuarios = { admin: { senha: "admin123", perfil: "admin" } };
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
  }
})();

function logout() {
  localStorage.removeItem("usuarioLogado");
  location.href = "index.html";
}

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
  const t = tipo.value;
  cracha.style.width = cmParaPx(tamanhos[t].w) + "px";
  cracha.style.height = cmParaPx(tamanhos[t].h) + "px";

  nomePrev.innerText = nome.value;
  setorPrev.innerText = setor.value;
  idCracha.innerText = gerarIdUnico();

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

  gerarQRCode(idCracha.innerText);
}

function gerarQRCode(id) {
  qrcode.innerHTML = "";
  new QRCode(qrcode, {
    text: JSON.stringify({ id, nome: nome.value, setor: setor.value }),
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
  tornarArrastavel(nomePrev, "pos_nome");
  tornarArrastavel(setorPrev, "pos_setor");
});

/* =====================================================
   EXPORTAÇÃO
===================================================== */
function baixarPNG() {
  html2canvas(cracha, {
    scale: 3,
    ignoreElements: el => el.tagName === "IMG" && !el.src
  }).then(c => {
    const a = document.createElement("a");
    a.download = "cracha.png";
    a.href = c.toDataURL();
    a.click();
  });
}

async function baixarPDF() {
  const { jsPDF } = window.jspdf;
  const t = tipo.value;
  const w = tamanhos[t].w;
  const h = tamanhos[t].h;

  const canvas = await html2canvas(cracha, {
    scale: 3,
    ignoreElements: el => el.tagName === "IMG" && !el.src
  });

  const pdf = new jsPDF({
    orientation: h > w ? "portrait" : "landscape",
    unit: "cm",
    format: [w, h]
  });

  pdf.addImage(canvas.toDataURL(), "PNG", 0, 0, w, h);
  pdf.save("cracha.pdf");
}
