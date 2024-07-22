const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors()); // CORS 설정

app.get('/message', (req, res) => {
    console.log("요청 들어옴");
  res.json({ message: 'Hello from the backend!' });
});

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});
