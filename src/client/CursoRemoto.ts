import { crearEstudiante, Persona, Curso, entra, bajaLaMano, levantaLaMano, crearDocente, IdPersona, Evento, sale } from '../model/curso';
import { deserializarCurso, serializarEvento } from '../model/jsonCodecs';
import { v4 as generateUUID } from 'uuid';

type ObservadorCurso = (cursoRemoto: CursoRemoto) => void;

type Conexion = ConexionConElBackend;
class ConexionConElBackend {
    private readonly configuracion: {
        idConexion: string,
        onConnected: (conexion: Conexion) => void,
        onUpdate: (curso: Curso, conexion: Conexion) => void,
    };
    private _websocket: WebSocket | null;
    private eventosPendientesDeEnvio: Evento[];

    constructor(configuracion: object) {
        const configuracionPorDefecto = {
            idConexion: generateUUID(),
            onConnected: () => {},
            onUpdate: () => {},
        };
        this.configuracion = Object.assign(configuracionPorDefecto, configuracion);
        this._websocket = null;
        this.eventosPendientesDeEnvio = [];
    }

    iniciar() {
        this._websocket = this.crearWebsocket();
    }

    get idConexion() {
        return this.configuracion.idConexion;
    }

    get websocket(): WebSocket {
        if (!this._websocket) throw new Error('El websocket todavía no está inicializado');

        return this._websocket;
    }

    private crearWebsocket() {
        const websocket = new WebSocket(`ws://localhost:8080/ws/${this.idConexion}`);

        websocket.onopen = (evt) => {
            console.log('Websocket abierto!', evt);
            this.onConnected();
        };

        websocket.onmessage = (msg) => {
            console.log('Se recibió un mensaje:', msg);
            const cursoActual = deserializarCurso(msg.data);
            this.onUpdate(cursoActual);
        };

        websocket.onclose = (evt) => {
            console.log('Websocket cerrado.', evt);

            esperar(500).then(() => this.onReconnect(this.crearWebsocket()));
        };

        websocket.onerror = (evt) => console.error('Error en el websocket:', evt);

        return websocket;
    }

    private onReconnect(ws: WebSocket) {
        this._websocket = ws;

        while (this.eventosPendientesDeEnvio.length > 0) {
            this.enviarEvento(this.eventosPendientesDeEnvio.pop()!);
        }
    }

    private onUpdate(cursoActual: Curso) {
        this.configuracion.onUpdate(cursoActual, this);
    }

    private onConnected() {
        this.configuracion.onConnected(this);
    }

    disconnect() {
        this._websocket?.close();
    }

    async enviarEvento(evento: Evento) {
        if (this.websocket.readyState === WebSocket.CLOSED) {
            console.log("Se encoló un evento para ser enviado más tarde:", evento);
            this.eventosPendientesDeEnvio.push(evento);
        } else {
            console.log("Se envió un evento:", evento);
            this.websocket.send(serializarEvento(evento));
        }
    }
}

export class CursoRemoto {
  private readonly idUsuarioActual: IdPersona;
  private enviarEvento: (evento: Evento) => void;
  private _onChange: ObservadorCurso;
  curso: Curso;

  static conectarseComo(nombre: string, esDocente: boolean): Promise<CursoRemoto> {
    const usuarioActual = esDocente ? crearDocente(nombre) : crearEstudiante(nombre);
    let cursoRemoto: CursoRemoto | null = null;

    return new Promise(resolve => {
        new ConexionConElBackend({
            idConexion: usuarioActual.id,
            onConnected: (conexion: Conexion) => {
                conexion.enviarEvento(entra(usuarioActual));

                // Salir del curso si se cierra la ventana del navegador
                window.onbeforeunload = () => {
                    conexion.enviarEvento(sale(usuarioActual));
                    conexion.disconnect()
                };
            },
            onUpdate: (cursoActual: Curso, conexion: Conexion) => {
                if (!cursoActual.contieneA(usuarioActual)) {
                    conexion.enviarEvento(entra(usuarioActual));
                    return;
                }

                if (!cursoRemoto) {
                    cursoRemoto = new CursoRemoto(usuarioActual.id, cursoActual, evento => conexion.enviarEvento(evento));
                    resolve(cursoRemoto);
                }

                cursoRemoto.notificarCambio(cursoActual);
            },
        }).iniciar();
    });
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