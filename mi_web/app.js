const API_BASE = "http://127.0.0.1:8000";

const state = {
  user: null,
  servicios: [],
};

const dom = {
  badge: document.getElementById("user-badge"),
  btnLogout: document.getElementById("btn-logout"),
  navLinks: Array.from(document.querySelectorAll(".sidebar__nav a")),
  sections: Array.from(document.querySelectorAll("main .app section, main section")),
  formSaludo: document.getElementById("form-saludo"),
  formRegistro: document.getElementById("form-registro"),
  formLogin: document.getElementById("form-login"),
  formAgregarServicio: document.getElementById("form-agregar-servicio"),
  listaServicios: document.getElementById("lista-servicios"),
  selectMascotaServicio: document.getElementById("select-mascota-servicio"),
  formRegistrarMascota: document.getElementById("form-registrar-mascota"),
  formBuscarMascota: document.getElementById("form-buscar-mascota"),
  resultadosMascotas: document.getElementById("resultados-mascotas"),
  formReporte: document.getElementById("form-reporte"),
  reporteResultados: document.getElementById("reporte-resultados"),
};

function showAlert(targetEl, type, message, timeout = 3000) {
  const alert = document.createElement("div");
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  targetEl.insertBefore(alert, targetEl.firstChild);
  setTimeout(() => {
    alert.remove();
  }, timeout);
}

function setAuthState(userEmail) {
  state.user = userEmail;
  if (userEmail) {
    dom.badge.textContent = `Usuario: ${userEmail}`;
    dom.btnLogout.style.display = "inline-block";
    enableProtectedTabs();
    switchTab("servicios");
  } else {
    dom.user = null;
    dom.badge.textContent = "Usuario: invitado";
    dom.btnLogout.style.display = "none";
    disableProtectedTabs();
    switchTab("acceso");
  }
}

function enableProtectedTabs() {
  dom.navLinks.forEach((link) => {
    const key = link.dataset.tab;
    if (["servicios", "mascotas", "reporte"].includes(key)) {
      link.classList.remove("locked");
      link.style.opacity = "1";
      link.tabIndex = 0;
    }
  });
}

function disableProtectedTabs() {
  dom.navLinks.forEach((link) => {
    const key = link.dataset.tab;
    if (["servicios", "mascotas", "reporte"].includes(key)) {
      link.classList.add("locked");
      link.style.opacity = "0.4";
      link.tabIndex = -1;
    }
  });
}

function switchTab(tabName) {
  let tab = tabName.toLowerCase();
  const protectedTabs = ["servicios", "mascotas", "reporte"];
  if (protectedTabs.includes(tab) && !state.user) {
    tab = "acceso";
    showAlert(document.body, "error", "Debes iniciar sesión para acceder a esta sección.");
  }

  dom.sections.forEach((section) => {
    section.classList.remove("active");
    section.classList.add("section");
  });

  const target = document.getElementById(tab);
  if (target) {
    target.classList.remove("section");
    target.classList.add("active");
  }

  dom.navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.tab === tab);
  });

  if (tab === "servicios") {
    loadServicios();
  }

  if (tab === "mascotas") {
    loadServicios();
  }

  if (tab === "reporte") {
    if (state.user) {
      const input = document.getElementById("input-reporte-email");
      input.value = state.user;
      fetchReporte(state.user);
    }
  }
}

async function fetchJson(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload.detail || payload.message || "Error de red");
  }
  return payload;
}

async function loadServicios() {
  try {
    const data = await fetchJson("/servicios/");
    state.servicios = data.servicios || [];
    renderServicios();
    renderServiciosSelect();
  } catch (err) {
    showAlert(dom.listaServicios, "error", `No fue posible cargar servicios: ${err.message}`);
  }
}

function renderServicios() {
  dom.listaServicios.innerHTML = "";
  if (state.servicios.length === 0) {
    dom.listaServicios.innerHTML = "<p>No hay servicios registrados aún.</p>";
    return;
  }

  const list = document.createElement("ul");
  list.style.margin = "0";
  list.style.padding = "0";
  list.style.listStyle = "none";

  state.servicios.forEach((serv) => {
    const li = document.createElement("li");
    li.textContent = `${serv.nombre} - $${parseFloat(serv.precio).toFixed(2)}`;
    li.style.padding = "0.4rem 0";
    list.appendChild(li);
  });

  dom.listaServicios.appendChild(list);
}

function renderServiciosSelect() {
  const select = dom.selectMascotaServicio;
  if (!select) return;
  select.innerHTML = "<option value=''>Selecciona un servicio</option>";
  state.servicios.forEach((serv) => {
    const opt = document.createElement("option");
    opt.value = serv.nombre;
    opt.textContent = `${serv.nombre} - $${parseFloat(serv.precio).toFixed(2)}`;
    select.appendChild(opt);
  });
}

async function fetchMascotas(correo) {
  try {
    const data = await fetchJson(`/mascotas/${encodeURIComponent(correo)}`);
    renderMascotas(data.registros || []);
  } catch (err) {
    showAlert(dom.resultadosMascotas, "error", `Error buscando mascotas: ${err.message}`);
  }
}

function renderMascotas(mascotas) {
  dom.resultadosMascotas.innerHTML = "";
  if (!mascotas.length) {
    dom.resultadosMascotas.innerHTML = "<p>No se encontraron mascotas.</p>";
    return;
  }

  mascotas.forEach((mascota) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.marginBottom = "0.8rem";
    card.innerHTML = `
      <h4>${mascota.nombre} (${mascota.tipo_servicio})</h4>
      <p>Dueño: ${mascota.correo}</p>
      <p>Fecha: ${mascota.fecha}</p>
    `;
    dom.resultadosMascotas.appendChild(card);
  });
}

async function fetchReporte(correo) {
  try {
    const data = await fetchJson(`/reporte/${encodeURIComponent(correo)}`);
    renderReporte(data);
  } catch (err) {
    showAlert(dom.reporteResultados, "error", `Error cargando reporte: ${err.message}`);
  }
}

function renderReporte(data) {
  dom.reporteResultados.innerHTML = "";
  if (!data || !data.correo_dueno) {
    dom.reporteResultados.innerHTML = "<p>No hay reporte disponible.</p>";
    return;
  }

  const stats = document.createElement("div");
  stats.style.display = "grid";
  stats.style.gridTemplateColumns = "repeat(auto-fill,minmax(180px,1fr))";
  stats.style.gap = "0.75rem";

  const makeStat = (label, value) => {
    const box = document.createElement("div");
    box.className = "card";
    box.innerHTML = `<strong>${value}</strong><p>${label}</p>`;
    return box;
  };

  stats.appendChild(makeStat("Cantidad de servicios", data.cantidad_servicios));
  stats.appendChild(makeStat("Total gastado", `$${Number(data.total_gastado).toFixed(2)}`));
  stats.appendChild(makeStat("Correo", data.correo_dueno));

  dom.reporteResultados.appendChild(stats);

  if (Array.isArray(data.servicios) && data.servicios.length) {
    const tags = document.createElement("div");
    tags.style.marginTop = "1rem";
    tags.innerHTML = "<h4>Servicios usados</h4>";

    data.servicios.forEach((svc) => {
      const badge = document.createElement("span");
      badge.textContent = svc;
      badge.style.display = "inline-block";
      badge.style.margin = "0.25rem 0.25rem 0 0";
      badge.style.padding = "0.3rem 0.55rem";
      badge.style.borderRadius = "999px";
      badge.style.border = `1px solid ${state.user ? "#0ea5a0" : "#94a3b8"}`;
      badge.style.color = "#0f172a";
      badge.style.background = "#f8fafc";
      tags.appendChild(badge);
    });
    dom.reporteResultados.appendChild(tags);
  }
}

async function init() {
  dom.navLinks.forEach((link) => {
    link.addEventListener("click", (evt) => {
      evt.preventDefault();
      const tab = link.dataset.tab;
      if (tab) switchTab(tab);
    });
  });

  dom.btnLogout.addEventListener("click", (evt) => {
    evt.preventDefault();
    logout();
  });

  dom.formSaludo.addEventListener("submit", async (evt) => {
    evt.preventDefault();
    const nombre = document.getElementById("input-nombre-saludo").value.trim();
    if (!nombre) {
      showAlert(dom.formSaludo, "error", "Ingresa tu nombre para saludar.");
      return;
    }
    try {
      const data = await fetchJson(`/bienvenido/${encodeURIComponent(nombre)}`);
      showAlert(dom.formSaludo, "success", data.mensaje || "¡Hola!");
    } catch (err) {
      showAlert(dom.formSaludo, "error", err.message);
    }
  });

  dom.formRegistro.addEventListener("submit", async (evt) => {
    evt.preventDefault();
    const email = document.getElementById("input-registro-email").value.trim();
    const password = document.getElementById("input-registro-password").value;
    if (!email || !password) {
      showAlert(dom.formRegistro, "error", "Completa correo y contraseña.");
      return;
    }
    try {
      const data = await fetchJson("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email: email, password: password }),
      });
      showAlert(dom.formRegistro, "success", data.message || "Registro exitoso.");
    } catch (err) {
      showAlert(dom.formRegistro, "error", err.message);
    }
  });

  dom.formLogin.addEventListener("submit", async (evt) => {
    evt.preventDefault();
    const email = document.getElementById("input-login-email").value.trim();
    const password = document.getElementById("input-login-password").value;
    if (!email || !password) {
      showAlert(dom.formLogin, "error", "Completa correo y contraseña.");
      return;
    }
    try {
      const data = await fetchJson("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email, password: password }),
      });
      setAuthState(email);
      showAlert(dom.formLogin, "success", data.message || "Login exitoso.");
    } catch (err) {
      showAlert(dom.formLogin, "error", err.message);
    }
  });

  dom.formAgregarServicio.addEventListener("submit", async (evt) => {
    evt.preventDefault();
    const nombre = document.getElementById("input-servicio-nombre").value.trim();
    const precio = document.getElementById("input-servicio-precio").value;
    if (!nombre || !precio) {
      showAlert(dom.formAgregarServicio, "error", "Completa nombre y precio.");
      return;
    }
    try {
      const data = await fetchJson("/servicios/agregar", {
        method: "POST",
        body: JSON.stringify({ nombre, precio: Number(precio) }),
      });
      showAlert(dom.formAgregarServicio, "success", data.message || "Servicio agregado.");
      loadServicios();
      dom.formAgregarServicio.reset();
    } catch (err) {
      showAlert(dom.formAgregarServicio, "error", err.message);
    }
  });

  dom.formRegistrarMascota.addEventListener("submit", async (evt) => {
    evt.preventDefault();
    const correo = document.getElementById("input-mascota-email").value.trim();
    const nombre = document.getElementById("input-mascota-nombre").value.trim();
    const tipoServicio = document.getElementById("select-mascota-servicio").value;
    const fecha = document.getElementById("input-mascota-fecha").value;
    if (!correo || !nombre || !tipoServicio || !fecha) {
      showAlert(dom.formRegistrarMascota, "error", "Completa todos los campos de la mascota.");
      return;
    }
    try {
      const data = await fetchJson("/mascotas/registrar-mascota", {
        method: "POST",
        body: JSON.stringify({ correo_dueno: correo, nombre_mascota: nombre, tipo_servicio: tipoServicio, fecha }),
      });
      showAlert(dom.formRegistrarMascota, "success", data.message || "Mascota registrada.");
      dom.formRegistrarMascota.reset();
    } catch (err) {
      showAlert(dom.formRegistrarMascota, "error", err.message);
    }
  });

  dom.formBuscarMascota.addEventListener("submit", (evt) => {
    evt.preventDefault();
    const criterio = document.getElementById("input-buscar-mascota").value.trim();
    if (!criterio) {
      showAlert(dom.formBuscarMascota, "error", "Ingresa el correo o nombre para buscar.");
      return;
    }
    fetchMascotas(criterio);
  });

  dom.formReporte.addEventListener("submit", (evt) => {
    evt.preventDefault();
    const correo = document.getElementById("input-reporte-email").value.trim();
    if (!correo) {
      showAlert(dom.formReporte, "error", "Ingresa correo para generar reporte.");
      return;
    }
    fetchReporte(correo);
  });

  setAuthState(null);
  switchTab("inicio");
}

function logout() {
  setAuthState(null);
  showAlert(document.body, "success", "Sesión cerrada.");
}

window.addEventListener("DOMContentLoaded", init);
