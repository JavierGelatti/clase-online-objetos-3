import { v4 as generateUUID } from 'uuid';

export type IdPersona = string;

export type Persona = {
    readonly id: IdPersona;
    readonly nombre: string;
    readonly manoLevantada: boolean;
    readonly esDocente: boolean;
}

type EntraAlguien = {
    kind: "entra-alguien",
    persona: Persona,
}

type SaleAlguien = {
    kind: "sale-alguien",
    idPersona: IdPersona,
}

type AlguienLevantaLaMano = {
    kind: "levanta-la-mano",
    idPersona: IdPersona,
}

type AlguienBajaLaMano = {
    kind: "baja-la-mano",
    idPersona: IdPersona,
}

export type Evento = EntraAlguien | SaleAlguien | AlguienLevantaLaMano | AlguienBajaLaMano;

export class Curso {
    private _personas: Persona[];

    constructor(personasEnElCurso: Persona[] = []) {
        this._personas = personasEnElCurso;
    }

    cuando(...eventos: Evento[]): Curso {
        // eslint-disable-next-line array-callback-return
        return eventos.reduce((curso: Curso, evento: Evento) => {
            switch(evento.kind) {
                case "entra-alguien":
                    return curso.agregandoA(evento.persona);
                case "sale-alguien":
                    return curso.sin(evento.idPersona);
                case "levanta-la-mano":
                    const persona = curso.personaIdentificadaCon(evento.idPersona);
                    if (!persona) return this;

                    const elResto = curso.todosMenosPersonaConId(persona.id);
                    const [personasConLaManoLevantada, personasConLaManoBajada] = partition(elResto, p => p.manoLevantada);

                    return new Curso([...personasConLaManoLevantada, levantandoLaMano(persona), ...personasConLaManoBajada]);
                case "baja-la-mano":
                    return new Curso(curso._personas.map(p => p.id === evento.idPersona ? bajandoLaMano(p) : p))
            }
        }, this);
    }

    sin(idPersonaQueSale: IdPersona): Curso {
        return new Curso(this.todosMenosPersonaConId(idPersonaQueSale));
    }

    private todosMenosPersonaConId(idPersona: IdPersona) {
        return this._personas.filter(p => p.id !== idPersona);
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

    contieneA(unaPersona: Persona) {
        return !!this.personaIdentificadaCon(unaPersona.id)
    }

    personaIdentificadaCon(idPersona: IdPersona) {
        return this._personas.find(p => p.id === idPersona);
    }
}

export function crearCurso() {
    return crearCursoCon(...[]);
}

export function crearCursoCon(...personas : Persona[]) {
    return new Curso(personas);
}

export function crearDocente(nombre: string) : Persona {
    return {
        id: generateUUID(),
        nombre,
        manoLevantada: false,
        esDocente: true,
    }
}

export function crearEstudiante(nombre: string) : Persona {
    return {
        id: generateUUID(),
        nombre,
        manoLevantada: false,
        esDocente: false,
    }
}

export function entra(unaPersona: Persona): EntraAlguien {
    return {
        kind: "entra-alguien",
        persona: unaPersona,
    };
}

export function sale(unaPersona: Persona): SaleAlguien {
    return saleAlguienConId(unaPersona.id);
}

export function saleAlguienConId(idDePersona: IdPersona): SaleAlguien {
    return {
        kind: "sale-alguien",
        idPersona: idDePersona,
    };
}

export function levantaLaMano(unaPersona: Persona): AlguienLevantaLaMano {
    return {
        kind: "levanta-la-mano",
        idPersona: unaPersona.id,
    };
}

export function levantandoLaMano(unaPersona: Persona) {
    return { ...unaPersona, manoLevantada: true };
}

export function bajaLaMano(unaPersona: Persona): AlguienBajaLaMano {
    return {
        kind: "baja-la-mano",
        idPersona: unaPersona.id,
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
