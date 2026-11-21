const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

const read = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, 'data', f), 'utf8'));

app.get('/api/config', (req, res) => res.json(read('config.json')));

app.use(express.static(path.join(__dirname, 'public')));

if (require.main === module) {
  const port = process.env.PORT || 3002;
  app.listen(port, () => console.log(`Running on http://localhost:${port}`));
}
module.exports = app;
