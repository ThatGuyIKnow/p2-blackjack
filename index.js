
const express = require('express');
const app = express();
const port = process.env.PORT;

app.static(express.static('public'));

app.get("/", (req, res) => {
  app.send('index.html')
})

app.listen(port);
