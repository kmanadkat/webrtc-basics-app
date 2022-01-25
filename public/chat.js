const socket = io.connect("https://krupesh-web-rtc-demo.herokuapp.com", {
  secure: true,
});

// DOM elements
const videoChatLobby = document.getElementById("video-chat-lobby");
const videoChatRoom = document.getElementById("video-chat-room");
const roomInput = document.getElementById("roomName");
const joinButton = document.getElementById("join");
const userVideo = document.getElementById("user-video");
const peerVideo = document.getElementById("peer-video");

// Global Constants
let roomName = roomInput.value;
let roomCreator = false;
let rtcPeerConnection;
let currentUserStream;

// Stun Servers
const iceServers = {
  iceServers: [
    { urls: "stun:stun.services.mozilla.com" },
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

const onIceCandidateFunction = (eve) => {
  // debugger;
  if (eve.candidate) {
    // debugger;
    socket.emit("candidate", eve.candidate, roomName);
  }
};

// Triggered when receiving stream from peer
const onTrackFunction = (eve) => {
  peerVideo.srcObject = eve.streams[0];
  peerVideo.onloadedmetadata = (_) => {
    peerVideo.play();
  };
};

const disableUIItr = () => {
  roomInput.disabled = true;
  joinButton.disabled = true;
};

const getUserMedia = async () => {
  try {
    // Get user media
    currentUserStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
    });
    // Load Video Stream
    userVideo.srcObject = currentUserStream;
    userVideo.onloadedmetadata = (event) => {
      userVideo.play();
    };
  } catch (err) {
    throw new Error(err.message);
  }
};

// Join Button
joinButton.addEventListener("click", async (eve) => {
  roomName = roomInput.value;
  // Valid Rooom Name
  if (roomName === "") {
    alert("Room Name cannot be empty");
    return;
  }
  // Join Socket Server & provide room name
  socket.emit("join", roomName);
});

//
//
// New Room Created
socket.on("created", () => {
  try {
    getUserMedia().then((_) => {
      disableUIItr();
      roomCreator = true;
    });
  } catch (err) {
    alert(err.message);
  }
});

//
//
// Already Created Room Joiner
socket.on("joined", () => {
  try {
    getUserMedia().then((_) => {
      disableUIItr();
      roomCreator = false;
      // Emit Ready To Server
      socket.emit("ready", roomName);
    });
  } catch (err) {
    alert(err.message);
  }
});

//
//
// Room full - donot allow more users to join
socket.on("full", () => {
  alert("Room is full, can't join");
});

//
//
// When Peer has joined
socket.on("ready", () => {
  // debugger;
  if (roomCreator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    rtcPeerConnection.onicecandidate = onIceCandidateFunction;
    rtcPeerConnection.ontrack = onTrackFunction;

    // Send Media Streams (Audio & Video) to Peer
    rtcPeerConnection.addTrack(
      currentUserStream.getTracks()[0],
      currentUserStream
    );

    // Create Offer
    rtcPeerConnection
      .createOffer()
      .then((offer) => {
        rtcPeerConnection.setLocalDescription(offer);
        socket.emit("offer", offer, roomName);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

//
//
// For Peer i.e. Not Room Creator
socket.on("offer", (offer) => {
  // debugger;
  if (!roomCreator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    rtcPeerConnection.onicecandidate = onIceCandidateFunction;
    rtcPeerConnection.ontrack = onTrackFunction;

    // Set Incoming Offer as Remote Description
    rtcPeerConnection.setRemoteDescription(offer);

    // Send Media Streams (Audio & Video) to Peer
    rtcPeerConnection.addTrack(
      currentUserStream.getTracks()[0],
      currentUserStream
    );

    // Create Answer
    rtcPeerConnection
      .createAnswer()
      .then((answer) => {
        rtcPeerConnection.setLocalDescription(answer);
        socket.emit("answer", answer, roomName);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

//
//
// Add Ice Candidate of Peer
socket.on("candidate", (candidate) => {
  const iceCandidate = new RTCIceCandidate(candidate);
  rtcPeerConnection.addIceCandidate(iceCandidate);
});

//
//
// Set Incoming Answer as Remote Description
socket.on("answer", (answer) => {
  rtcPeerConnection.setRemoteDescription(answer);
});
