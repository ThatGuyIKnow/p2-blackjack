/*const http = require('http');

const server = http.createServer((request, response) => {
    response.writeHead(200, {
        "Content-Type": "text/plain"
    });
    response.end("Umu");
});

const port = process.env.PORT || 1337;
server.listen(port);

console.log("Server running at http://localhost:%d", port);
*/

const express = require('express');
const app = express();
const port = 8080;

app.get('/', function (req, res) {
    res.send('Hello World!')
})

app.listen(port, () => console.log(`Example app listening at port:${port}`));
