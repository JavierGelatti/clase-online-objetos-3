import React, { Component } from 'react';
import VistaCurso from './VistaCurso';
import FormularioLogin from './FormularioLogin';
import { CursoRemoto } from './CursoRemoto';

type Props = {
  docente: boolean,
}

type State = {
  cursoRemoto: CursoRemoto | null,
}

export default class App extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { cursoRemoto: null }
  }

  render() {
    const cursoRemoto = this.state.cursoRemoto;
    return (
      <div className="App">
        {
          cursoRemoto ?
            <VistaCurso
              usuarioActual={cursoRemoto.usuarioActual}
              curso={cursoRemoto.curso}
              onBajarMano={() => cursoRemoto.bajarLaMano()}
              onLevantarMano={() => cursoRemoto.levantarLaMano()}
              onBajarleLaManoA={persona => cursoRemoto.bajarleLaManoA(persona)}
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
}