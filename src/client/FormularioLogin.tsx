import React, { Component } from 'react';
import { Input, Form, Button, Icon, Segment } from 'semantic-ui-react'

type Props = {
  onLogin: (nombre: string) => Promise<any>,
  comoDocente: boolean,
}

type State = {
  nombreIngresado: string,
  cargando: boolean,
  error: boolean,
}

export default class FormularioLogin extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      nombreIngresado: "",
      cargando: false,
      error: false,
    };
  }

  render() {
    return (
      <Segment loading={ this.state.cargando }>
        {
          this.state.error &&
            (<Segment inverted color='red' secondary>Ha ocurrido un error :(</Segment>)
        }

        <Form className="formulario-login">

          <Form.Field>
            <Input
              icon='address card'
              iconPosition='left'
              placeholder='Nombre'
              disabled={ this.state.cargando }
              onChange={e => this.setState({ nombreIngresado: e.target.value.trim() })}
            />
          </Form.Field>

          <Button
            type='submit'
            labelPosition='right'
            disabled={ !this.hasValidName() || this.state.cargando }
            onClick={() => this.enviar()}
            primary fluid icon
          >
            { this.props.comoDocente ? "Entrar como docente" : "Entrar" }
            <Icon name='sign in' />
          </Button>
        </Form>
      </Segment>
    );
  }

  enviar() {
    this.setState({ cargando: true, error: false }, () => {
      this.props.onLogin(this.state.nombreIngresado)
        .catch(error => {
          console.error("El error que te salió fue causado por:", error);
          this.setState({ error: true, cargando: false });
        });
    });
  }

  hasValidName() {
    return this.state.nombreIngresado.length !== 0;
  }
}
