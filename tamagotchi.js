function reiniciarTamagotchi() {
  window.name = "";

  if (window.tamagotchiInterval) {
    clearInterval(window.tamagotchiInterval);
  }

  location.reload();
}
function guardarEstadoTamagotchi(estado) {
  window.name = JSON.stringify(estado);
}

function cargarEstadoTamagotchi() {
  try {
    if (window.name && window.name !== "") {
      const estado = JSON.parse(window.name);
      return estado;
    }
  } catch (e) {
    showThoughtBubble("Error al cargar estado:", e);
  }

  return {
    hambre: 0,
    energia: 100,
    diversion: 100,
    vida: 100,
    suciedad: 0,
    estado: "Feliz",
    ultimaActualizacion: Date.now(),
  };
}

// Logger personalizado
function customLog(message) {
  const outputDiv = document.getElementById("console-output");
  if (outputDiv) {
    outputDiv.innerHTML += message + "<br>";
    outputDiv.scrollTop = outputDiv.scrollHeight;
    setTimeout(() => {
      outputDiv.innerHTML = outputDiv.innerHTML.replace(message + "<br>", "");
    }, 3000);
  }
}

console.log = customLog;

class Tamagotchi {
  constructor() {
    // Cargar estado persistente
    const estadoGuardado = cargarEstadoTamagotchi();

    // Calcular degradación basada en tiempo transcurrido
    const tiempoTranscurrido = Math.floor(
      (Date.now() - estadoGuardado.ultimaActualizacion) / 1000
    );

    // Aplicar degradación
    this._hambre = Math.max(
      0,
      Math.min(100, estadoGuardado.hambre - tiempoTranscurrido)
    );
    this._energia = Math.max(
      0,
      Math.min(100, estadoGuardado.energia - tiempoTranscurrido)
    );
    this._diversion = Math.max(
      0,
      Math.min(100, estadoGuardado.diversion - tiempoTranscurrido)
    );
    this._vida = Math.max(
      0,
      Math.min(100, estadoGuardado.vida - tiempoTranscurrido)
    );
    this._suciedad = Math.max(
      0,
      Math.min(100, estadoGuardado.suciedad + tiempoTranscurrido)
    );

    // Guardar estado actualizado
    this.guardarEstado();

    this.setState(this.obtenerEstadoPorNombre(estadoGuardado.estado));
    this.tipoComida = new TipoComida(this);
    this.tipoJuego = new TipoJuego(this);
    this.tipoBaño = new TipoBaño(this);
    this.actualizarBarraProgreso();
    this.iniciarDecremento();
  }

  guardarEstado() {
    const estado = {
      hambre: this._hambre,
      energia: this._energia,
      diversion: this._diversion,
      vida: this._vida,
      suciedad: this._suciedad,
      estado: this.estado ? this.estado.constructor.name : "Feliz",
      ultimaActualizacion: Date.now(),
    };
    guardarEstadoTamagotchi(estado);
    localStorage.setItem("tamagotchiData", JSON.stringify(estado));
  }

  obtenerEstadoPorNombre(nombreEstado) {
    switch (nombreEstado) {
      case "Hambriento":
        return new Hambriento();
      case "Cansada":
        return new Cansada();
      case "Durmiendo":
        return new Durmiendo();
      case "Vida":
        return new Vida();
      case "Sucia":
        return new Sucia();
      default:
        return new Feliz();
    }
  }

  set hambre(valor) {
    this._hambre = Math.max(0, Math.min(100, valor));
    this.guardarEstado();
  }
  get hambre() {
    return this._hambre;
  }

  set energia(valor) {
    this._energia = Math.max(0, Math.min(100, valor));
    this.guardarEstado();
  }
  get energia() {
    return this._energia;
  }

  set diversion(valor) {
    this._diversion = Math.max(0, Math.min(100, valor));
    this.guardarEstado();
  }
  get diversion() {
    return this._diversion;
  }

  set vida(valor) {
    this._vida = Math.max(0, Math.min(100, valor));
    this.guardarEstado();
  }
  get vida() {
    return this._vida;
  }

  set suciedad(valor) {
    this._suciedad = Math.max(0, Math.min(100, valor));
    this.guardarEstado();
  }
  get suciedad() {
    return this._suciedad;
  }

  setState(estado) {
    this.estado = estado;
    this.estado.setTamagotchi(this);
    this.actualizarEstado();
    this.guardarEstado();
  }

  actualizarEstado() {
    const estadoTexto = document.getElementById("estado-texto");
    if (estadoTexto) {
      estadoTexto.textContent = this.estado.constructor.name;
    }
  }

  actualizarBarraProgreso() {
    const actualizar = (id, valor, invertido = false) => {
      const barra = document.getElementById(id);
      if (barra) {
        barra.style.width = `${valor}%`;
        barra.textContent = `${valor}%`;

        if ((invertido && valor < 30) || (!invertido && valor > 60))
          barra.style.backgroundColor = "#4caf50";
        else if ((invertido && valor < 70) || (!invertido && valor > 30))
          barra.style.backgroundColor = "#ffc107";
        else barra.style.backgroundColor = "#f44336";
      }
    };

    actualizar("hambre-bar", this.hambre);
    actualizar("energia-bar", this.energia);
    actualizar("diversion-bar", this.diversion);
    actualizar("suciedad-bar", this.suciedad, true);
    actualizar("vida-bar", this.vida);
  }

  iniciarDecremento() {
    if (window.tamagotchiInterval) {
      clearInterval(window.tamagotchiInterval);
    }

    window.tamagotchiInterval = setInterval(() => {
      this.hambre += 1;
      this.energia -= 1;
      this.diversion -= 1;
      this.vida -= 1;
      this.suciedad += 1;

      this.actualizarBarraProgreso();

      // Cambio de estados automático
      if (this.vida <= 0) {
        window.location.href = "muerto.html";
        return;
      }

      // Cambios de estado basados en estadísticas
      if (this.hambre >= 60 && !(this.estado instanceof Hambriento)) {
        this.setState(new Hambriento());
      } else if (this.energia <= 20 && !(this.estado instanceof Cansada)) {
        this.setState(new Cansada());
      } else if (this.suciedad >= 80 && !(this.estado instanceof Sucia)) {
        this.setState(new Sucia());
      } else if (
        this.hambre < 60 &&
        this.energia > 60 &&
        this.suciedad < 30 &&
        !(this.estado instanceof Feliz)
      ) {
        this.setState(new Feliz());
      }
    }, 1000);
  }
}

// Resto de las clases permanecen igual...
class Comida {
  constructor(nombre, energia, vida, hambre, felicidad) {
    this.nombre = nombre;
    this.energia = energia;
    this.vida = vida;
    this.hambre = hambre;
    this.felicidad = felicidad;
  }

  aplicar(tamagotchi) {
    tamagotchi.energia += this.energia;
    tamagotchi.vida += this.vida;
    tamagotchi.hambre -= this.hambre;
    tamagotchi.diversion += this.felicidad;
    tamagotchi.actualizarBarraProgreso();
  }
}

class TipoComida {
  constructor(tamagotchi) {
    this.tamagotchi = tamagotchi;
  }

  comerKrill() {
    showThoughtBubble("Mmm, krill rico!");
    if (this.tamagotchi.estado.comer()) {
      const krill = new Comida("krill", 10, 10, 50, 10);
      krill.aplicar(this.tamagotchi);
    }
  }

  comerPescado() {
    showThoughtBubble("Pescado delicioso");
    if (this.tamagotchi.estado.comer()) {
      const pescado = new Comida("pescado", 10, 5, 10, 15);
      pescado.aplicar(this.tamagotchi);
    }
  }

  comerCalamar() {
    showThoughtBubble("Calamar sabroso");
    if (this.tamagotchi.estado.comer()) {
      const calamar = new Comida("calamar", 10, 15, 7, 20);
      calamar.aplicar(this.tamagotchi);
    }
  }
}

class Juego {
  constructor(nombre, diversion, suciedad, hambre, energia) {
    this.nombre = nombre;
    this.diversion = diversion;
    this.suciedad = suciedad;
    this.hambre = hambre;
    this.energia = energia;
  }

  aplicar(tamagotchi) {
    tamagotchi.diversion += this.diversion;
    tamagotchi.suciedad += this.suciedad;
    tamagotchi.hambre += this.hambre;
    tamagotchi.energia -= this.energia;
    tamagotchi.actualizarBarraProgreso();
  }
}

class TipoJuego {
  constructor(tamagotchi) {
    this.tamagotchi = tamagotchi;
  }

  jugarFutbol() {
    showThoughtBubble("Que divertido el futbol");
    const futbol = new Juego("fútbol", 20, 15, 10, 10);
    futbol.aplicar(this.tamagotchi);
  }

  jugarBasket() {
    showThoughtBubble("Que divertido el Basquetbol");
    const basket = new Juego("basket", 18, 12, 10, 10);
    basket.aplicar(this.tamagotchi);
  }

  jugarAjedrez() {
    showThoughtBubble("Me gusto el Ajedrez");
    const ajedrez = new Juego("ajedrez", 10, 5, 5, 5);
    ajedrez.aplicar(this.tamagotchi);
  }
}

class Bañar {
  constructor(nombre, diversion, energia, limpieza) {
    this.nombre = nombre;
    this.diversion = diversion;
    this.energia = energia;
    this.limpieza = limpieza;
  }

  aplicar(tamagotchi) {
    tamagotchi.diversion += this.diversion;
    tamagotchi.energia += this.energia;
    tamagotchi.suciedad -= this.limpieza;
    tamagotchi.actualizarBarraProgreso();
  }
}

class TipoBaño {
  constructor(tamagotchi) {
    this.tamagotchi = tamagotchi;
  }

  shampoo() {
    showThoughtBubble("Me gusto el Shampoo");
    const shampoo = new Bañar("shampoo", 15, 10, 25);
    shampoo.aplicar(this.tamagotchi);
  }

  jabon() {
    showThoughtBubble("Me gusto el Jabón");
    const jabon = new Bañar("jabón", 10, 8, 20);
    jabon.aplicar(this.tamagotchi);
  }

  secado() {
    showThoughtBubble("Gracias por secarme");
    const secado = new Bañar("secado", 5, 5, 10);
    secado.aplicar(this.tamagotchi);
  }
}

class EstadoMascota {
  constructor(tamagotchi) {
    this.tamagotchi = tamagotchi;
  }
  setTamagotchi(tamagotchi) {
    this.tamagotchi = tamagotchi;
  }
  comer() {
    return true;
  }
  jugar() {}
  dormir() {}
  bañar() {}
  comoEstas() {}
}

class Hambriento extends EstadoMascota {
  comer() {
    showThoughtBubble("Gracias por la comida!");
    if (this.tamagotchi.suciedad >= 70) {
      showThoughtBubble("Pero aún me siento sucio...");
      this.tamagotchi.setState(new Sucia());
    } else {
      this.tamagotchi.setState(new Feliz());
    }
    return true;
  }
  jugar() {
    showThoughtBubble("No quiero jugar. Tengo hambre!");
  }
  dormir() {
    showThoughtBubble("No quiero dormir! Estoy demasiado hambriento.");
  }
  bañar() {
    showThoughtBubble("No quiero bañarme, ¡me voy a quedar cochino!");
  }
  comoEstas() {
    showThoughtBubble("¡Tengo mucha hambre!");
  }
}

class Cansada extends EstadoMascota {
  comer() {
    showThoughtBubble("No gracias, quiero dormir...");
    return false;
  }
  jugar() {
    showThoughtBubble("Tengo sueño, no puedo jugar.");
  }
  dormir() {
    showThoughtBubble("Buenas noches... zzz");
    this.tamagotchi.setState(new Durmiendo());
  }
  bañar() {
    showThoughtBubble("No quiero bañarme ahora...");
  }

  comoEstas() {
    showThoughtBubble("¡Estoy cansado!");
  }
}

class Durmiendo extends EstadoMascota {
  comer() {
    showThoughtBubble("Dormido, no puede comer.");
    return false;
  }
  jugar() {
    showThoughtBubble("Está dormido, no puede jugar.");
  }
  dormir() {
    showThoughtBubble("¡Ya está dormido!");
  }
  bañar() {
    showThoughtBubble("Está dormido, no se puede bañar.");
  }
  setTamagotchi(tamagotchi) {
    this.tamagotchi = tamagotchi;
    setTimeout(() => {
      showThoughtBubble("¡Despierta!");
      this.tamagotchi.setState(new Hambriento());
    }, 5000);
  }
  comoEstas() {
    showThoughtBubble("Está durmiendo...");
  }
}

class Feliz extends EstadoMascota {
  comer() {
    return true;
  }
  jugar() {
    this.tamagotchi.suciedad += 10;
    this.tamagotchi.actualizarBarraProgreso();
  }
  dormir() {}
  bañar() {
    this.tamagotchi.setState(new Vida());
  }
  comoEstas() {}
}

class Vida extends EstadoMascota {
  comer() {
    this.tamagotchi.setState(new Feliz());
    return true;
  }
  jugar() {
    this.tamagotchi.setState(new Sucia());
  }
  dormir() {
    showThoughtBubble("Sigamos jugando");
  }
  bañar() {
    showThoughtBubble("No gracias");
  }
  comoEstas() {
    showThoughtBubble("¡Estoy con vida!");
  }
}

class Sucia extends EstadoMascota {
  comer() {
    showThoughtBubble("Ugh... no tengo ganas de comer estando tan sucio.");
    return false;
  }
  jugar() {
    showThoughtBubble("No puedo jugar así de cochino...");
  }
  dormir() {
    showThoughtBubble("No me gusta dormir estando tan sucio...");
  }
  bañar() {
    showThoughtBubble("¡Al fin! ¡Qué alivio estar limpio otra vez!");
    if (this.tamagotchi.suciedad <= 30) {
      this.tamagotchi.setState(new Feliz());
    }
  }
  comoEstas() {
    showThoughtBubble("¡Estoy muy sucio! ¡Necesito un baño urgentemente!");
  }
}

// Inicializar el Tamagotchi cuando el DOM esté listo
let miTamagotchi;

// Limpiar intervalo al salir de la página
window.addEventListener("beforeunload", function () {
  if (window.tamagotchiInterval) {
    clearInterval(window.tamagotchiInterval);
  }
});

// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {
  // Inicializar el Tamagotchi
  miTamagotchi = new Tamagotchi();

  // Agregar event listeners para los botones de comida
  const krillBtn = document.getElementById("krill-btn");
  const pescadoBtn = document.getElementById("pescado-btn");
  const calamarBtn = document.getElementById("calamar-btn");

  if (krillBtn) {
    krillBtn.addEventListener("click", () => {
      miTamagotchi.tipoComida.comerKrill();
    });
  }

  if (pescadoBtn) {
    pescadoBtn.addEventListener("click", () => {
      miTamagotchi.tipoComida.comerPescado();
    });
  }

  if (calamarBtn) {
    calamarBtn.addEventListener("click", () => {
      miTamagotchi.tipoComida.comerCalamar();
    });
  }

  // Event listeners para otros botones
  const futbolBtn = document.getElementById("futbol-btn");
  const basketBtn = document.getElementById("basket-btn");
  const ajedrezBtn = document.getElementById("ajedrez-btn");
  const dormirBtn = document.getElementById("dormir-btn");
  const comoEstasBtn = document.getElementById("como-estas");
  const shampooBtn = document.getElementById("shampoo-btn");
  const jabonBtn = document.getElementById("jabon-btn");
  const secadoBtn = document.getElementById("secado-btn");

  if (futbolBtn) {
    futbolBtn.addEventListener("click", () => {
      miTamagotchi.tipoJuego.jugarFutbol();
    });
  }

  if (basketBtn) {
    basketBtn.addEventListener("click", () => {
      miTamagotchi.tipoJuego.jugarBasket();
    });
  }

  if (ajedrezBtn) {
    ajedrezBtn.addEventListener("click", () => {
      miTamagotchi.tipoJuego.jugarAjedrez();
    });
  }

  if (dormirBtn) {
    dormirBtn.addEventListener("click", () => {
      miTamagotchi.estado.dormir();
    });
  }

  if (comoEstasBtn) {
    comoEstasBtn.addEventListener("click", () => {
      miTamagotchi.estado.comoEstas();
    });
  }

  if (shampooBtn) {
    shampooBtn.addEventListener("click", () => {
      miTamagotchi.tipoBaño.shampoo();
    });
  }

  if (jabonBtn) {
    jabonBtn.addEventListener("click", () => {
      miTamagotchi.tipoBaño.jabon();
    });
  }

  if (secadoBtn) {
    secadoBtn.addEventListener("click", () => {
      miTamagotchi.tipoBaño.secado();
    });
  }
});
