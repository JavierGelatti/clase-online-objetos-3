
import React from 'react';
import { Header, Divider, List, Icon, Button, SemanticCOLORS, Segment } from 'semantic-ui-react';
import { Curso, Persona } from '../model/curso';

type Usuario = Persona & { esAdmin: boolean }

interface Props {
    usuarioActual: Usuario
    curso: Curso,
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

export default function VistaCurso({ usuarioActual, curso } : Props) {
    return (
        <Segment fluid>
            <Header as='h1' color='blue' dividing>
                Clase de Objetos 3
            </Header>

            <List className='lista-participantes' divided verticalAlign='middle' size='big' relaxed='very'>
                { curso.personas.map(persona => <ListItemPersona persona={persona} usuarioActual={usuarioActual} />) }
            </List>

            <Divider />

            { usuarioActual.manoLevantada ? <BotonBajarLaMano /> : <BotonLevantarLaMano/> }
        </Segment>
    );
}

function ListItemPersona({ usuarioActual, persona } : { usuarioActual: Usuario, persona: Persona }) {
    const esElUsuarioActual = (persona.id === usuarioActual.id);

    return (
        <List.Item>
            { usuarioActual.esAdmin && <BotonesAdmin persona={persona} /> }

            <Icon
                name={ persona.manoLevantada ? 'hand paper' : 'user circle'}
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

function idToColor(uuid: string) {
    const primeraParteUuid = parseInt(uuid.split('-')[0], 16);

    return colores[primeraParteUuid % colores.length];
}

function IndicadorVos() {
    return (
        <div className="indicador-vos">vos <Icon name="arrow right" /></div>
    );
}

function BotonesAdmin({ persona }: { persona: Persona }) {
    if (!persona.manoLevantada) return (<></>);

    return (
        <List.Content floated='right'>
            <Button labelPosition='right' icon>
                <Icon name='hand rock' />
                Listo
            </Button>
        </List.Content>
    );
}

function BotonBajarLaMano() {
    return (
        <Button labelPosition='left' color='red' icon fluid size='huge'>
            <Icon name='hand rock' size='large' />
            Bajar la mano
        </Button>
    );
}

function BotonLevantarLaMano() {
    return (
        <Button labelPosition='left' color='blue' icon fluid size='huge'>
            <Icon name='hand paper' size='large' />
            Levantar la mano
        </Button>
    );
}
