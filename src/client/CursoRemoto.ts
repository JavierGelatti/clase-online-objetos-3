import { crearEstudiante, Persona, Curso, entra, bajaLaMano, levantaLaMano, crearDocente, IdPersona, Evento, sale } from '../model/curso';
import { deserializarCurso, serializarEvento } from '../model/jsonCodecs';

type ObservadorCurso = (cursoRemoto: CursoRemoto) => void;

class ConexionConElBackend {
    private _websocket: WebSocket | null;
    private cursoRemoto: CursoRemoto | null;
    private cuandoSeCreeUnCursoRemoto: ((cr: CursoRemoto) => void);
    private eventosPendientesDeEnvio: Evento[];
    private readonly usuarioActual: Persona;

    constructor(nombre: string, esDocente: boolean) {
        this.usuarioActual = esDocente ? crearDocente(nombre) : crearEstudiante(nombre);
        this.cursoRemoto = null;
        this.eventosPendientesDeEnvio = [];
        this.cuandoSeCreeUnCursoRemoto = _ => {};
        this._websocket = null;
    }

    iniciar(): Promise<CursoRemoto> {
        return new Promise(resolve => {
            debugger;
            this.conectarseAWebSocket();
            this.cuandoSeCreeUnCursoRemoto = resolve;
        });
    }

    private async conectarseAWebSocket() {
        this._websocket = this.crearWebsocket();

        while (this.eventosPendientesDeEnvio.length > 0) {
            this.enviarEvento(this.eventosPendientesDeEnvio.pop()!);
        }
    }

    private crearWebsocket() {
        const websocket = new WebSocket(`ws://localhost:8080/ws/${this.usuarioActual.id}`);

        websocket.onopen = (evt) => {
            console.log('Websocket abierto!', evt);

            // Salir del curso si se cierra la ventana del navegador
            window.onbeforeunload = () => {
                this.enviarEvento(sale(this.usuarioActual));
                websocket.close()
            };

            this.enviarEvento(entra(this.usuarioActual));
        };

        websocket.onmessage = (msg) => {
            console.log('Se recibió un mensaje:', msg);
            const cursoActual = deserializarCurso(msg.data);
            this.actualizarCursoCon(cursoActual);
        };

        websocket.onclose = (evt) => {
            console.log('Websocket cerrado.', evt);

            esperar(500).then(() => this.conectarseAWebSocket());
        };

        websocket.onerror = (evt) => console.error('Error en el websocket:', evt);

        return websocket;
    }

    private actualizarCursoCon(cursoActual: Curso) {
        if (!cursoActual.contieneA(this.usuarioActual)) {
            this.enviarEvento(entra(this.usuarioActual));
            return;
        }

        if (!this.cursoRemoto) {
            this.cursoRemoto = this.crearCursoRemoto(cursoActual);
        }

        this.cursoRemoto.notificarCambio(cursoActual);
    }

    private crearCursoRemoto(curso: Curso) {
        const cursoRemoto = new CursoRemoto(this.usuarioActual.id, curso, evento => this.enviarEvento(evento));
        this.cuandoSeCreeUnCursoRemoto(cursoRemoto);
        return cursoRemoto;
    }

    private async enviarEvento(evento: Evento) {
        if (this.websocket.readyState === WebSocket.CLOSED) {
            this.eventosPendientesDeEnvio.push(evento);
        } else {
            console.log("Se envió un evento:", evento);
            this.websocket.send(serializarEvento(evento));
        }
    }

    private get websocket(): WebSocket {
        if (!this._websocket) throw new Error('El websocket todavía no está inicializado');

        return this._websocket;
    }
}

export class CursoRemoto {
  private readonly idUsuarioActual: IdPersona;
  private enviarEvento: (evento: Evento) => void;
  private _onChange: ObservadorCurso;
  curso: Curso;

  static conectarseComo(nombre: string, esDocente: boolean) {
    return new ConexionConElBackend(nombre, esDocente).iniciar();
  }

  constructor(idUsuarioActual: IdPersona, curso: Curso, enviarEvento: (evento: Evento) => void) {
    this.curso = curso;
    this.idUsuarioActual = idUsuarioActual;
    this.enviarEvento = enviarEvento;
    this._onChange = curso => {};
  }

  notificarCambio(curso: Curso) {
    this.curso = curso;
    this._onChange(this);
  }

  get usuarioActual() {
    const usuarioActual = this.curso.personaIdentificadaCon(this.idUsuarioActual);

    if (!usuarioActual) throw new Error("El usuario actual no está en el curso");

    return usuarioActual;
  }

  set onChange(callback: ObservadorCurso) {
    this._onChange = callback;
    this._onChange(this);
  }

  levantarLaMano() {
    this.enviarEvento(levantaLaMano(this.usuarioActual));
  }

  bajarLaMano() {
    this.enviarEvento(bajaLaMano(this.usuarioActual));
  }

  bajarleLaManoA(unaPersona: Persona) {
    this.enviarEvento(bajaLaMano(unaPersona));
  }
}

function esperar(milisegundos: number) {
    return new Promise(resolve => setTimeout(resolve, milisegundos));
}