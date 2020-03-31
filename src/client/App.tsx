import React, { Component } from 'react';
import VistaCurso from './VistaCurso';
import { crearEstudiante, Persona, Curso, entra, bajaLaMano, levantaLaMano, crearDocente, IdPersona, Evento, sale } from '../model/curso';
import FormularioLogin from './FormularioLogin';
import { deserializarCurso, serializarEvento } from '../model/jsonCodecs';

type Props = {
  docente: boolean,
}

type State = {
  cursoRemoto: CursoRemoto | null,
}

type ObservadorCurso = (cursoRemoto: CursoRemoto) => void;

class CursoRemoto {
  idUsuarioActual: IdPersona;
  curso: Curso;
  enviarEvento: (evento: Evento) => Promise<Curso>;

  static conectarseComo(nombre: string, esDocente: boolean, onChange: ObservadorCurso) {
    return new Promise(resolve => {
      const usuarioActual = esDocente ? crearDocente(nombre) : crearEstudiante(nombre);

      const requestsAResolver: ((curso: Curso) => void)[] = [];
      const websocket = new WebSocket('ws://localhost:8080');
      let cursoRemoto: CursoRemoto | null = null;

      websocket.onopen = (evt) => {
        console.log('open', evt);
        window.addEventListener("beforeunload", () => {
          enviarEvento(sale(usuarioActual));
          websocket.close()
        }, false);
        enviarEvento(entra(usuarioActual));
      };
      websocket.onmessage = (msg) => {
        console.log('message', msg);
        const curso = deserializarCurso(msg.data);
        console.log(curso);

        // Qué pasa si el usuario actual no está en el curso?
        // curso.personas.find(p => p.id === idUsuarioActual) || null;
        if (!cursoRemoto) {
          cursoRemoto = new CursoRemoto(usuarioActual.id, curso, enviarEvento);
          resolve(cursoRemoto);
        } else {
          cursoRemoto.curso = curso;
        }
        onChange(cursoRemoto);

        requestsAResolver.forEach(resolve => resolve(curso));
      };
      websocket.onclose = (evt) => {
        console.log('close', evt);
        // Reconectar?
      };
      websocket.onerror = (evt) => console.log('error', evt);

      async function enviarEvento(evento: Evento) {
        websocket.send(serializarEvento(evento));

        return new Promise<Curso>(resolve => {
          requestsAResolver.push(resolve);
        });
      }
    });
  }

  constructor(idUsuarioActual: IdPersona, curso: Curso, enviarEvento: (evento: Evento) => Promise<Curso>) {
    this.curso = curso;
    this.idUsuarioActual = idUsuarioActual;
    this.enviarEvento = enviarEvento;
  }

  get usuarioActual() {
    const usuarioActual = this.curso.personas.find(p => p.id === this.idUsuarioActual);

    if (!usuarioActual) throw new Error("El usuario actual no está en el curso");

    return usuarioActual;
  }

  levantarLaMano() {
    return this.enviarEvento(levantaLaMano(this.usuarioActual));
  }

  bajarLaMano() {
    return this.enviarEvento(bajaLaMano(this.usuarioActual));
  }

  bajarleLaManoA(unaPersona: Persona) {
    return this.enviarEvento(bajaLaMano(unaPersona));
  }
}

export default class App extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { cursoRemoto: null }
  }

  render() {
    const cursoRemoto = this.cursoRemoto;
    return (
      <div className="App">
        {
          cursoRemoto ?
            <VistaCurso
              usuarioActual={cursoRemoto.usuarioActual}
              curso={cursoRemoto.curso}
              onBajarMano={() => this.bajarLaMano()}
              onLevantarMano={() => this.levantarLaMano()}
              onBajarleLaManoA={persona => this.bajarleLaManoA(persona)}
            />
            :
            <FormularioLogin onLogin={nombre => this.entrarComo(nombre)} />
        }
      </div>
    );
  }

  async entrarComo(nombre: string) {
    return CursoRemoto.conectarseComo(nombre, this.props.docente, cursoRemoto => this.setState({ cursoRemoto }));
  }

  async bajarLaMano() {
    return this.cursoRemoto?.bajarLaMano();
  }

  async levantarLaMano() {
    return this.cursoRemoto?.levantarLaMano();
  }

  async bajarleLaManoA(unaPersona: Persona) {
    return this.cursoRemoto?.bajarleLaManoA(unaPersona);
  }

  get cursoRemoto() {
    return this.state.cursoRemoto;
  }
}