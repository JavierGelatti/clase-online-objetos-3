import { Curso } from "../../model/curso";
import { deserializarCurso } from "../../model/jsonCodecs";
import { esperar } from "../utils";

type Configuracion = {
    idConexion: string,
    onUpdate: (curso: Curso) => void,
};

export class SincronizadorCurso {
    private readonly configuracion: Configuracion;
    private _websocket: WebSocket | null;

    constructor(configuracion: Configuracion) {
        this.configuracion = configuracion;
        this._websocket = null;
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
        const websocket = new WebSocket(`ws://${window.location.host}/${this.idConexion}`);

        websocket.onopen = (evt) => {
            console.log('Websocket abierto!', evt);
        };

        websocket.onmessage = (msg) => {
            console.log('Se recibió un mensaje:', msg);
            const cursoActual = deserializarCurso(msg.data);
            this.onUpdate(cursoActual);
        };

        websocket.onclose = (evt) => {
            console.log('Websocket cerrado.', evt);

            esperar(500).then(() => this.reconectar());
        };

        websocket.onerror = (evt) => console.error('Error en el websocket:', evt);

        return websocket;
    }

    private reconectar() {
        this.iniciar();
    }

    private onUpdate(cursoActual: Curso) {
        this.configuracion.onUpdate(cursoActual);
    }

    desconectar() {
        this._websocket?.close();
    }
}
