/* Cálculo de Goteo – Enfermería
   Fórmulas:
   - Tiempo total (min) = (horas * 60) + minutos
   - Goteo (gtt/min)   = (volumen_ml * factor_gtt_por_ml) / tiempo_min
   - Velocidad (ml/h)  = volumen_ml / (tiempo_min / 60)
   - Segundos por gota = 60 / (gtt/min)
*/

(function(){
  const $ = (sel) => document.querySelector(sel);

  // Elementos
  const form = $("#formGoteo");
  const volumen = $("#volumen");
  const horas = $("#horas");
  const minutos = $("#minutos");
  const factor = $("#factor");
  const grupoOtro = $("#grupoOtro");
  const factorOtro = $("#factorOtro");

  const panelResultados = $("#panelResultados");
  const resTiempo = $("#resTiempo");
  const resGoteo = $("#resGoteo");
  const resVelocidad = $("#resVelocidad");
  const resSegPorGota = $("#resSegPorGota");

  const btnLimpiar = $("#btnLimpiar");
  const btnCopiar = $("#btnCopiar");
  const btnCompartir = $("#btnCompartir");

  // 🔹 Cuando cambien las horas, autocompleta minutos
  horas.addEventListener("input", () => {
    const h = parseFloat(horas.value);
    if (!isNaN(h) && h >= 0) {
      minutos.value = h * 60;
    }
  });

  // Mostrar input "Otro"
  factor.addEventListener("change", () => {
    const esOtro = factor.value === "otro";
    grupoOtro.classList.toggle("hidden", !esOtro);
    if (esOtro) factorOtro.focus();
  });

  // Validación básica
  function validar() {
    const vol = parseFloat(volumen.value);
    const h = parseFloat(horas.value || "0");
    const m = parseFloat(minutos.value || "0");
    const facSel = factor.value;
    const facOtro = parseFloat(factorOtro.value);

    if (!(vol > 0)) {
      alert("Ingresa un volumen válido (ml).");
      volumen.focus();
      return null;
    }

    const tiempoMin = (isFinite(h) ? h : 0) * 60 + (isFinite(m) ? m : 0);
    if (!(tiempoMin > 0)) {
      alert("Ingresa un tiempo mayor a 0 (horas y/o minutos).");
      (horas.value ? minutos : horas).focus();
      return null;
    }

    let fac;
    if (facSel === "" ) {
      alert("Selecciona un factor de goteo.");
      factor.focus();
      return null;
    } else if (facSel === "otro") {
      if (!(facOtro > 0)) {
        alert("Ingresa un factor de goteo válido en 'Otro'.");
        factorOtro.focus();
        return null;
      }
      fac = facOtro;
    } else {
      fac = parseFloat(facSel);
    }

    return { vol, tiempoMin, fac };
  }

  function formatearMinutos(min) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    const hhmm = `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")} h`;
    return `${min} min (${hhmm})`;
  }

  function calcular({ vol, tiempoMin, fac }) {
    const gttMin = (vol * fac) / tiempoMin;               // gtt/min
    const mlHora = vol / (tiempoMin / 60);                // ml/h
    const segPorGota = 60 / gttMin;                       // s/gota

    return {
      gttMin: redondear(gttMin, 2),
      mlHora: redondear(mlHora, 2),
      segPorGota: redondear(segPorGota, 2),
      tiempo: formatearMinutos(tiempoMin),
    };
  }

  function redondear(numero, dec=2){
    const f = Math.pow(10, dec);
    return Math.round(numero * f) / f;
  }

  function mostrarResultados(r) {
    resTiempo.textContent = r.tiempo;
    resGoteo.textContent = `${r.gttMin} gtt/min`;
    resVelocidad.textContent = `${r.mlHora} ml/h`;
    resSegPorGota.textContent = `${r.segPorGota} s/gota`;
    panelResultados.classList.remove("hidden");
  }

  // Copiar / Compartir
  function construirTextoClipboard(){
    return [
      "💧 Cálculo de Goteo",
      `Tiempo total: ${resTiempo.textContent}`,
      `Goteo: ${resGoteo.textContent}`,
      `Velocidad: ${resVelocidad.textContent}`,
      `Segundos por gota: ${resSegPorGota.textContent}`
    ].join("\n");
  }

  btnCopiar.addEventListener("click", async () => {
    try{
      await navigator.clipboard.writeText(construirTextoClipboard());
      alert("Resultados copiados al portapapeles ✅");
    }catch{
      alert("No se pudo copiar automáticamente. Selecciona y copia manualmente.");
    }
  });

  btnCompartir.addEventListener("click", async () => {
    const text = construirTextoClipboard();
    if (navigator.share){
      try{
        await navigator.share({ title:"Cálculo de Goteo", text });
      }catch{/* cancelado */}
    }else{
      alert("Tu navegador no soporta compartir nativo. Se copiarán los resultados.");
      try{
        await navigator.clipboard.writeText(text);
        alert("Resultados copiados ✅");
      }catch{}
    }
  });

  // Envío del formulario
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = validar();
    if (!datos) return;
    const r = calcular(datos);
    mostrarResultados(r);
    guardarLocal(datos);
  });

  // Limpiar
  btnLimpiar.addEventListener("click", () => {
    form.reset();
    grupoOtro.classList.add("hidden");
    panelResultados.classList.add("hidden");
    localStorage.removeItem("goteo:last");
    volumen.focus();
  });

  // Persistencia simple
  function guardarLocal({ vol, tiempoMin, fac }){
    try{
      localStorage.setItem("goteo:last", JSON.stringify({ vol, tiempoMin, fac, t: Date.now() }));
    }catch{}
  }

  function restaurarLocal(){
    try{
      const raw = localStorage.getItem("goteo:last");
      if(!raw) return;
      const { vol, tiempoMin, fac } = JSON.parse(raw);

      if (vol){ volumen.value = vol; }
      if (typeof tiempoMin === "number"){
        const h = Math.floor(tiempoMin/60);
        const m = tiempoMin%60;
        horas.value = h;
        minutos.value = m;
      }
      if (fac){
        const opciones = Array.from(factor.options).map(o => o.value);
        if (opciones.includes(String(fac))){
          factor.value = String(fac);
          grupoOtro.classList.add("hidden");
        }else{
          factor.value = "otro";
          grupoOtro.classList.remove("hidden");
          factorOtro.value = fac;
        }
      }
    }catch{}
  }

  // Inicialización
  restaurarLocal();
})();
