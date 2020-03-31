import React from 'react';
import { Input, Form, Button, Icon } from 'semantic-ui-react'

export default function FormularioLogin() {
  return (
    <Form className="formulario-login">
      <Form.Field>
        <Input icon='address card' iconPosition='left' placeholder='Nombre' />
      </Form.Field>
      <Button type='submit' labelPosition='right' primary fluid icon>
        Entrar
        <Icon name='arrow right' />
      </Button>
    </Form>
  );
}
