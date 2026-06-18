# 📋 WebSocket-Powered Kanban Board

**A real-time, collaborative task management application built with React, Node.js, and WebSockets.**

---

## 📖 Project Overview

I have implemented a fully functional **WebSocket-powered Kanban Board** that enables real-time task synchronization across multiple clients. The application allows users to create, update, move, and delete tasks across three workflow columns (To Do, In Progress, Done) with support for file uploads, priority/category assignment, and live progress visualization.

### ✨ Key Features Implemented

- **Real-time Task Synchronization**: Instant updates across all connected clients using Socket.IO WebSockets
- **Interactive Drag-and-Drop**: Seamlessly move tasks between columns using `@hello-pangea/dnd`
- **Task Metadata Management**: Priority levels (Low, Medium, High) and categories (Bug, Feature, Enhancement)
- **File Upload Support**: Upload and display images with tasks; files are stored on the backend
- **Progress Dashboard**: Real-time charts showing task distribution and completion percentage
- **Responsive UI**: Clean, modern interface with visual feedback for all interactions
- **Comprehensive Testing**: Unit tests, integration tests, and end-to-end tests using Vitest, React Testing Library, and Playwright

---

## 🏗 Architecture

### Frontend Architecture
```
KanbanBoard.jsx (Main Component)
├── TaskForm.jsx (Create new tasks)
├── TaskColumn.jsx × 3 (To Do, In Progress, Done)
│   └── TaskCard.jsx (Individual task display)
└── ProgressChart.jsx (Real-time statistics)
```

### Backend Architecture
```
Express Server (Port 5000)
├── Socket.IO Event Handlers
│   ├── task:create
│   ├── task:update
│   ├── task:move
│   ├── task:delete
│   └── sync:tasks
├── File Upload Endpoint (/api/upload)
└── In-Memory Task Storage
```

---

## 🎯 Features Implemented

### 1. Task Management
- **Create Tasks**: Users can fill a form with title, description, priority, category, and optional image
- **Update Tasks**: Tasks are updated in real-time via Socket.IO events
- **Move Tasks**: Drag-and-drop interface to move tasks between columns
- **Delete Tasks**: Remove tasks with confirmation dialog

### 2. Priority & Category System
- **Priorities**: Low, Medium (default), High
- **Categories**: Bug, Feature (default), Enhancement
- Implemented using `react-select` for smooth dropdown experience
- Visual badges on task cards showing priority color and category

### 3. File Upload
- Upload images to associate with tasks
- Images stored on backend (uploads folder)
- Full preview in task card
- Validation: only image files, 5MB size limit

### 4. Progress Dashboard
- **Real-time Metrics**: Total tasks, completed tasks, completion percentage
- **Column Distribution Chart**: Bar chart showing tasks per column
- **Priority Distribution**: Line chart showing task distribution by priority
- **Progress Bar**: Visual representation of completion percentage

### 5. WebSocket Real-time Sync
- Instant synchronization across all connected clients
- New clients receive full task list on connection
- All changes broadcast to connected clients
- Connection status indicator

---

## 🛠 Tech Stack

### Frontend
- **React 19**: UI framework
- **Vite**: Build tool and dev server
- **Socket.IO Client**: WebSocket communication
- **@hello-pangea/dnd**: Drag-and-drop functionality
- **react-select**: Dropdown selection
- **Recharts**: Data visualization

### Backend
- **Node.js**: Runtime
- **Express**: HTTP server
- **Socket.IO**: WebSocket server
- **Multer**: File upload handling
- **dotenv**: Environment configuration

### Testing
- **Vitest**: Unit and integration testing framework
- **React Testing Library**: Component testing utilities
- **@testing-library/user-event**: User interaction simulation
- **Playwright**: End-to-end browser testing

---

## 📋 Project Structure

```
websocket-kanban-vitest-playwright-2026-main/
├── backend/
│   ├── server.js                    # Express + Socket.IO server
│   ├── package.json                 # Backend dependencies
│   ├── .env                         # Environment variables (to be filled)
│   └── .env.example                 # Environment template
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── KanbanBoard.jsx      # Main board component
│   │   │   ├── TaskForm.jsx         # Task creation form
│   │   │   ├── TaskCard.jsx         # Individual task card
│   │   │   ├── TaskColumn.jsx       # Column wrapper with droppable
│   │   │   └── ProgressChart.jsx    # Progress dashboard
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   │   └── KanbanBoard.test.jsx
│   │   │   ├── integration/
│   │   │   │   └── WebSocketIntegration.test.jsx
│   │   │   └── e2e/
│   │   │       └── KanbanBoard.e2e.test.js
│   │   ├── App.jsx                  # Root app component
│   │   ├── main.jsx                 # React entry point
│   │   └── setupTests.js            # Test configuration
│   ├── vite.config.js               # Vite + Vitest config
│   ├── playwright.config.js         # Playwright config
│   ├── package.json                 # Frontend dependencies
│   └── index.html                   # HTML template
│
└── README.md                        # This file
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 16+ and npm installed
- Two terminal windows for backend and frontend

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Edit `.env` file (already created with defaults):
   ```env
   BACKEND_PORT=5000
   FRONTEND_URL=http://localhost:5173
   UPLOAD_DIR=uploads
   MAX_FILE_SIZE=5242880
   ```

4. **Start backend server:**
   ```bash
   npm start
   ```
   Or with auto-reload (requires nodemon):
   ```bash
   npm run dev
   ```

   Expected output: `Server running on port 5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start frontend dev server:**
   ```bash
   npm run dev
   ```

   Expected output: Server running on `http://localhost:5173`

4. **Open in browser:**
   Navigate to `http://localhost:5173`

---

## 🧪 How to Run Tests

### Unit & Integration Tests (Vitest)

From the `frontend` directory:

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch
```

**Tests Included:**
- KanbanBoard component rendering
- TaskCard display and interactions
- TaskForm submission logic
- Progress chart calculations
- WebSocket integration
- Drag-and-drop handling
- File upload functionality

### End-to-End Tests (Playwright)

From the `frontend` directory:

**Prerequisites:**
1. Ensure backend is running on port 5000
2. Ensure frontend is running on port 5173

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test src/tests/e2e/KanbanBoard.e2e.test.js
```

**E2E Tests Cover:**
- Task creation and display
- Drag-and-drop between columns
- Task deletion with confirmation
- Priority and category selection
- File upload and image preview
- Real-time synchronization
- Progress metrics display
- Empty state handling
- Form validation

### Test Results

All tests should pass:
- ✅ Vitest: Unit & Integration tests
- ✅ Playwright: E2E tests

---

## 💻 How to Use the Application

### Creating a Task
1. Fill in the **Task Title** (required)
2. Add optional **Description**
3. Select **Priority** (default: Medium)
4. Select **Category** (default: Feature)
5. Optionally upload an **Image**
6. Click **Create Task**

### Managing Tasks
- **Drag to Move**: Click and drag a task card to move it between columns
- **View Priority**: Color-coded badges on each task (Red=High, Yellow=Medium, Green=Low)
- **View Category**: Light-colored badges showing Bug/Feature/Enhancement
- **Delete**: Click the Delete button on a task and confirm

### Monitoring Progress
- **Task Counts**: Column headers show real-time task counts
- **Completion %**: Dashboard shows percentage of tasks in Done column
- **Charts**: Bar chart shows task distribution, Line chart shows priority distribution
- **Progress Bar**: Visual indicator of completion status

### Real-time Sync
- Open the app in multiple browser windows
- Create/move/delete tasks in one window
- See updates instantly in all other windows
- Connection status shown in top-left (🟢 Connected)

---

## 📊 API & Events

### Socket.IO Events

#### Client → Server Events
- `task:create` - Create a new task
- `task:update` - Update task details
- `task:move` - Move task to different column
- `task:delete` - Delete a task
- `sync:request` - Request full task list

#### Server → Client Events
- `sync:tasks` - Receive all tasks (on connection)
- `task:created` - Broadcast new task
- `task:updated` - Broadcast task update
- `task:moved` - Broadcast task movement
- `task:deleted` - Broadcast task deletion

### HTTP Endpoints

- `POST /api/upload` - Upload image file
  - Returns: `{ url: string, filename: string }`
  - Accepts: Only image files, max 5MB

---

## 🧪 Test Coverage

### Unit Tests (Vitest)
- ✅ KanbanBoard component rendering
- ✅ Column display and headers
- ✅ Task form validation
- ✅ Progress chart metrics
- ✅ Connection status display

### Integration Tests (Vitest + RTL)
- ✅ Socket.IO connection initialization
- ✅ Task creation and form reset
- ✅ Drag-and-drop preparation
- ✅ Component interaction flows
- ✅ Priority and category selection
- ✅ Error handling

### E2E Tests (Playwright)
- ✅ Task creation with all fields
- ✅ Drag-and-drop between columns
- ✅ Task deletion with confirmation
- ✅ Priority and category assignment
- ✅ File upload and display
- ✅ Real-time updates across tabs
- ✅ Empty state display
- ✅ Progress calculations
- ✅ Form validation
- ✅ Connection status handling

---

## 🔧 Implementation Highlights

### 1. Real-time Synchronization
- Socket.IO with automatic reconnection
- Full task sync on new client connection
- Broadcast model for all updates
- Error callbacks for user feedback

### 2. Drag-and-Drop
- Built with `@hello-pangea/dnd` library
- Intuitive visual feedback during drag
- Automatic Socket.IO event emission on drop
- Smooth transitions

### 3. Form Management
- React hooks for form state
- Real-time validation
- File upload with backend processing
- Form reset after successful submission

### 4. Progress Visualization
- Real-time metrics calculation
- Responsive chart layouts
- Color-coded progress indicators
- Key metrics displayed prominently

### 5. Testing Strategy
- Mock Socket.IO for unit tests
- Real DOM testing with React Testing Library
- End-to-end browser automation with Playwright
- Comprehensive data-testid attributes for testing

---

## 📝 Known Limitations & Future Improvements

### Current Limitations
1. **In-Memory Storage**: Tasks are lost on server restart (consider MongoDB for persistence)
2. **Single User Deletion**: No role-based access control (anyone can delete any task)
3. **No Task Editing UI**: Updates only through Socket.IO events
4. **File Storage**: Uploads stored locally (consider cloud storage like AWS S3)
5. **No Authentication**: No user identification for tasks

### Future Improvements
1. **MongoDB Integration**: Persist tasks to database
2. **User Authentication**: Add login/registration system
3. **Task Assignment**: Assign tasks to specific users
4. **Comments**: Add discussion threads to tasks
5. **Activity Log**: Track all task changes
6. **Archive**: Move completed tasks to archive
7. **Search/Filter**: Find tasks by title, priority, category
8. **Notifications**: Alert users of task updates
9. **Cloud Storage**: Upload files to S3 or similar
10. **Mobile Support**: Responsive design for mobile devices

---

## 🐛 Troubleshooting

### Backend won't connect
- Ensure backend is running: `npm start` in `/backend`
- Check port 5000 is available
- Verify `.env` file has correct `FRONTEND_URL`

### Frontend can't connect to backend
- Check both servers are running
- Verify `http://localhost:5000` is accessible
- Check browser console for CORS errors
- Confirm Socket.IO client is installed

### Tests failing
- Ensure all dependencies installed: `npm install`
- For E2E: verify both backend and frontend are running
- Clear test cache: `npm test -- --clearCache`
- Check port 5173 is available

### Images not uploading
- Check `/backend/uploads` directory exists
- Verify file is valid image format
- Confirm file size < 5MB
- Check backend logs for upload errors

---

## 👤 Author

**Aparna**

This project represents a complete implementation of a real-time WebSocket-powered task management system, demonstrating proficiency in:
- Modern React development with hooks and component composition
- Real-time WebSocket communication with Socket.IO
- Comprehensive testing with Vitest, React Testing Library, and Playwright
- Backend API design with Express and file handling
- UI/UX design with drag-and-drop and data visualization
- DevOps with environment configuration and deployment readiness

---

## 📄 License

This project is provided as-is for educational and evaluation purposes.

---

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- React community for excellent libraries and documentation
- Vitest team for amazing testing experience
- Playwright for reliable E2E testing

---

**Last Updated**: 2026-06-15  
**Status**: ✅ Fully Implemented & Tested
