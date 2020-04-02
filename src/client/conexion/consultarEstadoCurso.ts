import { esperar } from "../esperar";
import { deserializarCurso } from "../../model/jsonCodecs";
import { Curso } from "../../model/curso";

export function consultarEstadoCurso(): Promise<Curso> {
  return fetch(`//${window.location.host}/curso`).then(response => {
      if (!response.ok) {
        console.error("Error al comunicarse con el servidor: ", response);
        return esperar(500).then(() => consultarEstadoCurso());
      }

      return response.text().then(deserializarCurso);
  });
}
