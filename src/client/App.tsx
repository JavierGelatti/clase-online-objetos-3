import React, { Component } from 'react';
import VistaCurso from './VistaCurso';
import FormularioLogin from './FormularioLogin';
import { Persona, Curso } from '../model/curso';
import { ClaseRemota } from './conexion/ClaseRemota';

type Props = {
  esDocente: boolean,
}

type State = {
  usuarioActual: Persona | null,
  curso: Curso | null,
}

export default class App extends Component<Props, State> {
  claseRemota: ClaseRemota | null;

  constructor(props: Props) {
    super(props);
    this.state = {
      usuarioActual: null,
      curso: null,
    }
    this.claseRemota = null;
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
              onBajarMano={() => this.claseRemota!.bajarLaMano()}
              onLevantarMano={() => this.claseRemota!.levantarLaMano()}
              onBajarleLaManoA={persona => this.claseRemota!.bajarleLaManoA(persona)}
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

  huboUnCambio(usuarioActual: Persona, curso: Curso) {
    this.setState({ usuarioActual, curso });
  }

  async entrarComo(nombre: string) {
    const claseRemota = await ClaseRemota.conectarseComo(nombre, this.props.esDocente);
    this.claseRemota = claseRemota;
    this.claseRemota.onChange = this.huboUnCambio.bind(this);
  }
}