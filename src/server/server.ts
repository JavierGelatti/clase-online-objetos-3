import express from 'express';
import path from 'path';
import expressWs from 'express-ws';
import * as Websocket from 'ws';
import { crearCurso } from '../model/curso';
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
type Conexion = { websocket: Websocket, estaViva: boolean };
let personasConectadas: Conexion[] = [];
app.ws('/', (ws, req) => {
  const conexion = { websocket: ws, estaViva: true };
  personasConectadas.push(conexion);

  ws.on('pong', () => {
    conexion.estaViva = true;
  });

  ws.on('close', () => {
    conexion.estaViva = false;
  });

  const lala = setInterval(() => {
    if (conexion.estaViva) {
      conexion.estaViva = false;
      ws.ping();
    } else {
      ws.terminate();
      clearInterval(lala);
    }
  }, 5_000);

  ws.on('message', msg => {
    console.log(`Se recibió el mensaje ${msg}`);
    conexion.estaViva = true;

    try {
      const evento = deserializarEvento(msg.toString());
      curso = curso.cuando(evento);
      const respuesta = serializarCurso(curso);
      console.log('respuesta', respuesta);

      personasConectadas
        .filter(c => c.estaViva)
        .forEach(c => c.websocket.send(respuesta));
    } catch (error) {
      console.error(error);
    }
  });
  console.log('socket', req);
});

app.listen(puerto);