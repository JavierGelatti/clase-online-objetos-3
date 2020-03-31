import React from 'react';
import VistaCurso from './VistaCurso';
import { crearEstudiante, crearCursoCon, levantandoLaMano } from '../model/curso';

export default function App() {
  const pepe = levantandoLaMano(crearEstudiante("Pepe Sánchez"));
  const marta = crearEstudiante("Marta Gómez");
  const mirta = crearEstudiante("Mirta Pérez");

  return (
    <div className="App">
      <VistaCurso usuarioActual={{...marta, esAdmin: true}} curso={crearCursoCon(mirta, pepe, marta)} />
    </div>
  );
}