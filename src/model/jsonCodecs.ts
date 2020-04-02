
import {Decoder, object, string, boolean, oneOf, constant, array} from '@mojotech/json-type-validation'
import { Persona, Evento, Curso } from './curso';

const decoderPersona: Decoder<Persona> = object({
  id: string(),
  nombre: string(),
  manoLevantada: boolean(),
  esDocente: boolean(),
});

const decoderEntra: Decoder<Evento> = object({
  kind: constant('entra-alguien'),
  persona: decoderPersona,
});

const decoderSale: Decoder<Evento> = object({
  kind: constant('sale-alguien'),
  idPersona: string(),
});

const decoderLevantaMano: Decoder<Evento> = object({
  kind: constant('levanta-la-mano'),
  idPersona: string(),
});

const decoderBajaMano: Decoder<Evento> = object({
  kind: constant('baja-la-mano'),
  idPersona: string(),
});

const decoderEvento: Decoder<Evento> = oneOf(decoderEntra, decoderSale, decoderLevantaMano, decoderBajaMano);

export function serializarEvento(evento: Evento) {
    return JSON.stringify(evento);
}

export function deserializarEvento(json: string): Evento {
    return decoderEvento.runWithException(JSON.parse(json));
}

export function serializarCurso(curso: Curso) {
    return JSON.stringify({ timestamp: curso.timestamp, personas: curso.personas });
}

export function deserializarCurso(json: string): Curso {
    const datos = JSON.parse(json);
    const timestamp = new Date(datos.timestamp);
    const personas = array(decoderPersona).runWithException(datos.personas);
    return new Curso(personas, timestamp);
}