document.addEventListener("DOMContentLoaded", () => {
  console.log("Base JS carregado")
})

/* helpers globais se quiser no futuro */
function qs(selector) {
  return document.querySelector(selector)
}

function qsa(selector) {
  return document.querySelectorAll(selector)
}
