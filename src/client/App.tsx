import React, { Component } from 'react';
import VistaCurso from './VistaCurso';
import FormularioLogin from './FormularioLogin';
import { CursoRemoto } from './CursoRemoto';
import { Persona, Curso } from '../model/curso';

type Props = {
  esDocente: boolean,
}

type State = {
  usuarioActual: Persona | null,
  curso: Curso | null,
}

export default class App extends Component<Props, State> {
  cosasCargando: (() => void)[];
  cursoRemoto: CursoRemoto | null;

  constructor(props: Props) {
    super(props);
    this.state = {
      usuarioActual: null,
      curso: null,
    }
    this.cosasCargando = [];
    this.cursoRemoto = null;
  }

  render() {
    const { usuarioActual, curso } = this.state;
    return (
      <div className="App">
        {
          usuarioActual && curso ?
            <VistaCurso
              usuarioActual={usuarioActual}
              curso={curso}
              onBajarMano={() => this.bajarLaMano()}
              onLevantarMano={() => this.levantarLaMano()}
              onBajarleLaManoA={persona => this.bajarleLaManoA(persona)}
            />
            :
            <FormularioLogin
              onLogin={nombre => this.entrarComo(nombre)}
              comoDocente={ this.props.esDocente }
            />
        }
      </div>
    );
  }

  bajarLaMano() {
    return this.esperandoUnCambio(() => {
      this.cursoRemoto?.bajarLaMano();
    });
  }

  levantarLaMano() {
    return this.esperandoUnCambio(() => {
      this.cursoRemoto?.levantarLaMano();
    });
  }

  bajarleLaManoA(persona: Persona) {
    return this.esperandoUnCambio(() => {
      this.cursoRemoto?.bajarleLaManoA(persona);
    });
  }

  esperandoUnCambio(hacerAlgo: () => void) {
    return new Promise(resolve => {
      hacerAlgo();
      this.cosasCargando.push(resolve);
    });
  }

  huboUnCambio(usuarioActual: Persona, curso: Curso) {
    this.setState({ usuarioActual, curso });
    this.cosasCargando.forEach(resolve => resolve());
    this.cosasCargando = [];
  }

  async entrarComo(nombre: string) {
    const cursoRemoto = await CursoRemoto.conectarseComo(nombre, this.props.esDocente);
    this.cursoRemoto = cursoRemoto;
    this.cursoRemoto.onChange = this.huboUnCambio.bind(this);
  }
}