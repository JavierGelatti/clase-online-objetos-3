import { esperar } from "../esperar";
import { deserializarCurso } from "../../model/jsonCodecs";
import { Curso } from "../../model/curso";

export async function consultarEstadoCurso(): Promise<Curso> {
    const response = await fetch(`//${window.location.host}/curso`);

    if (!response.ok) {
        console.error("Error al comunicarse con el servidor: ", response);
        return esperar(1_000).then(() => consultarEstadoCurso());
    }

    return deserializarCurso(await response.text());
}
