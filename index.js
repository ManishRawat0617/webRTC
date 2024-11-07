// let port = process.env.PORT || 5000;

// let IO = require("socket.io")(port, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// IO.use((socket, next) => {
//   if (socket.handshake.query) {
//     let callerId = socket.handshake.query.callerId;
//     socket.user = callerId;
//     next();
//   }
// });

// IO.on("connection", (socket) => {
//   console.log(socket.user, "Connected");
//   socket.join(socket.user);

//   socket.on("makeCall", (data) => {
//     let calleeId = data.calleeId;
//     let sdpOffer = data.sdpOffer;

//     socket.to(calleeId).emit("newCall", {
//       callerId: socket.user,
//       sdpOffer: sdpOffer,
//     });
//   });

//   socket.on("answerCall", (data) => {
//     let callerId = data.callerId;
//     let sdpAnswer = data.sdpAnswer;

//     socket.to(callerId).emit("callAnswered", {
//       callee: socket.user,
//       sdpAnswer: sdpAnswer,
//     });
//   });

//   socket.on("IceCandidate", (data) => {
//     let calleeId = data.calleeId;
//     let iceCandidate = data.iceCandidate;

//     socket.to(calleeId).emit("IceCandidate", {
//       sender: socket.user,
//       iceCandidate: iceCandidate,
//     });
//   });
// });

const port = process.env.PORT || 5000;
const IO = require("socket.io")(port, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

IO.use((socket, next) => {
  const callerId = socket.handshake.query?.callerId;
  if (callerId) {
    socket.user = callerId;
    next();
  } else {
    next(new Error("Invalid caller ID"));
  }
});

IO.on("connection", (socket) => {
  console.log(`User ${socket.user} connected`);
  socket.join(socket.user);

  // Handle making a call
  socket.on("makeCall", (data) => {
    const { calleeId, sdpOffer } = data;
    console.log(`Call initiated by ${socket.user} to ${calleeId}`);

    socket.to(calleeId).emit("newCall", {
      callerId: socket.user,
      sdpOffer: sdpOffer,
    });
  });

  // Handle answering a call
  socket.on("answerCall", (data) => {
    const { callerId, sdpAnswer } = data;
    console.log(`${socket.user} answered the call from ${callerId}`);

    socket.to(callerId).emit("callAnswered", {
      callee: socket.user,
      sdpAnswer: sdpAnswer,
    });
  });

  // Handle ICE candidate exchange
  socket.on("IceCandidate", (data) => {
    const { calleeId, iceCandidate } = data;
    console.log(`${socket.user} is sending an ICE candidate to ${calleeId}`);

    socket.to(calleeId).emit("IceCandidate", {
      sender: socket.user,
      iceCandidate: iceCandidate,
    });
  });

  // Handle user disconnect
  socket.on("disconnect", (reason) => {
    console.log(`User ${socket.user} disconnected: ${reason}`);
  });

  // Handle errors
  socket.on("error", (err) => {
    console.error(`Socket error for user ${socket.user}:`, err);
  });
});

console.log(`Socket.IO server running on port ${port}`);
