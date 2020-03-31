import React, { Component } from 'react';
import VistaCurso from './VistaCurso';
import { crearEstudiante, crearCursoCon, Persona, Curso, entra, bajaLaMano, levantaLaMano } from '../model/curso';
import FormularioLogin from './FormularioLogin';
import { Usuario } from './types';

type Props = {}

type State = {
  usuarioActual: null | Usuario,
  curso: Curso,
}

export default class App extends Component<Props, State> {

  constructor(props: any) {
    super(props);

    const pepe = { ...crearEstudiante("Pepe Sánchez"), manoLevantada: true };
    const marta = crearEstudiante("Marta Gómez");
    const mirta = crearEstudiante("Mirta Pérez");
    const curso = crearCursoCon(mirta, pepe, marta);

    this.state = {
      usuarioActual: null,
      curso,
    }
  }

  render() {
    return (
      <div className="App">
        {
          this.state.usuarioActual ?
            <VistaCurso
              usuarioActual={ {...this.state.usuarioActual, manoLevantada: this.estudianteActual().manoLevantada } }
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

  estudianteActual() {
    const usuarioActual = this.state.usuarioActual;
    if (!usuarioActual) throw new Error();

    const estudianteActual = this.state.curso.personas.find(p => p.id === usuarioActual.idPersona);

    if (!estudianteActual) throw new Error();

    return estudianteActual;
  }

  async entrarComo(nombre: string) {
    const estudianteActual = crearEstudiante(nombre);
    const usuarioActual = { idPersona: estudianteActual.id, esAdmin: true };
    const curso = this.state.curso.cuando(entra(estudianteActual));
    this.setState({ usuarioActual, curso })
  }

  async bajarLaMano() {
    const curso = this.state.curso.cuando(bajaLaMano(this.estudianteActual()));
    this.setState({ curso })
  }

  async levantarLaMano() {
    const curso = this.state.curso.cuando(levantaLaMano(this.estudianteActual()));
    this.setState({ curso })
  }

  async bajarleLaManoA(unaPersona: Persona) {
    const curso = this.state.curso.cuando(bajaLaMano(unaPersona));
    this.setState({ curso })
  }
}