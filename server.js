const express = require("express");
const app = express();
const server = require("http").createServer(app);
require("./socket")(server);

app.use(express.static("public"));

server.listen(process.env.PORT, () => {
    console.log("server listening on " + process.env.PORT);
});