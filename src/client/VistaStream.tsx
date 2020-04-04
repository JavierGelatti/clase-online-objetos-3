import { v4 as generateUUID } from 'uuid';
import React, { Component } from 'react';
import { SincronizadorCurso } from './conexion/SincronizadorCurso';
import { Icon } from 'semantic-ui-react';

type Props = {};

type State = {
    cantidadManosLevantadas: number
};

export default class VistaStream extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            cantidadManosLevantadas: 0,
        }
    }

    componentDidMount() {
        new SincronizadorCurso({
            idConexion: generateUUID(),
            onUpdate: cursoActual => {
                this.setState({ cantidadManosLevantadas: cursoActual.cantidadDeManosLevantadas() })
            },
        }).iniciar();
    }

    render() {
        return (
            <div className={`indicador-manos-stream ${this.hayManosLevantadas() ? "activo" : "inactivo"}`}>
                <Icon
                    name='hand paper'
                    color='orange'
                />
                {
                    this.hayMuchasManosLevantadas() &&
                        this.state.cantidadManosLevantadas
                }
            </div>
        )
    }

    hayManosLevantadas() {
        return this.state.cantidadManosLevantadas > 0;
    }

    hayMuchasManosLevantadas() {
        return this.state.cantidadManosLevantadas > 1;
    }
}