const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
app.set("trust proxy", 1);

const server = http.createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const PORT = process.env.PORT || process.env.BACKEND_PORT || 5000;
const uploadsDir = path.join(__dirname, "uploads");

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(express.json());

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use("/uploads", express.static(uploadsDir));

// Health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "Backend is running" });
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE) || 5242880,
  },
  fileFilter: (req, file, cb) => {
    const allowedExt = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const allowedMime = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    const ext = path.extname(file.originalname).toLowerCase();
    const isExtOk = allowedExt.includes(ext);
    const isMimeOk = allowedMime.includes(file.mimetype);

    if (isExtOk && isMimeOk) {
      return cb(null, true);
    }

    cb(new Error("Only image files are allowed"));
  },
});

// File upload endpoint
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const baseUrl =
    process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

  res.json({
    url: `${baseUrl}/uploads/${req.file.filename}`,
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

      tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...data,
        id: tasks[taskIndex].id,
      };

      io.emit("task:updated", tasks[taskIndex]);
      callback?.({ success: true, task: tasks[taskIndex] });
    } catch (error) {
      console.error("Error updating task:", error);
      callback?.({ success: false, error: error.message });
    }
  });

  // Task move event
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

  // Sync request
  socket.on("sync:request", (callback) => {
    callback?.({ tasks });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Test helper endpoint for E2E only
if (process.env.NODE_ENV !== "production") {
  app.post("/api/test/reset", (req, res) => {
    tasks = [];
    taskIdCounter = 1;

    io.emit("sync:tasks", { tasks });

    for (const socket of io.sockets.sockets.values()) {
      socket.disconnect(true);
    }

    return res.json({ success: true });
  });
}

// Multer / upload error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }

  if (err) {
    return res.status(400).json({ error: err.message || "Something went wrong" });
  }

  next();
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL configured as: ${FRONTEND_URL}`);
});