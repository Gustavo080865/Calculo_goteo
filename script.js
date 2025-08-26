document.getElementById("goteoForm").addEventListener("submit", function(e){
  e.preventDefault();

  let volumen = parseFloat(document.getElementById("volumen").value);
  let horas = parseFloat(document.getElementById("tiempoHoras").value) || 0;
  let minutos = parseFloat(document.getElementById("tiempoMinutos").value) || 0;
  let factor = parseFloat(document.getElementById("factor").value);

  // Si hay horas, convertirlas a minutos y sumarlas
  let tiempoTotalMin = (horas * 60) + minutos;

  if (tiempoTotalMin <= 0) {
    alert("Por favor ingresa un tiempo válido.");
    return;
  }

  // Calcular
  let goteo = (volumen * factor) / tiempoTotalMin; 
  let velocidad = volumen / (tiempoTotalMin / 60); 
  let segundosPorGota = 60 / goteo; 

  // Mostrar resultados
  document.getElementById("resultados").classList.remove("oculto");

  // ✅ Mostrar tiempo correctamente sin duplicarlo
  let horasFinal = Math.floor(tiempoTotalMin / 60);
  let minutosFinal = tiempoTotalMin % 60;

  document.getElementById("tiempoTotal").innerHTML = 
    `⏳ Tiempo total: <b>${tiempoTotalMin} min (${horasFinal}h ${minutosFinal}m)</b>`;
  document.getElementById("goteo").innerHTML = 
    `💧 Goteo: <b>${goteo.toFixed(2)} gtt/min</b>`;
  document.getElementById("velocidad").innerHTML = 
    `⚡ Velocidad: <b>${velocidad.toFixed(2)} ml/h</b>`;
  document.getElementById("segundos").innerHTML = 
    `⏱️ Segundos por gota: <b>${segundosPorGota.toFixed(2)} s/gota</b>`;
});
