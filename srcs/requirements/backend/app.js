const express = require('express');
const cors = require('cors');
const mysqlConnect = require('./config/db');
const rabbitConnect = require('./config/rabbitmq');
const startConsume = require('./services/rabbitmqService');
const { getProblemHandler, getProblemSetHandler } = require('./handlers/problemHandlers');
const { submitCodeHandler, getCodeHandler } = require('./handlers/codeHandlers');
const { getResultsHandler } = require('./handlers/resultHandlers');
const { addUserHandler, getUserHandler } = require('./handlers/usersHandlers');
const { server: serverConfig } = require('./config/config');

const app = express();
const port = serverConfig.port;

app.use(cors({
  origin: 'http://frontend:3000/api'
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/problem/:id', getProblemHandler);
app.get('/problem-set', getProblemSetHandler);
app.get('/results', getResultsHandler);
app.get('/code/:id', getCodeHandler);
app.get('/users/:email', getUserHandler);
app.post('/submit', submitCodeHandler);
app.post('/users', addUserHandler);

(async () => {
  try {
    await mysqlConnect();
    await rabbitConnect();
    await startConsume(); // 메시지 소비 시작

    app.listen(port, () => {
      console.log(`Backend server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Error during initialization:', error);
    process.exit(1);
  }
})();
