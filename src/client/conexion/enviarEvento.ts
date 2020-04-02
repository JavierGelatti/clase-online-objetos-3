import { Evento, Curso } from "../../model/curso";
import { serializarEvento, deserializarCurso } from "../../model/jsonCodecs";
import { esperar } from "../esperar";

export async function enviarEvento(evento: Evento): Promise<Curso> {
    const response = await fetch(`//${window.location.host}/evento`, {
        method: 'POST',
        body: serializarEvento(evento),
    });

    if (!response.ok) {
        console.error("Error al comunicarse con el servidor: ", response);
        return esperar(1_000).then(() => enviarEvento(evento));
    }

    return deserializarCurso(await response.text());
}
