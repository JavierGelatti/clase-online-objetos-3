import { Evento, Curso } from "../../model/curso";
import { serializarEvento, deserializarCurso } from "../../model/jsonCodecs";
import { esperar } from "../esperar";

export function enviarEvento(evento: Evento): Promise<Curso> {
  return fetch(`//${window.location.host}/evento`, {
    method: 'POST',
    body: serializarEvento(evento),
  }).then(response => {
      if (!response.ok) {
        console.error("Error al comunicarse con el servidor: ", response);
        return esperar(500).then(() => enviarEvento(evento));
      }

      return response.text().then(deserializarCurso);
  });
}
