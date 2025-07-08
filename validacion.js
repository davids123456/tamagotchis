class ValidadorDeJuego {
  constructor() {
    this.validationMessage = document.getElementById("validation-message");
    this.audio = document.getElementById("bg-music");
    this.nombreInput = document.getElementById("nombre");
    this.fechaNacimientoInput = document.getElementById("fecha-nacimiento");
    this.nombreUsuarioInput = document.getElementById("usuario"); // Añadido para usuario
  }

  mostrarMensajeDeValidacion(mensaje) {
    this.validationMessage.textContent = mensaje;
    this.validationMessage.style.display = "block";
  }

  ocultarMensajeDeValidacion() {
    this.validationMessage.style.display = "none";
  }

  validar() {
    const nombreUsuario = this.nombreUsuarioInput.value; 
    const nombre = this.nombreInput.value;
    const fechaNacimiento = this.fechaNacimientoInput.value;

    this.ocultarMensajeDeValidacion(); 

    if (!nombreUsuario) {
      this.mostrarMensajeDeValidacion("Por favor ingrese tu nombre.");
      return false;
    }

    if (!nombre) {
      this.mostrarMensajeDeValidacion("Por favor ingrese un nombre para el Tamagotchi.");
      return false;
    }

    if (!fechaNacimiento) {
      this.mostrarMensajeDeValidacion("Por favor ingrese la fecha de nacimiento.");
      return false;
    }

    const hoy = new Date().toISOString().split('T')[0]; 
    if (fechaNacimiento > hoy) {
      this.mostrarMensajeDeValidacion("La fecha de nacimiento no puede ser mayor que la fecha actual.");
      return false;
    }

    if (/[^a-zA-Z\s]/.test(nombre)) {
      this.mostrarMensajeDeValidacion("El nombre del Tamagotchi solo puede contener letras.");
      return false;
    }

    if (/[^a-zA-Z\s]/.test(nombreUsuario)) {
      this.mostrarMensajeDeValidacion("El nombre de usuario solo puede contener letras.");
      return false;
    }

    return true;
  }

  irAJugar(event) {
    if (!this.validar()) {
      event.preventDefault(); 
      return;
    }

    const nombreUsuario = this.nombreUsuarioInput.value; 
    const nombre = this.nombreInput.value;
    const fechaNacimiento = this.fechaNacimientoInput.value;

    localStorage.setItem("nombreUsuario", nombreUsuario);
    localStorage.setItem("nombreTamagotchi", nombre);
    localStorage.setItem("fechaNacimiento", fechaNacimiento);

    if (!this.audio.paused) {
      localStorage.setItem("musicCurrentTime", this.audio.currentTime);
      localStorage.setItem("musicState", "playing");
    } else {
      localStorage.setItem("musicState", "paused");
    }

    localStorage.setItem("mostrarFrase", "true");

    location.href = 'jugar.html';
  }

  continuarMusica() {
    const musicState = localStorage.getItem("musicState");
    if (musicState === "playing") {
      this.audio.currentTime = parseFloat(localStorage.getItem("musicCurrentTime"));
      this.audio.play();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const validadorDeJuego = new ValidadorDeJuego();

  const botonJugar = document.getElementById("jugar-btn");
  botonJugar.addEventListener("click", (event) => validadorDeJuego.irAJugar(event));

  validadorDeJuego.continuarMusica();
});
