
const express = require('express');
const app = express();
const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send({
      "first": "jason",
      "last": "bourne"
  })
})

app.listen(port);
