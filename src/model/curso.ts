import { v4 as generateUUID } from 'uuid';

type Persona = {
    readonly id: IdPersona;
    readonly nombre: string;
    readonly manoLevantada: boolean;
}

type IdPersona = string;

type EntraAlguien = {
    kind: "entra-alguien",
    personaQueEntra: Persona,
}

type SaleAlguien = {
    kind: "sale-alguien",
    idPersonaQueSale: IdPersona,
}

type AlguienLevantaLaMano = {
    kind: "levanta-la-mano",
    idPersonaQueLevantaLaMano: IdPersona,
}

type AlguienBajaLaMano = {
    kind: "baja-la-mano",
    idPersonaQueBajaLaMano: IdPersona,
}

type Evento = EntraAlguien | SaleAlguien | AlguienLevantaLaMano | AlguienBajaLaMano;

class Curso {
    private _personas: Persona[];

    constructor(personasEnElCurso: Persona[] = []) {
        this._personas = personasEnElCurso;
    }

    cuando(...eventos: Evento[]): Curso {
        return eventos.reduce((curso: Curso, evento: Evento) => {
            switch(evento.kind) {
                case "entra-alguien":
                    return curso.agregandoA(evento.personaQueEntra);
                case "sale-alguien":
                    return curso.sin(evento.idPersonaQueSale);
                case "levanta-la-mano":
                    return new Curso(curso._personas.map(p => p.id === evento.idPersonaQueLevantaLaMano ? levantandoLaMano(p) : p))
                case "baja-la-mano":
                    return new Curso(curso._personas.map(p => p.id === evento.idPersonaQueBajaLaMano ? bajandoLaMano(p) : p))
            }
        }, this);
    }

    sin(idPersonaQueSale: IdPersona): Curso {
        return new Curso(this._personas.filter(p => p.id !== idPersonaQueSale))
    }

    agregandoA(personaQueEntra: Persona): Curso {
        if (this._personas.find(p => p.id === personaQueEntra.id)) {
            return this;
        } else {
            return new Curso([...this._personas, personaQueEntra]);
        }
    }

    get personas() {
        const [personasConLaManoLevantada, personasConLaManoBajada] = partition(this._personas, p => p.manoLevantada);
        return [...personasConLaManoLevantada, ...personasConLaManoBajada];
    }
}

export function crearCurso() {
    return crearCursoCon(...[]);
}

export function crearCursoCon(...personas : Persona[]) {
    return new Curso(personas);
}

export function crearEstudiante(nombre: string) : Persona {
    return {
        id: generateUUID(),
        nombre,
        manoLevantada: false
    }
}

export function entra(unaPersona: Persona): EntraAlguien {
    return {
        kind: "entra-alguien",
        personaQueEntra: unaPersona,
    };
}

export function sale(unaPersona: Persona): SaleAlguien {
    return {
        kind: "sale-alguien",
        idPersonaQueSale: unaPersona.id,
    };
}

export function levantaLaMano(unaPersona: Persona): AlguienLevantaLaMano {
    return {
        kind: "levanta-la-mano",
        idPersonaQueLevantaLaMano: unaPersona.id,
    };
}

export function levantandoLaMano(unaPersona: Persona) {
    return { ...unaPersona, manoLevantada: true };
}

export function bajaLaMano(unaPersona: Persona): AlguienBajaLaMano {
    return {
        kind: "baja-la-mano",
        idPersonaQueBajaLaMano: unaPersona.id,
    };
}

export function bajandoLaMano(unaPersona: Persona) {
    return { ...unaPersona, manoLevantada: false };
}

function partition<T>(array: T[], criterio: (elemento: T) => boolean) {
	return [
		array.filter(elemento =>  criterio(elemento)),
        array.filter(elemento => !criterio(elemento)),
	];
};
