require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const connectDB = require('./src/utils/db');
const path = require('path');
const bodyParser = require('body-parser');

connectDB();
app.use(cors());
app.use(express.json({ limit: '500mb' }));

app.use(bodyParser.json()); // For JSON data
app.use(bodyParser.urlencoded({ extended: true })); // For URL-encoded data

app.get('/', (req, res) => {
  const style = `display: flex; justify-content: center; align-items: center;
    height: 100vh; font-weight: bold; font-size: xxx-large;`;
  res.send(`<div style="${style}">DICTATION : API</div>`);
});
// app.use('/audio', express.static(path.join(__dirname, 'public/audio')));
// app.use('/pdf', express.static(path.join(__dirname, 'public/pdf')));

const routes = require('./src/routes');

app.use(routes);

app.use((req, res) => {
  res.status(404).json({
    status: -1,
    message: 'Request Not Found',
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
