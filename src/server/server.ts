import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';

const app = express();
const buildPath = path.join(__dirname, '..', '..', 'build')

app.use(express.static(buildPath));

app.get('/ping', (req, res) => res.send('pong'));

app.get('/', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(process.env.PORT || 8080);