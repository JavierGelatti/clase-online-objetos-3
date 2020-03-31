import React, { Component } from 'react';
import VistaCurso from './VistaCurso';
import { crearEstudiante, crearCursoCon, Persona, Curso, entra, bajaLaMano, levantaLaMano, crearDocente, IdPersona } from '../model/curso';
import FormularioLogin from './FormularioLogin';

type Props = {
  docente: boolean,
}

type State = {
  idUsuarioActual: null | IdPersona,
  curso: Curso,
}

export default class App extends Component<Props, State> {

  constructor(props: Props) {
    super(props);

    const pepe = { ...crearEstudiante("Pepe Sánchez"), manoLevantada: true };
    const marta = crearEstudiante("Marta Gómez");
    const mirta = crearEstudiante("Mirta Pérez");
    const curso = crearCursoCon(mirta, pepe, marta);

    this.state = {
      idUsuarioActual: null,
      curso,
    }
  }

  render() {
    const usuarioActual = this.usuarioActual();
    return (
      <div className="App">
        {
          usuarioActual ?
            <VistaCurso
              usuarioActual={ usuarioActual }
              curso={ this.state.curso }
              onBajarMano={ () => this.bajarLaMano() }
              onLevantarMano={ () => this.levantarLaMano() }
              onBajarleLaManoA={ persona => this.bajarleLaManoA(persona) }
            />
            :
            <FormularioLogin onLogin={ nombre => this.entrarComo(nombre) } />
        }
      </div>
    );
  }

  usuarioActual() {
    const idUsuarioActual = this.state.idUsuarioActual;
    if (!idUsuarioActual) return null;

    const usuarioActual = this.state.curso.personas.find(p => p.id === idUsuarioActual);

    if (!usuarioActual) throw new Error();

    return usuarioActual;
  }

  async entrarComo(nombre: string) {
    const usuarioActual = this.props.docente ? crearDocente(nombre) : crearEstudiante(nombre);
    const curso = this.state.curso.cuando(entra(usuarioActual));
    this.setState({ idUsuarioActual: usuarioActual.id, curso })
  }

  async bajarLaMano() {
    const usuarioActual = this.usuarioActual();
    if (!usuarioActual) throw new Error();

    const curso = this.state.curso.cuando(bajaLaMano(usuarioActual));
    this.setState({ curso })
  }

  async levantarLaMano() {
    const usuarioActual = this.usuarioActual();
    if (!usuarioActual) throw new Error();

    const curso = this.state.curso.cuando(levantaLaMano(usuarioActual));
    this.setState({ curso })
  }

  async bajarleLaManoA(unaPersona: Persona) {
    const curso = this.state.curso.cuando(bajaLaMano(unaPersona));
    this.setState({ curso })
  }
}