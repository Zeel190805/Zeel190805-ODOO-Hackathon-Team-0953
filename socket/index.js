// This file should be run as a separate Node.js server.
// You can deploy it on services like Render or Fly.io.
// Example command: `node socket/index.js`

const { Server } = require("socket.io")

const io = new Server(3001, {
  cors: {
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST"],
  },
})

console.log("Socket.IO server running on port 3001")

let users = []

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) && users.push({ userId, socketId })
}

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId)
}

const getUser = (userId) => {
  return users.find((user) => user.userId === userId)
}

io.on("connection", (socket) => {
  // When a user connects
  console.log(`A user connected: ${socket.id}`)
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id)
    io.emit("getUsers", users)
    console.log("Current users:", users)
  })

  // Send and get message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId)
    if (user) {
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text,
      })
      console.log(`Message sent from ${senderId} to ${receiverId}`)
    } else {
      console.log(`User ${receiverId} not found or not connected.`)
    }
  })

  // Send swap request notification
  socket.on("sendSwapNotification", ({ senderName, receiverId }) => {
    const receiver = getUser(receiverId)
    if (receiver) {
      io.to(receiver.socketId).emit("getSwapNotification", {
        senderName,
        message: `${senderName} has sent you a swap request!`,
      })
      console.log(`Notification sent to ${receiverId}`)
    }
  })

  // When a user disconnects
  socket.on("disconnect", () => {
    console.log(`A user disconnected: ${socket.id}`)
    removeUser(socket.id)
    io.emit("getUsers", users)
  })
})
