import { crearEstudiante, Persona, Curso, entra, bajaLaMano, levantaLaMano, crearDocente, IdPersona, Evento } from '../../model/curso';
import { SincronizadorCurso } from './SincronizadorCurso';
import { enviarEvento } from './enviarEvento';

type ObservadorCurso = (usuarioActual: Persona, curso: Curso) => void;

export class ClaseRemota {
  private readonly idUsuarioActual: IdPersona;
  private _onChange: ObservadorCurso;
  curso: Curso;

  static async conectarseComo(nombre: string, esDocente: boolean): Promise<ClaseRemota> {
    const usuarioActual = esDocente ? crearDocente(nombre) : crearEstudiante(nombre);
    // Este curso debería contener al usuario actual
    const curso = await enviarEvento(entra(usuarioActual));

    const cursoRemoto = new ClaseRemota(usuarioActual.id, curso);

    new SincronizadorCurso({
        idConexion: usuarioActual.id,
        onUpdate: cursoActual => {
            cursoRemoto.notificarCambio(cursoActual);
        },
    }).iniciar();

    return cursoRemoto;
  }

  constructor(idUsuarioActual: IdPersona, curso: Curso) {
    this.curso = curso;
    this.idUsuarioActual = idUsuarioActual;
    this._onChange = curso => {};
  }

  private notificarCambio(cursoActual: Curso) {
    // No actualizamos nada si lo que recibimos es más viejo que lo que tenemos
    if (cursoActual.timestamp < this.curso.timestamp) return;

    // Nos aseguramos de que el usuario actual esté en el curso
    if (!cursoActual.contieneA(this.usuarioActual)) {
        this.enviarEvento(entra(this.usuarioActual));
        return;
    }

    this.curso = cursoActual;
    this._onChange(this.usuarioActual, this.curso);
  }

  get usuarioActual() {
    return this.curso.personaIdentificadaCon(this.idUsuarioActual)!;
  }

  set onChange(callback: ObservadorCurso) {
    this._onChange = callback;
    this._onChange(this.usuarioActual, this.curso);
  }

  levantarLaMano() {
    return enviarEvento(levantaLaMano(this.usuarioActual));
  }

  bajarLaMano() {
    return enviarEvento(bajaLaMano(this.usuarioActual));
  }

  bajarleLaManoA(unaPersona: Persona) {
    return enviarEvento(bajaLaMano(unaPersona));
  }

  enviarEvento(evento: Evento) {
    enviarEvento(evento).then(cursoActual => this.notificarCambio(cursoActual));
  }
}
