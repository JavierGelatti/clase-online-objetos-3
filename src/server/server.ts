import express from 'express';
import path from 'path';
import expressWs from 'express-ws';
import * as Websocket from 'ws';
import { crearCurso, IdPersona, Evento, sale, saleAlguienConId } from '../model/curso';
import { serializarCurso, deserializarEvento } from '../model/jsonCodecs';

const app = expressWs(express()).app;
const puerto = process.env.PORT || 8080;

// Servir frontend
const frontendBuildPath = path.join(__dirname, '..', '..', 'build')
const frontendIndex = path.resolve(frontendBuildPath, 'index.html');
app.get('/', (req, res) => res.sendFile(frontendIndex));
app.get('/docente', (req, res) => res.sendFile(frontendIndex));
app.use(express.static(frontendBuildPath));

let curso = crearCurso();

// Websocket
type Conexion = { idPersona: IdPersona, websocket: Websocket, estaViva: boolean, esperandoPong: boolean };
let personasConectadas: Conexion[] = [];
app.ws('/ws/:idPersona', (ws, req) => {
  const conexion = { idPersona: req.params.idPersona, websocket: ws, estaViva: true, esperandoPong: false };
  personasConectadas.push(conexion);

  ws.on('pong', () => {
    conexion.estaViva = true;
    conexion.esperandoPong = false;
  });

  ws.on('close', () => {
    conexion.estaViva = false;
    recibirEvento(saleAlguienConId(conexion.idPersona));
  });

  const lala = setInterval(() => {
    if (conexion.estaViva && !conexion.esperandoPong) {
      conexion.esperandoPong = true;
      ws.ping();
    } else {
      if (conexion.estaViva) {
        conexion.estaViva = false;
        ws.terminate();
      }

      clearInterval(lala);
    }
  }, 5_000);

  ws.on('message', msg => {
    console.log(`Se recibió el mensaje ${msg}`);
    conexion.estaViva = true;

    try {
      recibirEvento(deserializarEvento(msg.toString()));
    } catch (error) {
      console.error(error);
    }
  });
  console.log('socket', req);

  function recibirEvento(evento: Evento) {
      curso = curso.cuando(evento);

      const estadoDelCurso = serializarCurso(curso);
      for (const conexion of personasConectadas) {
        conexion.websocket.send(estadoDelCurso);
      }
  }
});

app.listen(puerto);