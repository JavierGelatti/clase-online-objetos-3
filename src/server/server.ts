import express from 'express';
import path from 'path';
import expressWs from 'express-ws';
import * as Websocket from 'ws';
import { OPEN } from 'ws';
import { crearCurso, IdPersona, Evento, saleAlguienConId } from '../model/curso';
import { serializarCurso, deserializarEvento } from '../model/jsonCodecs';
import bodyParser from 'body-parser';

const app = expressWs(express()).app;
const puerto = process.env.PORT || 8080;

// Servir frontend
const frontendBuildPath = path.join(__dirname, '..', '..', 'build')
const frontendIndex = path.resolve(frontendBuildPath, 'index.html');
for (const ruta of [ '/', '/docente', '/stream' ]) {
  app.get(ruta, (req, res) => res.sendFile(frontendIndex));
}
app.use(express.static(frontendBuildPath));

let curso = crearCurso();

// Eventos
app.use(bodyParser.text());
app.post('/evento', (req, res) => {
  console.log('Se recibió el evento', req.body);

  try {
    const evento = deserializarEvento(req.body);
    recibirEvento(evento);

    res.end(
      serializarCurso(curso),
      difundirEstadoDelCurso
    );
  } catch (error) {
    console.error(error);
  }
});

// Pedir el estado del curso
app.get('/curso', (req, res) => {
  res.send(serializarCurso(curso));
});

// Websocket
type Conexion = { idPersona: IdPersona, websocket: Websocket, estaViva: boolean, esperandoPong: boolean };
let personasConectadas: Conexion[] = [];
app.ws('/:idPersona', (ws, req) => {
  const conexion = { idPersona: req.params.idPersona, websocket: ws, estaViva: true, esperandoPong: false };
  personasConectadas.push(conexion);

  ws.on('pong', () => {
    conexion.estaViva = true;
    conexion.esperandoPong = false;
  });

  ws.on('close', () => {
    conexion.estaViva = false;
    recibirEvento(saleAlguienConId(conexion.idPersona));
    difundirEstadoDelCurso();
  });

  const heartbeat = setInterval(() => {
    if (!conexion.estaViva) {
      clearInterval(heartbeat);
      return;
    }

    if (!conexion.esperandoPong) {
      conexion.esperandoPong = true;
      ws.ping();
    } else {
      conexion.estaViva = false;
      ws.terminate();
      clearInterval(heartbeat);
    }
  }, 5_000);
});

function recibirEvento(evento: Evento) {
  curso = curso.cuando(evento);
}

function difundirEstadoDelCurso() {
  const estadoDelCurso = serializarCurso(curso);

  personasConectadas = personasConectadas.filter(c => c.estaViva);
  for (const conexion of personasConectadas) {
    // El websocket puede estar en estado "CLOSING", pero conexion.estaViva === true :(
    if (conexion.websocket.readyState === OPEN) {
      conexion.websocket.send(estadoDelCurso);
    }
  }
}

app.listen(puerto);