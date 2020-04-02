
import React, { Component } from 'react';
import { Header, Divider, List, Icon, Button, SemanticCOLORS, Segment } from 'semantic-ui-react';
import { Curso, Persona } from '../model/curso';

type Props = {
    usuarioActual: Persona,
    curso: Curso,
    onLevantarMano: () => Promise<any>,
    onBajarMano: () => Promise<any>,
    onBajarleLaManoA: (persona: Persona) => Promise<any>,
}

type State = {
    cargandoBotonPrincipal: boolean;
    cargandoBotonDePersonas: Persona[];
}

export default class VistaCurso extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            cargandoBotonPrincipal: false,
            cargandoBotonDePersonas: [],
        }
    }

    render() {
        const { usuarioActual, curso } = this.props;
        const { cargandoBotonPrincipal, cargandoBotonDePersonas } = this.state;
        const onLevantarMano = () => this.onLevantarMano();
        const onBajarMano = () => this.onBajarMano();
        const onBajarleLaManoA = (unaPersona: Persona) => this.onBajarleLaManoA(unaPersona);

        return (
            <Segment>
                <Header as='h1' color='blue' dividing>
                    Clase de Objetos 3
                </Header>

                <List className='lista-participantes' divided verticalAlign='middle' size='big' relaxed='very'>
                    { curso.personas.map(persona => <ListItemPersona key={persona.id} persona={persona} usuarioActual={usuarioActual} />) }
                </List>

                <Divider />

                { usuarioActual.manoLevantada ? <BotonBajarLaMano /> : <BotonLevantarLaMano /> }
            </Segment>
        );

        function ListItemPersona({ usuarioActual, persona } : { usuarioActual: Persona, persona: Persona }) {
            const esElUsuarioActual = (persona.id === usuarioActual.id);

            return (
                <List.Item>
                    { usuarioActual.esDocente && <BotonesAdmin persona={persona} /> }

                    <Icon
                        name={ persona.manoLevantada ? 'hand paper' : (persona.esDocente ? 'graduation' : 'user circle')}
                        size='big'
                        color={ persona.manoLevantada ? 'orange' : idToColor(persona.id) }
                    >
                        { esElUsuarioActual && <IndicadorVos/> }
                    </Icon>

                    <List.Content>
                        <List.Header>{ persona.nombre }</List.Header>
                    </List.Content>
                </List.Item>
            );
        }

        function IndicadorVos() {
            return (
                <div className="indicador-vos">vos <Icon name="arrow right" /></div>
            );
        }

        function BotonesAdmin({ persona }: { persona: Persona }) {
            if (!persona.manoLevantada) return (<></>);

            const cargando = !!cargandoBotonDePersonas.find(p => p === persona);
            return (
                <List.Content floated='right'>
                    <Button
                        onClick={ () => onBajarleLaManoA(persona) }
                        loading={ cargando }
                        disabled={ cargando }
                        labelPosition='right'
                        icon
                    >
                        <Icon name='hand rock' />
                        Listo
                    </Button>
                </List.Content>
            );
        }

        function BotonBajarLaMano() {
            return (
                <Button
                    onClick={ onBajarMano }
                    loading={ cargandoBotonPrincipal }
                    disabled={ cargandoBotonPrincipal }
                    labelPosition='left'
                    color='red'
                    size='huge'
                    icon fluid
                >
                    <Icon name='hand rock' size='large' />
                    Bajar la mano
                </Button>
            );
        }

        function BotonLevantarLaMano() {
            return (
                <Button
                    onClick={ onLevantarMano }
                    loading={ cargandoBotonPrincipal }
                    disabled={ cargandoBotonPrincipal }
                    labelPosition='left'
                    color='blue'
                    size='huge'
                    icon fluid
                >
                    <Icon name='hand paper' size='large' />
                    Levantar la mano
                </Button>
            );
        }
    }

    onBajarleLaManoA(unaPersona: Persona) {
        this.setState({ cargandoBotonDePersonas: [ ...this.state.cargandoBotonDePersonas, unaPersona ] }, () => {
            this.props.onBajarleLaManoA(unaPersona)
                .catch(error => {
                    console.error("Hubo un error:", error);
                })
                .finally(() => {
                    this.setState({ cargandoBotonDePersonas: this.state.cargandoBotonDePersonas.filter(p => p !== unaPersona) });
                })
        });
    }

    onBajarMano() {
        this.setState({ cargandoBotonPrincipal: true }, () => {
            this.props.onBajarMano()
                .catch(error => {
                    console.error("Hubo un error:", error);
                })
                .finally(() => {
                    this.setState({ cargandoBotonPrincipal: false });
                })
        });
    }

    onLevantarMano() {
        this.setState({ cargandoBotonPrincipal: true }, () => {
            this.props.onLevantarMano()
                .catch(error => {
                    console.error("Hubo un error:", error);
                })
                .finally(() => {
                    this.setState({ cargandoBotonPrincipal: false });
                })
        });
    }
}

const colores: SemanticCOLORS[] = [
    'red',
    'orange',
    'yellow',
    'green',
    'teal',
    'violet',
    'purple',
    'pink',
    'brown',
    'grey',
    'black',
]

function idToColor(uuid: string) {
    const primeraParteUuid = parseInt(uuid.split('-')[0], 16);

    return colores[primeraParteUuid % colores.length];
}
