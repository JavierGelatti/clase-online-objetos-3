import { levantaLaMano, crearEstudiante, crearCurso, entra, levantandoLaMano, bajandoLaMano, crearCursoCon, sale, bajaLaMano, crearCursoConTimestamp } from "./curso";

describe('orden de los estudiantes en un curso', () => {
    test('primero los estudiantes que levantaron la mano en el orden en el que lo hicieron, y luego el resto en el orden de entrada', () => {
        const pepe = crearEstudiante("Pepe");
        const marta = crearEstudiante("Marta");
        const pablo = crearEstudiante("Pablo");
        const mirta = crearEstudiante("Mirta");
        const curso = crearCurso();

        const cursoFinal = curso.cuando(
            entra(pepe),
            entra(marta),
            entra(pablo),
            entra(mirta),
            levantaLaMano(mirta),
            levantaLaMano(marta),
        );

        expect(cursoFinal.personas).toEqual([
            levantandoLaMano(mirta), levantandoLaMano(marta), bajandoLaMano(pepe), bajandoLaMano(pablo)
        ]);
    });
});

describe('eventos que suceden en un curso', () => {
    describe('entrar al curso', () => {
        test('entra alguien', () => {
            const cursoVacio = crearCurso();
            const alguien = crearEstudiante("Pepe");

            const cursoConUnaPersona = cursoVacio.cuando(entra(alguien));

            expect(cursoConUnaPersona.personas).toEqual([alguien])
        });

        test('entra alguien que ya estaba', () => {
            const cursoVacio = crearCurso();
            const alguien = crearEstudiante("Pepe");
            const cursoConUnaPersona = cursoVacio.cuando(entra(alguien));

            expect(cursoConUnaPersona.cuando(entra(alguien))).toEqual(cursoConUnaPersona);
        });

        test('entra una persona que se llama igual que alguien que ya estaba', () => {
            const alguienQueYaEstaba = crearEstudiante("Pepe");
            const cursoConAlguien = crearCursoCon(alguienQueYaEstaba);
            const otraPersona = crearEstudiante("Pepe");

            const cursoConDosPersonas = cursoConAlguien.cuando(entra(otraPersona));

            expect(cursoConDosPersonas.personas).toEqual([alguienQueYaEstaba, otraPersona])
        });
    });

    describe('salir del curso', () => {
        test('sale alguien', () => {
            const alguien = crearEstudiante("Pepe");
            const cursoConAlguien = crearCursoCon(alguien);

            const cursoVacio = cursoConAlguien.cuando(sale(alguien));

            expect(cursoVacio.personas).toEqual([]);
        });

        test('sale alguien que no estaba', () => {
            const alguien = crearEstudiante("Pepe");
            const cursoVacio = crearCurso();

            expect(cursoVacio.cuando(sale(alguien))).toEqual(cursoVacio);
        });

        test('sale alguien que se llama igual a otra persona que también está en el curso', () => {
            const alguien = crearEstudiante("Pepe");
            const otraPersona = crearEstudiante("Pepe");
            const curso = crearCursoCon(alguien, otraPersona);

            const cursoConUnaPersona = curso.cuando(sale(alguien));

            expect(cursoConUnaPersona.personas).toEqual([otraPersona]);
        });
    });

    describe('levantar la mano', () => {
        test('levanta la mano alguien que está en el curso', () => {
            const alguien = crearEstudiante("Pepe");
            const cursoConAlguien = crearCursoCon(alguien);

            const cursoConAlguienLevantandoLaMano = cursoConAlguien.cuando(levantaLaMano(alguien));

            expect(cursoConAlguienLevantandoLaMano.personas).toEqual([levantandoLaMano(alguien)]);
        });

        test('levanta la mano alguien que no esta en el curso', () => {
            const alguien = crearEstudiante("Pepe");
            const curso = crearCursoCon(alguien);
            const alguienFueraDelCurso = crearEstudiante("Marta");

            expect(curso.cuando(levantaLaMano(alguienFueraDelCurso))).toEqual(curso);
        });

        test('levanta la mano alguien que ya tenía la mano levantada', () => {
            const alguien = crearEstudiante("Pepe");
            const curso = crearCursoCon(levantandoLaMano(alguien));

            expect(curso.cuando(levantaLaMano(alguien))).toEqual(curso);
        });
    });

    describe('bajar la mano', () => {
        test('baja la mano alguien que está en el curso', () => {
            const alguien = crearEstudiante("Pepe");
            const cursoConAlguienLevantandoLaMano = crearCursoCon(levantandoLaMano(alguien));

            const cursoConAlguien = cursoConAlguienLevantandoLaMano.cuando(bajaLaMano(alguien));

            expect(cursoConAlguien.personas).toEqual([bajandoLaMano(alguien)]);
        });

        test('baja la mano alguien que no esta en el curso', () => {
            const alguien = crearEstudiante("Pepe");
            const curso = crearCursoCon(alguien);
            const alguienFueraDelCurso = crearEstudiante("Marta");

            expect(curso.cuando(bajaLaMano(alguienFueraDelCurso))).toEqual(curso);
        });

        test('baja la mano alguien que no tenía la mano levantada', () => {
            const alguien = crearEstudiante("Pepe");
            const curso = crearCursoCon(alguien);

            expect(curso.cuando(bajaLaMano(alguien))).toEqual(curso);
        });
    });

    test('distintos tipos de eventos con muchas personas', () => {
        const pepe = crearEstudiante("Pepe");
        const marta = crearEstudiante("Marta");
        const otroPepe = crearEstudiante("Pepe");
        const curso = crearCurso();

        const cursoFinal = curso.cuando(
            entra(pepe),
            entra(marta),
            entra(otroPepe),
            levantaLaMano(pepe),
            levantaLaMano(marta),
            bajaLaMano(otroPepe),
            sale(otroPepe),
            bajaLaMano(marta),
        );

        expect(cursoFinal.personas).toEqual([levantandoLaMano(pepe), bajandoLaMano(marta)]);
    });

    test('se actualiza el timestamp del curso luego de un evento', () => {
        const cursoVacio = crearCursoConTimestamp(new Date(100));
        const alguien = crearEstudiante("Pepe");

        const cursoAhora = cursoVacio.cuando(entra(alguien));

        expect(cursoAhora.timestamp.getTime()).toBeGreaterThan(cursoVacio.timestamp.getTime());
    });
});