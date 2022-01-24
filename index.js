const express = require("express");
const socket = require("socket.io");
const app = express();

app.use(express.static("public"));

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});

const socketServer = socket(server);
socketServer.on("connection", (socket) => {
  console.log("User Connected: ", socket.id);

  // Joining Room - Allowing upto 2 Users
  socket.on("join", (roomName) => {
    const allRooms = socketServer.sockets.adapter.rooms;
    const currentRoom = allRooms.get(roomName);
    if (!currentRoom) {
      socket.join(roomName);
      socket.emit("created");
    } else if (currentRoom.size === 1) {
      socket.join(roomName);
      socket.emit("joined");
    } else {
      socket.emit("full");
    }
    console.log(allRooms);
  });

  // Act when rooom full - Ready
  socket.on("ready", (roomName) => {
    console.log("Ready");
    socket.broadcast.to(roomName).emit("ready");
  });

  // Broadcast Candidate
  socket.on("candidate", (candidate, roomName) => {
    console.log("Candidate");
    console.log(candidate);
    socket.broadcast.to(roomName).emit("candidate", candidate);
  });

  // Broadcast Offer
  socket.on("offer", (offer, roomName) => {
    console.log("Offer");
    console.log(offer);
    socket.broadcast.to(roomName).emit("offer", offer);
  });

  // Broadcast Asnwer
  socket.on("answer", (answer, roomName) => {
    console.log("Answer");
    socket.broadcast.to(roomName).emit("answer", answer);
  });
});
