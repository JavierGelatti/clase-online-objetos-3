import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import VistaStream from './VistaStream';

const esDocente = window.location.pathname === '/docente';
const esStream = window.location.pathname === '/stream';

ReactDOM.render(
  <React.StrictMode>
    { esStream ? <VistaStream /> : <App esDocente={esDocente} /> }
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
