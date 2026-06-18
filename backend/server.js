const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(express.json());
app.use(express.static("uploads"));

// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: process.env.MAX_FILE_SIZE || 5242880 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = allowed.test(file.mimetype);
    if (mime) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// File upload endpoint
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.json({
    url: `http://localhost:${process.env.BACKEND_PORT || 5000}/${req.file.filename}`,
    filename: req.file.filename,
  });
});

// In-memory task storage
let tasks = [];
let taskIdCounter = 1;

// Helper functions
const generateTaskId = () => taskIdCounter++;
const findTaskById = (id) => tasks.find((t) => t.id === id);
const findTaskIndex = (id) => tasks.findIndex((t) => t.id === id);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Send initial task list to newly connected client
  socket.emit("sync:tasks", { tasks });

  // Task creation event
  socket.on("task:create", (data, callback) => {
    try {
      const newTask = {
        id: generateTaskId(),
        title: data.title || "Untitled",
        description: data.description || "",
        status: data.status || "todo",
        priority: data.priority || "medium",
        category: data.category || "feature",
        fileUrl: data.fileUrl || null,
        fileName: data.fileName || null,
        createdAt: new Date().toISOString(),
      };
      tasks.push(newTask);
      // Broadcast to all clients
      io.emit("task:created", newTask);
      callback?.({ success: true, task: newTask });
    } catch (error) {
      console.error("Error creating task:", error);
      callback?.({ success: false, error: error.message });
    }
  });

  // Task update event
  socket.on("task:update", (data, callback) => {
    try {
      const taskIndex = findTaskIndex(data.id);
      if (taskIndex === -1) {
        callback?.({ success: false, error: "Task not found" });
        return;
      }
      tasks[taskIndex] = { ...tasks[taskIndex], ...data };
      io.emit("task:updated", tasks[taskIndex]);
      callback?.({ success: true, task: tasks[taskIndex] });
    } catch (error) {
      console.error("Error updating task:", error);
      callback?.({ success: false, error: error.message });
    }
  });

  // Task move event (change status)
  socket.on("task:move", (data, callback) => {
    try {
      const taskIndex = findTaskIndex(data.taskId);
      if (taskIndex === -1) {
        callback?.({ success: false, error: "Task not found" });
        return;
      }
      tasks[taskIndex].status = data.newStatus;
      io.emit("task:moved", {
        taskId: data.taskId,
        newStatus: data.newStatus,
        task: tasks[taskIndex],
      });
      callback?.({ success: true, task: tasks[taskIndex] });
    } catch (error) {
      console.error("Error moving task:", error);
      callback?.({ success: false, error: error.message });
    }
  });

  // Task delete event
  socket.on("task:delete", (data, callback) => {
    try {
      const taskIndex = findTaskIndex(data.id);
      if (taskIndex === -1) {
        callback?.({ success: false, error: "Task not found" });
        return;
      }
      const deletedTask = tasks[taskIndex];
      tasks.splice(taskIndex, 1);
      io.emit("task:deleted", { id: data.id });
      callback?.({ success: true, task: deletedTask });
    } catch (error) {
      console.error("Error deleting task:", error);
      callback?.({ success: false, error: error.message });
    }
  });

  // Sync request event (client explicitly requests full sync)
  socket.on("sync:request", (callback) => {
    callback?.({ tasks });
  });

  // Disconnect event
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.BACKEND_PORT || 5000;
// Test helper endpoints (for E2E test isolation)
app.post('/api/test/reset', (req, res) => {
  tasks = [];
  taskIdCounter = 1;
  // Broadcast cleared tasks to all connected clients so they update their state
  io.emit('sync:tasks', { tasks });
  // Disconnect all clients to ensure a clean Socket.IO reconnect and avoid stale local state
  for (const socket of io.sockets.sockets.values()) {
    socket.disconnect(true);
  }
  // Optionally remove uploaded files for a clean state
  // NOTE: keep it simple to avoid accidental deletions in production
  return res.json({ success: true });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL configured as: ${process.env.FRONTEND_URL}`);
});
