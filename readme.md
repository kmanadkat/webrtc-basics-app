## WebRTC Based Video Chat App

Through this project I aimed to learn basics of WebRTC. Here signaling server is made with Web Sockets. Following is the sequence flow of applciation:

### Sockets Cheat Sheet - Server

```js
// sending back to the sender
socket.emit("hello", "can you hear me?", 1, 2, "abc");

// sending to all clients in 'game' room EXCEPT sender
socket.to("game").emit("nice game", "let's play a game");
```

### Sockets Cheat Sheet - Client

```js
// Send to the server
socket.emit("hello", msg);
```

1. User 1 - Creates a Room with WebSockets -> Emitted "created" by Server -> Received by User 1 (emit) -> Turns on Self Media
2. User 2 - Joins the room -> Emitted "joined" by Server -> Received by User 2 (emit) -> Turns on Self Media -> Sends "ready" to server
3. User 1 - Receives "ready" from server -> Gets IP/UDP address from STUN server, add media tracks info & forms OFFER -> Sends "offer" to server
4. User 2 - Receives ICE Candidate (User 1)
5. User 2 - Receives "offer" from server containing User 1 Offer -> Gets IP/UDP address from STUN server, add media tracks info, accepts Offer as remote description & forms ANSWER -> Sends "answer" to server
6. User 1 - Receives ICE Candidate (User 2)
7. User 1 - Receives "answer" from server -> accepts answer as remote description & peer video stream is visible
