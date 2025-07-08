class ReproductorDeMusica {
  constructor(idElementoAudio, idElementoBoton, idElementoImagenBoton) {
    this.audio = document.getElementById(idElementoAudio);
    this.boton = document.getElementById(idElementoBoton);
    this.imagenBoton = document.getElementById(idElementoImagenBoton);

    this.iniciarMusica();
    this.agregarListeners();
  }

  iniciarMusica() {
    const estadoMusica = localStorage.getItem("estadoMusica");
    const tiempoGuardado = localStorage.getItem("tiempoActualMusica");

    if (tiempoGuardado && !isNaN(parseFloat(tiempoGuardado))) {
      this.audio.currentTime = parseFloat(tiempoGuardado);
    }

    this.audio.play().catch((error) => {
      console.log("No se pudo reproducir automáticamente:", error);
      this.imagenBoton.src = "Imagenes/play.png";
      localStorage.setItem("estadoMusica", "paused");
    });

    if (estadoMusica === "paused") {
      this.audio.pause();
      this.imagenBoton.src = "Imagenes/pausa.png";
    } else {
      this.imagenBoton.src = "Imagenes/play.png";
    }
  }

  alternarMusica() {
    if (this.audio.paused) {
      this.audio
        .play()
        .then(() => {
          this.imagenBoton.src = "Imagenes/play.png";
          localStorage.setItem("estadoMusica", "playing");
        })
        .catch((error) => {
          console.log("Error al reproducir:", error);
        });
    } else {
      this.audio.pause();
      this.imagenBoton.src = "Imagenes/pausa.png";
      localStorage.setItem("estadoMusica", "paused");
      this.guardarTiempoActual();
    }
  }

  guardarTiempoActual() {
    if (!this.audio.paused) {
      localStorage.setItem("tiempoActualMusica", this.audio.currentTime);
    }
  }

  agregarListeners() {
    this.boton.addEventListener("click", () => this.alternarMusica());
    setInterval(() => this.guardarTiempoActual(), 1000);

    window.addEventListener("beforeunload", () => {
      if (!this.audio.paused) {
        localStorage.setItem("tiempoActualMusica", this.audio.currentTime);
        localStorage.setItem("estadoMusica", "playing");
      }
    });

    this.audio.addEventListener("ended", () => {
      localStorage.setItem("tiempoActualMusica", 0);
    });

    this.audio.addEventListener("error", (e) => {
      console.log("Error al cargar el audio:", e);
      this.imagenBoton.src = "Imagenes/pausa.png";
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ReproductorDeMusica("bg-music", "music-control-btn", "pause-play-btn");

  const audio = document.getElementById("bg-music");

  audio.play().catch((error) => {});
});
