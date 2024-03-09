const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("call ended");
  });

  socket.on("call-user", (data) => {
    console.log(data,"data")
    io.to(data.userToCall).emit("call-user", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on("call-answer", (data) => {
    console.log(data ,"28")
    io.to(data.to).emit("call-accepted", data);
  });

  socket.on("msg",(data)=>{
    console.log(data,"msg")
    io.to(data.to).emit("msg", data);
  })
});

server.listen(8000, () => console.log("server is running on port 8000"));
