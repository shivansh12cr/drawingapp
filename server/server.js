
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.static("./client")); 

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("draw", (data) => {
    socket.broadcast.emit("draw", data);
  });

  socket.on("clear", () => {
    socket.broadcast.emit("clear");
  });
  socket.on("undo", () => {
    socket.broadcast.emit("undo");
  });
  socket.on("redo", () => {
    socket.broadcast.emit("redo");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5500;
httpServer.listen(PORT, "0.0.0.0", () => 
  console.log(` Server running on port ${PORT}`)
);
